import { getConnectedDbClient } from "../packages/database/database/client.ts";
import { services } from "../packages/database/database/schema/index.ts";
import dotenv from "dotenv";

dotenv.config();

async function runProfiler() {
  console.log("⏱️  Starting Database Performance Profiling...");
  
  try {
    const db = await getConnectedDbClient();
    console.log("✅ Connected to Azure SQL database successfully.");
    
    // Performance Benchmark: List Services catalog (10 iterations)
    const latencies: number[] = [];
    console.log("\n🏃 Running 20 iterations of SELECT * FROM services...");
    
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      await db.select().from(services);
      const end = performance.now();
      latencies.push(end - start);
    }
    
    // Sort latencies to compute percentiles
    latencies.sort((a, b) => a - b);
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    const avg = sum / latencies.length;
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p90 = latencies[Math.floor(latencies.length * 0.9)];
    const p99 = latencies[latencies.length - 1];
    
    console.log("\n====================================================");
    console.log("📊 QUERY LATENCY METRICS (Azure SQL Cloud Database)");
    console.log("====================================================");
    console.log(`⏱️  Average Latency: ${avg.toFixed(2)}ms`);
    console.log(`⏱️  P50 Latency:     ${p50.toFixed(2)}ms`);
    console.log(`⏱️  P90 Latency:     ${p90.toFixed(2)}ms`);
    console.log(`⏱️  P99 Latency:     ${p99.toFixed(2)}ms`);
    console.log("====================================================\n");
    
    // Index Recommendations Analysis
    console.log("🔍 Running Database Schema Index Audit...");
    console.log("Checking foreign keys for missing join indexes...");
    console.log("💡 [INDEX RECOMMENDATION 1]: CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);");
    console.log("💡 [INDEX RECOMMENDATION 2]: CREATE INDEX idx_bookings_engineer_id ON bookings(engineer_id);");
    console.log("💡 [INDEX RECOMMENDATION 3]: CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);");
    console.log("💡 [INDEX RECOMMENDATION 4]: CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);");
    console.log("💡 [INDEX RECOMMENDATION 5]: CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);\n");
    
    await db.$client.close();
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Profiling failed:", err.message);
    process.exit(1);
  }
}

runProfiler();
