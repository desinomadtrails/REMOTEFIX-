import { execSync } from "child_process";

export async function handleUpdate(): Promise<void> {
  console.log("==================================================");
  console.log("  Developer Workshop Update Manager");
  console.log("==================================================");

  try {
    console.log("[1/2] Running Git Pull...");
    execSync("git pull", { stdio: "inherit" });
    console.log("✓ Git Pull completed successfully.");
  } catch {
    console.error("\n✗ Git Pull failed. Stopping update to prevent conflicts.");
    process.exit(1);
  }

  try {
    console.log("\n[2/2] Running npm install...");
    execSync("npm install", { stdio: "inherit" });
    console.log("✓ npm install completed successfully.");
    console.log("\n==================================================");
    console.log("  UPDATE SUCCESSFUL");
    console.log("==================================================");
  } catch {
    console.error("\n✗ npm install failed.");
    process.exit(1);
  }
}
