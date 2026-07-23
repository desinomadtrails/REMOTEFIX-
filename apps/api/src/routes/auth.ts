import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { users, customers } from "@remotefix/database";
import { LoginSchema, RegisterSchema } from "@remotefix/types";
import { hashPassword, verifyPassword, signJWT } from "@remotefix/auth";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const authRouter = new Hono<AppEnv>();

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
      });
      
      await tx.insert(customers).values({
        id: customerId,
        userId,
        phone: phone,
        companyName: companyName || null,
        billingAddress: billingAddress || null,
      });
    });
    
    // Sign JWT token
    const token = await signJWT(
      {
        id: userId,
        email,
        role: "customer",
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      },
      c.env.JWT_SECRET
    );
    
    return c.json({
      success: true,
      token,
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
    
    // Sign JWT
    const token = await signJWT(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      },
      c.env.JWT_SECRET
    );
    
    return c.json({
      success: true,
      token,
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
// 3. GET CURRENT USER PROFILE (/me)
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
        createdAt: user.createdAt,
        customerDetails: customerInfo,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Internal server error" }, 500);
  }
});

// ==========================================
// 4. OAUTH SIGN-IN (GOOGLE/MICROSOFT)
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
          googleId: provider === "google" ? oauthToken : null,
          microsoftId: provider === "microsoft" ? oauthToken : null,
        });
        
        await tx.insert(customers).values({
          id: customerId,
          userId,
          phone: "0000000000", // Default placeholder for OAuth signups
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
    
    // Sign JWT
    const jwtToken = await signJWT(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      c.env.JWT_SECRET
    );
    
    return c.json({
      success: true,
      token: jwtToken,
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

export { authRouter };
