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

// ==========================================
// PASSWORD HASHING (PBKDF2/SHA-256)
// ==========================================

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
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
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    256
  );
  
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, "0")).join("");
  
  return `pbkdf2_sha256$100000$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
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
// ROLE-BASED ACCESS CONTROL (RBAC) HELPERS
// ==========================================

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === "admin") return true; // Admin has absolute permission override
  return allowedRoles.includes(userRole);
}
