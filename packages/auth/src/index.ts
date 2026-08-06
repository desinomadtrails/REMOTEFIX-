import { UserRole } from "@remotefix/types";

// ==========================================
// BASE64URL ENCODERS / DECODERS
// ==========================================

function base64urlEncode(arr: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < arr.byteLength; i++) {
    bin += String.fromCharCode(arr[i]);
  }
  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) {
    s += "=";
  }
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

// ==========================================
// JWT SIGNING AND VERIFICATION
// ==========================================

export async function signJWT(payload: Record<string, any>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const encodedSignature = base64urlEncode(new Uint8Array(signature));
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, any> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  try {
    const signature = base64urlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify("HMAC", key, signature as any, data);
    
    if (!isValid) return null;
    
    const payloadJson = new TextDecoder().decode(base64urlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson);
    
    // Check expiration if 'exp' is present
    if (payload.exp && typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        return null; // Token expired
      }
    }
    
    return payload;
  } catch {
    return null;
  }
}

import bcrypt from "bcryptjs";

// ==========================================
// PASSWORD HASHING (BCRYPT 12 SALT ROUNDS + LEGACY FALLBACK)
// ==========================================

export async function hashPassword(password: string, rounds = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  if (storedHash.startsWith("pbkdf2_sha256$")) {
    return verifyPbkdf2Password(password, storedHash);
  }

  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    return false;
  }
}

async function verifyPbkdf2Password(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    return false;
  }
  
  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const storedHashHex = parts[3];
  
  try {
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const passwordBuffer = new TextEncoder().encode(password);
    
    const baseKey = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: "SHA-256"
      },
      baseKey,
      256
    );
    
    const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex === storedHashHex;
  } catch {
    return false;
  }
}

// ==========================================
// CONVENIENCE TOKEN SIGNERS (15M / 30D)
// ==========================================

/** Signs 15-minute short-lived Access Token */
export async function signAccessToken(payload: Record<string, any>, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signJWT(
    {
      ...payload,
      type: "access",
      iat: now,
      exp: now + 15 * 60, // 15 minutes
    },
    secret
  );
}

/** Signs 30-day long-lived Refresh Token */
export async function signRefreshTokenPayload(payload: Record<string, any>, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signJWT(
    {
      ...payload,
      type: "refresh",
      iat: now,
      exp: now + 30 * 24 * 60 * 60, // 30 days
    },
    secret
  );
}

// ==========================================
// SECURE TOKEN GENERATORS & HASHERS
// ==========================================

/** Generates a cryptographically random token string */
export function generateRandomToken(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Computes SHA-256 hash of a token string for safe DB storage */
export async function hashToken(token: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ==========================================
// ROLE-BASED ACCESS CONTROL (RBAC) HELPERS
// ==========================================

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === "admin" || userRole === "super_admin") return true; // Admin has absolute permission override
  return allowedRoles.includes(userRole);
}

/** Pre-defined permission mapping for database-driven RBAC evaluation */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, { resource: string; action: string }[]> = {
  super_admin: [{ resource: "*", action: "*" }],
  org_admin: [
    { resource: "organizations", action: "manage" },
    { resource: "departments", action: "manage" },
    { resource: "users", action: "manage" },
    { resource: "bookings", action: "manage" },
    { resource: "tickets", action: "manage" },
    { resource: "assets", action: "manage" },
    { resource: "billing", action: "manage" },
    { resource: "reports", action: "read" },
  ],
  manager: [
    { resource: "departments", action: "read" },
    { resource: "users", action: "read" },
    { resource: "bookings", action: "manage" },
    { resource: "tickets", action: "manage" },
    { resource: "assets", action: "read" },
    { resource: "reports", action: "read" },
  ],
  dispatcher: [
    { resource: "bookings", action: "manage" },
    { resource: "tickets", action: "manage" },
    { resource: "assets", action: "read" },
  ],
  technician: [
    { resource: "bookings", action: "update" },
    { resource: "tickets", action: "update" },
    { resource: "assets", action: "read" },
  ],
  finance: [
    { resource: "billing", action: "manage" },
    { resource: "reports", action: "read" },
    { resource: "bookings", action: "read" },
  ],
  viewer: [
    { resource: "bookings", action: "read" },
    { resource: "tickets", action: "read" },
    { resource: "assets", action: "read" },
  ],
};

export function checkPermission(
  userRole: string,
  userPermissions: { resource: string; action: string }[] | undefined,
  resource: string,
  action: string
): boolean {
  if (userRole === "super_admin" || userRole === "admin") return true;

  // Use custom permissions array if present
  const perms = userPermissions || DEFAULT_ROLE_PERMISSIONS[userRole] || [];
  return perms.some(
    (p) =>
      (p.resource === "*" || p.resource === resource) &&
      (p.action === "*" || p.action === "manage" || p.action === action)
  );
}
