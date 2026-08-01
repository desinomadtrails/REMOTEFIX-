import { execSync } from "child_process";

export async function handleTest(): Promise<void> {
  console.log("==================================================");
  console.log("Running Developer Workshop Test Suite");
  console.log("==================================================");
  try {
    console.log("\n[1/2] Running TypeScript Typecheck...");
    execSync("npm run typecheck", { stdio: "inherit" });
    console.log("✓ Typecheck passed.");

    console.log("\n[2/2] Running Integration Tests...");
    execSync("npm run test", { stdio: "inherit" });
    console.log("✓ Integration tests passed.");
    console.log("\n==================================================");
    console.log("RESULTS: ALL VALIDATIONS PASSED");
    console.log("==================================================");
  } catch (error: any) {
    console.error(`\n✗ Validation run failed. See details above.`);
    process.exit(1);
  }
}
