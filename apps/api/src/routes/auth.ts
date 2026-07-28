import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db.js";
import { users, customers, refreshTokens, passwordResets, emailVerifications } from "@remotefix/database";
import { LoginSchema, RegisterSchema } from "@remotefix/types";
import { hashPassword, verifyPassword, signJWT, generateRandomToken, hashToken } from "@remotefix/auth";
import { requireAuth, AppEnv } from "../middleware/auth.js";
import { sendEmail, EmailTemplates } from "../services/emailService.js";

const authRouter = new Hono<AppEnv>();

// Helper to issue access & refresh token pair
async function issueTokenPair(db: any, user: { id: string; email: string; role: string }, secret: string, reqInfo?: { userAgent?: string; ip?: string }) {
  // Short-lived access token (1 hour)
  const accessToken = await signJWT(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    },
    secret
  );

  // Long-lived refresh token (30 days)
  const rawRefreshToken = generateRandomToken(40);
  const tokenHashValue = await hashToken(rawRefreshToken);
  const expiresAtDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: tokenHashValue,
    userAgent: reqInfo?.userAgent || null,
    ipAddress: reqInfo?.ip || null,
    isRevoked: false,
    expiresAt: expiresAtDate,
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

// ==========================================
// 1. REGISTER CUSTOMER
// ==========================================
authRouter.post("/register", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const body = await c.req.json();
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const { email, password, fullName, phone, companyName, billingAddress } = result.data;
    
    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return c.json({ success: false, error: "Email is already registered" }, 400);
    }
    
    const passHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const customerId = crypto.randomUUID();
    
    // Create user and customer atomically in a transaction
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email,
        passwordHash: passHash,
        fullName,
        role: "customer",
        status: "active",
        emailVerified: false,
      });
      
      await tx.insert(customers).values({
        id: customerId,
        userId,
        phone: phone,
        companyName: companyName || null,
        billingAddress: billingAddress || null,
      });
    });
    
    const reqInfo = {
      userAgent: c.req.header("User-Agent"),
      ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
    };

    const { accessToken, refreshToken } = await issueTokenPair(
      db,
      { id: userId, email, role: "customer" },
      c.env.JWT_SECRET,
      reqInfo
    );
    
    return c.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        fullName,
        role: "customer",
      },
    }, 201);
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 2. EMAIL / PASSWORD LOGIN
// ==========================================
authRouter.post("/login", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const body = await c.req.json();
    const result = LoginSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const { email, password } = result.data;
    
    // Fetch user
    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    if (foundUsers.length === 0) {
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }
    
    const user = foundUsers[0];
    if (user.status !== "active") {
      return c.json({ success: false, error: "Your account is suspended or pending activation" }, 403);
    }
    
    if (!user.passwordHash) {
      return c.json({ success: false, error: "This account uses social sign-in. Please log in with Google or Microsoft." }, 401);
    }
    
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }
    
    const reqInfo = {
      userAgent: c.req.header("User-Agent"),
      ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
    };

    const { accessToken, refreshToken } = await issueTokenPair(
      db,
      { id: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      reqInfo
    );
    
    return c.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 3. REFRESH TOKEN ACCESS
// ==========================================
authRouter.post("/refresh", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const { refreshToken } = await c.req.json();
    if (!refreshToken) {
      return c.json({ success: false, error: "Refresh token is required" }, 400);
    }

    const tokenHashValue = await hashToken(refreshToken);
    const foundTokens = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHashValue));

    if (foundTokens.length === 0) {
      return c.json({ success: false, error: "Invalid refresh token" }, 401);
    }

    const tokenRecord = foundTokens[0];
    if (tokenRecord.isRevoked) {
      return c.json({ success: false, error: "Refresh token has been revoked" }, 401);
    }

    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return c.json({ success: false, error: "Refresh token expired. Please sign in again." }, 401);
    }

    // Fetch associated user
    const foundUsers = await db.select().from(users).where(eq(users.id, tokenRecord.userId));
    if (foundUsers.length === 0 || foundUsers[0].status !== "active") {
      return c.json({ success: false, error: "User account suspended or not found" }, 403);
    }

    const user = foundUsers[0];

    // Revoke old refresh token (rotation)
    await db.update(refreshTokens).set({ isRevoked: true }).where(eq(refreshTokens.id, tokenRecord.id));

    // Issue new pair
    const reqInfo = {
      userAgent: c.req.header("User-Agent"),
      ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
    };

    const newPair = await issueTokenPair(
      db,
      { id: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      reqInfo
    );

    return c.json({
      success: true,
      token: newPair.accessToken,
      refreshToken: newPair.refreshToken,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 4. FORGOT PASSWORD
// ==========================================
authRouter.post("/forgot-password", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ success: false, error: "Email address is required" }, 400);
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    if (foundUsers.length === 0) {
      // Return success even if email not found for privacy
      return c.json({ success: true, message: "If your email is registered, a password reset link has been sent." });
    }

    const user = foundUsers[0];
    const rawResetToken = generateRandomToken(32);
    const tokenHashValue = await hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResets).values({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: tokenHashValue,
      isUsed: false,
      expiresAt,
    });

    const resetLink = `https://remotefix.com/reset-password?token=${rawResetToken}`;
    const emailContent = EmailTemplates.passwordReset(user.fullName, resetLink);
    await sendEmail({ to: user.email, ...emailContent }, c.env as any);

    return c.json({
      success: true,
      message: "If your email is registered, a password reset link has been sent.",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 5. RESET PASSWORD
// ==========================================
authRouter.post("/reset-password", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { token, newPassword } = await c.req.json();
    if (!token || !newPassword || newPassword.length < 8) {
      return c.json({ success: false, error: "Invalid token or password must be at least 8 characters" }, 400);
    }

    const tokenHashValue = await hashToken(token);
    const foundResets = await db.select().from(passwordResets).where(eq(passwordResets.tokenHash, tokenHashValue));

    if (foundResets.length === 0) {
      return c.json({ success: false, error: "Invalid or expired password reset token" }, 400);
    }

    const resetRecord = foundResets[0];
    if (resetRecord.isUsed || new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      return c.json({ success: false, error: "Password reset token has expired or already been used" }, 400);
    }

    const newPassHash = await hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash: newPassHash }).where(eq(users.id, resetRecord.userId));
      await tx.update(passwordResets).set({ isUsed: true }).where(eq(passwordResets.id, resetRecord.id));
    });

    return c.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 6. GET CURRENT USER PROFILE (/me)
