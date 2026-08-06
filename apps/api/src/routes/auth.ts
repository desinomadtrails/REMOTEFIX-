import { Hono } from "hono";
import { eq, and, or } from "drizzle-orm";
import { getDb } from "../db.js";
import {
  users,
  customers,
  engineers,
  refreshTokens,
  passwordResets,
  emailVerifications,
  otpVerifications,
  auditLogs,
} from "@remotefix/database";
import { LoginSchema, RegisterSchema } from "@remotefix/types";
import {
  hashPassword,
  verifyPassword,
  signJWT,
  generateRandomToken,
  hashToken,
} from "@remotefix/auth";
import { requireAuth, AppEnv } from "../middleware/auth.js";
import {
  loginRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
  refreshRateLimiter,
} from "../middleware/rateLimiter.js";
import { sendEmail, EmailTemplates } from "../services/emailService.js";

const authRouter = new Hono<AppEnv>();

// Helper to log authentication & security events into audit_logs table
async function logAuthEvent(
  db: any,
  params: {
    userId?: string | null;
    action: string;
    actionType: string;
    status: "success" | "failed";
    details: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    reason?: string | null;
  }
) {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: params.userId || null,
      action: params.action,
      actionType: params.actionType,
      entityType: "users",
      entityId: params.userId || null,
      status: params.status,
      details: params.details,
      reason: params.reason || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("⚠️ Failed to write audit log entry:", err);
  }
}

// Password Strength Validator (>=8 chars, upper, lower, number, special char)
function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*).";
  }
  return null;
}

