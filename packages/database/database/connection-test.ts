import mssql from "mssql";
import { connectionConfig } from "./client.js";

async function testConnection() {
  console.log("🔍 Attempting to connect to Microsoft Azure SQL Database...");
  console.log(`📍 Host: ${connectionConfig.server}`);
  console.log(`📍 Database: ${connectionConfig.database}`);
  console.log(`📍 User: ${connectionConfig.user}`);

  const pool = new mssql.ConnectionPool(connectionConfig);

  try {
    const start = Date.now();
    await pool.connect();
    const duration = Date.now() - start;
    console.log(`\n====================================================`);
    console.log(`✅ Azure SQL Database connection verified successfully!`);
    console.log(`⏱️  Latency: ${duration}ms`);
    console.log(`====================================================\n`);

    await pool.close();
    process.exit(0);
  } catch (err: any) {
    console.log(`\n====================================================`);
    console.log(`❌ Azure SQL Database connection failed!`);
    console.log(`⚠️  Error details: ${err.message || err}`);
    console.log(`====================================================\n`);
    process.exit(1);
  }
}

testConnection();