// ==========================================
authRouter.get("/me", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const contextUser = c.get("user")!;
  
  try {
    const foundUsers = await db.select().from(users).where(eq(users.id, contextUser.id));
    if (foundUsers.length === 0) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    const user = foundUsers[0];
    let customerInfo = null;
    
    if (user.role === "customer") {
      const customersList = await db.select().from(customers).where(eq(customers.userId, user.id));
      if (customersList.length > 0) {
        customerInfo = customersList[0];
      }
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        customerDetails: customerInfo,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 7. OAUTH SIGN-IN (GOOGLE/MICROSOFT)
// ==========================================
authRouter.post("/oauth-login", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const { provider, token: oauthToken, fullName, email } = await c.req.json();
    
    if (!provider || !oauthToken || !email || !fullName) {
      return c.json({ success: false, error: "Missing required OAuth details" }, 400);
    }
    
    if (provider !== "google" && provider !== "microsoft") {
      return c.json({ success: false, error: "Invalid provider" }, 400);
    }
    
    // Check if user already exists
    let existingUser = null;
    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (foundUsers.length > 0) {
      existingUser = foundUsers[0];
      
      // Update Google/Microsoft ID if not set
      if (provider === "google" && !existingUser.googleId) {
        await db.update(users).set({ googleId: oauthToken }).where(eq(users.id, existingUser.id));
      } else if (provider === "microsoft" && !existingUser.microsoftId) {
        await db.update(users).set({ microsoftId: oauthToken }).where(eq(users.id, existingUser.id));
      }
    } else {
      // User doesn't exist, create user + customer profile
      const userId = crypto.randomUUID();
      const customerId = crypto.randomUUID();
      
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          id: userId,
          email,
          fullName,
          role: "customer",
          status: "active",
          emailVerified: true,
          googleId: provider === "google" ? oauthToken : null,
          microsoftId: provider === "microsoft" ? oauthToken : null,
        });
        
        await tx.insert(customers).values({
          id: customerId,
          userId,
          phone: "0000000000",
          companyName: null,
          billingAddress: null,
        });
      });
      
      const newUsers = await db.select().from(users).where(eq(users.id, userId));
      existingUser = newUsers[0];
    }
    
    if (existingUser.status !== "active") {
      return c.json({ success: false, error: "Your account is suspended" }, 403);
    }
    
    const reqInfo = {
      userAgent: c.req.header("User-Agent"),
      ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
    };

    const { accessToken, refreshToken } = await issueTokenPair(
      db,
      { id: existingUser.id, email: existingUser.email, role: existingUser.role },
      c.env.JWT_SECRET,
      reqInfo
    );
    
    return c.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        fullName: existingUser.fullName,
        role: existingUser.role,
      },
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 8. LOGOUT (REVOKE REFRESH TOKEN)
// ==========================================
authRouter.post("/logout", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const contextUser = c.get("user")!;

  try {
    const { refreshToken } = await c.req.json().catch(() => ({ refreshToken: null }));
    if (refreshToken) {
      const tokenHashValue = await hashToken(refreshToken);
      await db.update(refreshTokens).set({ isRevoked: true }).where(eq(refreshTokens.tokenHash, tokenHashValue));
    }

    return c.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

export { authRouter };
