import { getConnectedDbClient } from "../client.js";
import { services } from "../schema/index.js";
import { count } from "drizzle-orm";

async function run() {
  console.log("🌱 Seeding database...");

  try {
    const db = await getConnectedDbClient();
    
    // Check if services are already seeded
    const sCount = await db.select({ value: count(services.id) }).from(services);
    
    if (sCount[0].value > 0) {
      console.log("✅ Database already seeded with services.");
      await (db.$client as any).close();
      process.exit(0);
    }
    
    // Core Services Seed Data
    const coreServices = [
      {
        id: crypto.randomUUID(),
        name: "Remote IT Support",
        description: "Fast diagnostics, troubleshooting, software fixes, and optimizations handled securely via secure remote desktop utilities.",
        category: "Support",
        price: "79.00",
        estimatedDurationMinutes: 60,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "WiFi & Network Configuration",
        description: "Setting up router settings, optimizing channels, configuring guest networks, and fixing dead zones for home and business connections.",
        category: "Networking",
        price: "129.00",
        estimatedDurationMinutes: 90,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Virus & Malware Removal",
        description: "Full system scan, quarantine of suspicious entities, adware cleanup, registry repairs, and installing enterprise protection suites.",
        category: "Cyber Security",
        price: "99.00",
        estimatedDurationMinutes: 75,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "OS Clean Installation",
        description: "Fresh install of Windows, macOS, or Linux. Complete backup, partition formatting, system install, drivers matching, and OS configurations.",
        category: "Installation",
        price: "149.00",
        estimatedDurationMinutes: 120,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Data Backup & Recovery",
        description: "Salvaging corrupted documents, recovery from damaged sectors or accidentally formatted files, and setting up automated NAS/Cloud vault backups.",
        category: "Storage",
        price: "199.00",
        estimatedDurationMinutes: 180,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "IT Consultation",
        description: "Structured architecture review, sizing migrations, assessing hardware lifecycles, and drafting cybersecurity risk management strategies.",
        category: "Consulting",
        price: "250.00",
        estimatedDurationMinutes: 60,
        isActive: true,
      },
    ];
    
    await db.insert(services).values(coreServices as any);
    console.log(`✅ Database services catalog seeded successfully with ${coreServices.length} items.`);
    
    await (db.$client as any).close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Database seeding failed:", err);
    process.exit(1);
  }
}

run();