// Helper to issue access (15 min) & refresh token (30 days) pair
async function issueTokenPair(
  db: any,
  user: { id: string; email: string; role: string; fullName?: string },
  secret: string,
  reqInfo?: { userAgent?: string | null; ip?: string | null }
) {
  const now = Math.floor(Date.now() / 1000);

  // Short-lived access token (15 minutes)
  const accessToken = await signJWT(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName || "",
      role: user.role,
      type: "access",
      iat: now,
      exp: now + 15 * 60, // 15 minutes
    },
    secret
  );

  // Long-lived refresh token (30 days)
  const rawRefreshToken = generateRandomToken(40);
  const tokenHashValue = await hashToken(rawRefreshToken);
  const expiresAtDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(refreshTokens).values({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: tokenHashValue,
    userAgent: reqInfo?.userAgent || null,
    ipAddress: reqInfo?.ip || null,
    isRevoked: false,
    revokedAt: null,
    expiresAt: expiresAtDate,
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

// ==========================================
// 1. REGISTER CUSTOMER (/api/auth/register)
// ==========================================
authRouter.post("/register", registerRateLimiter, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const body = await c.req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { email, password, fullName, phone, companyName, billingAddress } = result.data;

    // Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return c.json({ success: false, error: passwordError }, 400);
    }

    // Check duplicate email
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existingUser.length > 0) {
      await logAuthEvent(db, {
        action: "register_failed",
        actionType: "auth.register",
        status: "failed",
        details: `Registration attempted with existing email: ${email}`,
        reason: "Duplicate email address",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });
      return c.json({ success: false, error: "An account with this email address already exists." }, 409);
    }

    // Check duplicate phone if provided
    if (phone) {
      const existingPhone = await db.select().from(customers).where(eq(customers.phone, phone.trim()));
      if (existingPhone.length > 0) {
        return c.json({ success: false, error: "An account with this phone number already exists." }, 409);
      }
    }

    // Hash password with bcrypt 12 salt rounds
    const passHash = await hashPassword(password, 12);
    const userId = crypto.randomUUID();
    const customerId = crypto.randomUUID();

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create user and customer record atomically
    await db.transaction(async (tx: any) => {
      await tx.insert(users).values({
        id: userId,
        email: email.toLowerCase().trim(),
        passwordHash: passHash,
        fullName: fullName.trim(),
        firstName,
        lastName,
        mobile: phone ? phone.trim() : null,
        role: "customer",
        status: "active",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(customers).values({
        id: customerId,
        userId,
        phone: phone ? phone.trim() : "0000000000",
        companyName: companyName ? companyName.trim() : null,
        billingAddress: billingAddress ? billingAddress.trim() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
    const { accessToken, refreshToken } = await issueTokenPair(
      db,
      { id: userId, email: email.toLowerCase().trim(), role: "customer", fullName: fullName.trim() },
      jwtSecret,
      reqInfo
    );

    await logAuthEvent(db, {
      userId,
      action: "register_success",
      actionType: "auth.register",
      status: "success",
      details: `User registered successfully as customer: ${email}`,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

    return c.json(
      {
        success: true,
        token: accessToken,
        refreshToken,
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          fullName: fullName.trim(),
          role: "customer",
          emailVerified: false,
        },
      },
      201
    );
  } catch (err: any) {
    console.error("❌ Register error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 2. EMAIL / PASSWORD LOGIN (/api/auth/login)
// ==========================================
authRouter.post("/login", loginRateLimiter, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const body = await c.req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { email, password } = result.data;
    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));

    if (foundUsers.length === 0) {
      await logAuthEvent(db, {
        action: "login_failure",
        actionType: "auth.login_failure",
        status: "failed",
        details: `Login failed for non-existent email: ${email}`,
        reason: "User not found",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });
      return c.json({ success: false, error: "Invalid email address or password" }, 401);
    }

    const user = foundUsers[0];

    if (user.status !== "active") {
      await logAuthEvent(db, {
        userId: user.id,
        action: "login_suspended",
        actionType: "auth.login_failure",
        status: "failed",
        details: `Login attempt for suspended user: ${email}`,
        reason: `Account status: ${user.status}`,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });
      return c.json({ success: false, error: "Your account has been suspended or deactivated. Please contact support." }, 403);
    }

    if (!user.passwordHash) {
      return c.json(
        { success: false, error: "This account uses social single sign-on. Please log in with Google or Microsoft." },
        401
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await logAuthEvent(db, {
        userId: user.id,
        action: "login_failure",
        actionType: "auth.login_failure",
        status: "failed",
        details: `Invalid password attempt for user: ${email}`,
        reason: "Wrong password",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });
      return c.json({ success: false, error: "Invalid email address or password" }, 401);
    }

    // Update last_login_at timestamp
    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
    const { accessToken, refreshToken } = await issueTokenPair(
      db,
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      jwtSecret,
      reqInfo
    );

    await logAuthEvent(db, {
      userId: user.id,
      action: "login_success",
      actionType: "auth.login_success",
      status: "success",
      details: `User logged in successfully: ${email}`,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

    return c.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        emailVerified: Boolean(user.emailVerified),
      },
    });
  } catch (err: any) {
    console.error("❌ Login error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 3. REFRESH TOKEN ACCESS (/api/auth/refresh)
// ==========================================
authRouter.post("/refresh", refreshRateLimiter, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { refreshToken } = await c.req.json();
    if (!refreshToken) {
      return c.json({ success: false, error: "Refresh token is required" }, 400);
    }

    const tokenHashValue = await hashToken(refreshToken);
    const foundTokens = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHashValue));

    if (foundTokens.length === 0) {
      return c.json({ success: false, error: "Invalid or unknown refresh token" }, 401);
    }

    const tokenRecord = foundTokens[0];

    // Check if token is revoked
    if (tokenRecord.isRevoked) {
      await logAuthEvent(db, {
        userId: tokenRecord.userId,
        action: "token_refresh_revoked_attempt",
        actionType: "auth.token_refresh_failed",
        status: "failed",
        details: "Attempted refresh token reuse with revoked token",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });
      return c.json({ success: false, error: "Refresh token has been revoked. Please sign in again." }, 401);
    }

    // Check expiration
    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return c.json({ success: false, error: "Refresh token expired. Please sign in again." }, 401);
    }

    // Fetch user
    const foundUsers = await db.select().from(users).where(eq(users.id, tokenRecord.userId));
    if (foundUsers.length === 0 || foundUsers[0].status !== "active") {
      return c.json({ success: false, error: "User account suspended or not found" }, 403);
    }

    const user = foundUsers[0];

    // ROTATION: Revoke used refresh token immediately
    await db
      .update(refreshTokens)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(refreshTokens.id, tokenRecord.id));

    // Issue new 15m Access Token + 30d Refresh Token pair
    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
    const newPair = await issueTokenPair(
      db,
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      jwtSecret,
      reqInfo
    );

    await logAuthEvent(db, {
      userId: user.id,
      action: "token_refresh_success",
      actionType: "auth.token_refresh",
      status: "success",
      details: `Tokens rotated successfully for user: ${user.email}`,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

    return c.json({
      success: true,
      token: newPair.accessToken,
      refreshToken: newPair.refreshToken,
    });
  } catch (err: any) {
    console.error("❌ Refresh token error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 4. FORGOT PASSWORD (/api/auth/forgot-password)
// ==========================================
authRouter.post("/forgot-password", forgotPasswordRateLimiter, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { email } = await c.req.json();
    if (!email || typeof email !== "string") {
      return c.json({ success: false, error: "Email address is required" }, 400);
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));

    if (foundUsers.length === 0) {
      // Privacy-preserving response
      return c.json({
        success: true,
        message: "If your email is registered, a password reset link has been sent.",
      });
    }

    const user = foundUsers[0];
    const rawResetToken = generateRandomToken(40);
    const tokenHashValue = await hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResets).values({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: tokenHashValue,
      isUsed: false,
      expiresAt,
      createdAt: new Date(),
    });

    const resetLink = `https://remotefix.com/reset-password?token=${rawResetToken}`;
    const emailContent = EmailTemplates.passwordReset(user.fullName, resetLink);
    await sendEmail({ to: user.email, ...emailContent }, c.env as any);

    await logAuthEvent(db, {
      userId: user.id,
      action: "forgot_password_requested",
      actionType: "auth.forgot_password",
      status: "success",
      details: `Password reset link requested for email: ${user.email}`,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

    return c.json({
      success: true,
      message: "If your email is registered, a password reset link has been sent.",
    });
  } catch (err: any) {
    console.error("❌ Forgot password error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 5. RESET PASSWORD (/api/auth/reset-password)
// ==========================================
authRouter.post("/reset-password", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { token, newPassword } = await c.req.json();

    if (!token || typeof token !== "string") {
      return c.json({ success: false, error: "Reset token is required." }, 400);
    }

    const passwordError = validatePasswordStrength(newPassword || "");
    if (passwordError) {
      return c.json({ success: false, error: passwordError }, 400);
    }

    const tokenHashValue = await hashToken(token);
    const foundResets = await db.select().from(passwordResets).where(eq(passwordResets.tokenHash, tokenHashValue));

    if (foundResets.length === 0) {
      return c.json({ success: false, error: "Invalid or expired password reset token." }, 400);
    }

    const resetRecord = foundResets[0];
    if (resetRecord.isUsed || new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      return c.json({ success: false, error: "Password reset token has expired or already been used." }, 400);
    }

    const newPassHash = await hashPassword(newPassword, 12);

    await db.transaction(async (tx: any) => {
      await tx.update(users).set({ passwordHash: newPassHash, updatedAt: new Date() }).where(eq(users.id, resetRecord.userId));
      await tx.update(passwordResets).set({ isUsed: true }).where(eq(passwordResets.id, resetRecord.id));
    });

    await logAuthEvent(db, {
      userId: resetRecord.userId,
      action: "password_reset_success",
      actionType: "auth.password_reset",
      status: "success",
      details: "Password reset completed successfully",
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

    return c.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err: any) {
    console.error("❌ Reset password error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 6. VERIFY EMAIL (/api/auth/verify-email)
// ==========================================
authRouter.post("/verify-email", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { token, otp, email } = await c.req.json();

    if (token) {
      const tokenHashValue = await hashToken(token);
      const found = await db.select().from(emailVerifications).where(eq(emailVerifications.tokenHash, tokenHashValue));

      if (found.length === 0 || found[0].isVerified || new Date(found[0].expiresAt).getTime() < Date.now()) {
        return c.json({ success: false, error: "Invalid or expired verification token." }, 400);
      }

      const rec = found[0];
      await db.transaction(async (tx: any) => {
        await tx.update(emailVerifications).set({ isVerified: true }).where(eq(emailVerifications.id, rec.id));
        await tx.update(users).set({ emailVerified: true, emailVerifiedAt: new Date() }).where(eq(users.id, rec.userId));
      });

      await logAuthEvent(db, {
        userId: rec.userId,
        action: "email_verification_success",
        actionType: "auth.email_verification",
        status: "success",
        details: "Email address verified via link token",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });

      return c.json({ success: true, message: "Email address verified successfully." });
    }

    if (otp && email) {
      const foundOtp = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.email, email.toLowerCase().trim()),
            eq(otpVerifications.otp, otp.trim()),
            eq(otpVerifications.isUsed, false)
          )
        );

      if (foundOtp.length === 0 || new Date(foundOtp[0].expiresAt).getTime() < Date.now()) {
        return c.json({ success: false, error: "Invalid or expired verification OTP code." }, 400);
      }

      const otpRec = foundOtp[0];
      await db.transaction(async (tx: any) => {
        await tx.update(otpVerifications).set({ isUsed: true }).where(eq(otpVerifications.id, otpRec.id));
        await tx
          .update(users)
          .set({ emailVerified: true, emailVerifiedAt: new Date() })
          .where(eq(users.email, email.toLowerCase().trim()));
      });

      await logAuthEvent(db, {
        action: "otp_verification_success",
        actionType: "auth.email_verification",
        status: "success",
        details: `Email verified via OTP for: ${email}`,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      });

      return c.json({ success: true, message: "Email address verified successfully via OTP." });
    }

    return c.json({ success: false, error: "Verification token or email/OTP code is required." }, 400);
  } catch (err: any) {
    console.error("❌ Email verification error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 7. RESEND OTP (/api/auth/resend-otp)
// ==========================================
authRouter.post("/resend-otp", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { email } = await c.req.json();
    if (!email || typeof email !== "string") {
      return c.json({ success: false, error: "Email address is required." }, 400);
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (foundUsers.length === 0) {
      return c.json({ success: true, message: "Verification code sent if account exists." });
    }

    const user = foundUsers[0];
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(otpVerifications).values({
      id: crypto.randomUUID(),
      email: user.email,
      otp: otpCode,
      purpose: "email_verification",
      isUsed: false,
      expiresAt,
      createdAt: new Date(),
    });

    console.log(`✉️ OTP generated for ${user.email}: ${otpCode}`);

    await logAuthEvent(db, {
      userId: user.id,
      action: "otp_resend",
      actionType: "auth.resend_otp",
      status: "success",
      details: `Resent verification OTP for ${user.email}`,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

    return c.json({
      success: true,
      message: "Verification OTP code sent to your email.",
    });
  } catch (err: any) {
    console.error("❌ Resend OTP error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 8. GET CURRENT USER PROFILE (/api/auth/me)
// ==========================================
authRouter.get("/me", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const contextUser = c.get("user")!;

  try {
    const foundUsers = await db.select().from(users).where(eq(users.id, contextUser.id));
    if (foundUsers.length === 0) {
      return c.json({ success: false, error: "User profile not found." }, 404);
    }

    const user = foundUsers[0];
    let customerInfo = null;
    let engineerInfo = null;

    if (user.role === "customer") {
      const customersList = await db.select().from(customers).where(eq(customers.userId, user.id));
      if (customersList.length > 0) customerInfo = customersList[0];
    } else if (user.role === "engineer") {
      const engineersList = await db.select().from(engineers).where(eq(engineers.userId, user.id));
      if (engineersList.length > 0) engineerInfo = engineersList[0];
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        emailVerified: Boolean(user.emailVerified),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        customerDetails: customerInfo,
        engineerDetails: engineerInfo,
      },
    });
  } catch (err: any) {
    console.error("❌ Get profile error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 9. LOGOUT (/api/auth/logout)
// ==========================================
authRouter.post("/logout", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { refreshToken } = await c.req.json().catch(() => ({ refreshToken: null }));
    if (refreshToken) {
      const tokenHashValue = await hashToken(refreshToken);
      const foundTokens = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHashValue));

      if (foundTokens.length > 0) {
        await db
          .update(refreshTokens)
          .set({ isRevoked: true, revokedAt: new Date() })
          .where(eq(refreshTokens.id, foundTokens[0].id));

        await logAuthEvent(db, {
          userId: foundTokens[0].userId,
          action: "logout_success",
          actionType: "auth.logout",
          status: "success",
          details: "User logged out and refresh token revoked",
          ipAddress: reqInfo.ip,
          userAgent: reqInfo.userAgent,
        });
      }
    }

    return c.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    console.error("❌ Logout error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 10. OAUTH SIGN-IN (/api/auth/oauth-login)
// ==========================================
authRouter.post("/oauth-login", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const reqInfo = {
    userAgent: c.req.header("User-Agent") || null,
    ip: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "127.0.0.1",
  };

  try {
    const { provider, token: oauthToken, fullName, email } = await c.req.json();

    if (!provider || !oauthToken || !email || !fullName) {
      return c.json({ success: false, error: "Missing required OAuth details" }, 400);
    }

    if (provider !== "google" && provider !== "microsoft") {
      return c.json({ success: false, error: "Unsupported OAuth provider" }, 400);
    }

    let existingUser = null;
    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));

    if (foundUsers.length > 0) {
      existingUser = foundUsers[0];

      if (provider === "google" && !existingUser.googleId) {
        await db.update(users).set({ googleId: oauthToken }).where(eq(users.id, existingUser.id));
      } else if (provider === "microsoft" && !existingUser.microsoftId) {
        await db.update(users).set({ microsoftId: oauthToken }).where(eq(users.id, existingUser.id));
      }
    } else {
      const userId = crypto.randomUUID();
      const customerId = crypto.randomUUID();

      await db.transaction(async (tx: any) => {
        await tx.insert(users).values({
          id: userId,
          email: email.toLowerCase().trim(),
          fullName: fullName.trim(),
          role: "customer",
          status: "active",
          emailVerified: true,
          googleId: provider === "google" ? oauthToken : null,
          microsoftId: provider === "microsoft" ? oauthToken : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await tx.insert(customers).values({
          id: customerId,
          userId,
          phone: "0000000000",
          companyName: null,
          billingAddress: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const newUsers = await db.select().from(users).where(eq(users.id, userId));
      existingUser = newUsers[0];
    }

    if (existingUser.status !== "active") {
      return c.json({ success: false, error: "Your account is suspended." }, 403);
    }

    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
    const { accessToken, refreshToken } = await issueTokenPair(
      db,
      { id: existingUser.id, email: existingUser.email, role: existingUser.role, fullName: existingUser.fullName },
      jwtSecret,
      reqInfo
    );

    await logAuthEvent(db, {
      userId: existingUser.id,
      action: "oauth_login_success",
      actionType: "auth.login_success",
      status: "success",
      details: `OAuth login via ${provider} for email: ${email}`,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
    });

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
    console.error("❌ OAuth login error:", err);
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

export { authRouter };
