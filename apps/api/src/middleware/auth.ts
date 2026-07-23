import { MiddlewareHandler } from "hono";
import { verifyJWT, hasRole } from "@remotefix/auth";
import { UserRole } from "@remotefix/types";

export interface Bindings {
  DATABASE_URL: string;
  JWT_SECRET: string;
  AZURE_STORAGE_CONNECTION_STRING: string;
  AZURE_STORAGE_CONTAINER: string;
}

export interface Variables {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: "Unauthorized: Missing or invalid token format.",
      },
      401
    );
  }
  
  const token = authHeader.substring(7);
  const secret = c.env.JWT_SECRET;
  
  const decoded = await verifyJWT(token, secret);
  if (!decoded) {
    return c.json(
      {
        success: false,
        error: "Unauthorized: Token verification failed or expired.",
      },
      401
    );
  }
  
  c.set("user", {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
  });
  
  await next();
};

export function requireRole(allowedRoles: UserRole[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        {
          success: false,
          error: "Unauthorized: Authentication required.",
        },
        401
      );
    }
    
    if (!hasRole(user.role, allowedRoles)) {
      return c.json(
        {
          success: false,
          error: "Forbidden: You do not have permissions to access this resource.",
        },
        403
      );
    }
    
    await next();
  };
}
