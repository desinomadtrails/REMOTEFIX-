import app from "../apps/api/src/index.ts";
import { getDb } from "../apps/api/src/db.ts";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { DB_HOST, DB_PORT = "1433", DB_NAME, DB_USER, DB_PASSWORD } = process.env;
const databaseUrl = `Server=${DB_HOST},${DB_PORT};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};Encrypt=true;TrustServerCertificate=false;`;
const jwtSecret = "super-secret-key-123";

const testEnv = {
  DATABASE_URL: databaseUrl,
  JWT_SECRET: jwtSecret,
};

// Add diagnostic route to verify Hono context bindings
app.get("/api/test-env", (c) => {
  return c.json({
    envExists: !!c.env,
    dbUrlExists: !!(c.env && (c.env as any).DATABASE_URL),
    dbUrl: c.env && (c.env as any).DATABASE_URL,
    keys: c.env ? Object.keys(c.env) : []
  });
});

async function testApi() {
  console.log("🚀 Starting API Integration Testing...");
  console.log(`📍 Database Target: ${DB_HOST}`);

  // Test 0: Diagnostic route
  console.log("\n➡️ Test 0: GET /api/test-env");
  const res0 = await app.request("/api/test-env", {}, testEnv);
  const data0 = await res0.json() as any;
  console.log("Diagnostic Env output:", JSON.stringify(data0));
  
  // Pre-initialize database singleton to prevent connection race conditions
  console.log("\n🔌 Pre-connecting database pool...");
  getDb(databaseUrl);
  
  console.log("⏳ Awaiting database connection pool initialization (3 seconds)...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 1: Get active services catalog
  console.log("\n➡️ Test 1: GET /api/services");
  const res1 = await app.request("/api/services", {}, testEnv);
  console.log(`Status: ${res1.status}`);
  const data1 = await res1.json() as any;
  console.log("Services Response:", JSON.stringify(data1));
  if (res1.status === 200 && data1.success) {
    console.log("✅ Test 1 Succeeded!");
  } else {
    console.log("❌ Test 1 Failed!");
  }

  // Test 2: Register a new customer user
  console.log("\n➡️ Test 2: POST /api/auth/register");
  const testEmail = `test-user-${Date.now()}@remotefix.com`;
  const registerPayload = {
    email: testEmail,
    password: "TestPassword123!",
    fullName: "John Doe Test",
    role: "customer",
    phone: "123-456-7890",
    companyName: "Test Company Inc.",
    billingAddress: "123 Test Lane, Cityville",
  };
  const res2 = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload),
  }, testEnv);
  console.log(`Status: ${res2.status}`);
  const data2 = await res2.json() as any;
  console.log("Response payload:", JSON.stringify(data2));
  if (res2.status === 201 && data2.success) {
    console.log("✅ Test 2 Succeeded!");
  } else {
    console.log("❌ Test 2 Failed!");
  }

  // Test 3: Login to get JWT
  console.log("\n➡️ Test 3: POST /api/auth/login");
  const loginPayload = {
    email: testEmail,
    password: "TestPassword123!",
  };
  const res3 = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginPayload),
  }, testEnv);
  console.log(`Status: ${res3.status}`);
  const data3 = await res3.json() as any;
  const token = data3.token;
  console.log("JWT Token:", token ? "Received" : "Missing");
  if (res3.status === 200 && token) {
    console.log("✅ Test 3 Succeeded!");
  } else {
    console.log("❌ Test 3 Failed!");
  }

  // Test 4: Access protected profile
  console.log("\n➡️ Test 4: GET /api/auth/me (Protected)");
  const res4 = await app.request("/api/auth/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }, testEnv);
  console.log(`Status: ${res4.status}`);
  const data4 = await res4.json() as any;
  console.log("Profile response:", JSON.stringify(data4));
  if (res4.status === 200 && data4.success) {
    console.log("✅ Test 4 Succeeded!");
  } else {
    console.log("❌ Test 4 Failed!");
  }

  console.log("\n🏁 API Integration Testing Completed!");
  process.exit(0);
}

testApi().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
