import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export async function handleDoctor(): Promise<void> {
  console.log("==================================================");
  console.log("  RemoteFix Developer Workshop Doctor Checks");
  console.log("==================================================");

  let passedChecks = 0;
  let failedChecks = 0;

  function runCheck(name: string, checkFn: () => void) {
    try {
      checkFn();
      console.log(`  ✓ ${name}: Passed`);
      passedChecks++;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ ${name}: Failed -> ${errMsg}`);
      failedChecks++;
    }
  }

  // 1. Git Installation Check
  runCheck("Git Installation", () => {
    const output = execSync("git --version", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (!output.includes("git version")) throw new Error(`Unexpected Git version output: ${output}`);
  });

  // 2. Node Installation Check
  runCheck("Node.js Installation", () => {
    const version = process.version;
    const major = parseInt(version.replace("v", "").split(".")[0], 10);
    if (major < 18) throw new Error(`Node version ${version} is too old (needs Node >= 18)`);
  });

  // 3. npm Installation Check
  runCheck("npm Installation", () => {
    const output = execSync("npm --version", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (!/^\d+\.\d+\.\d+/.test(output)) throw new Error(`Unexpected npm version output: ${output}`);
  });

  // 4. TypeScript Availability Check
  runCheck("TypeScript Compiler", () => {
    const output = execSync("npx tsc --version", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (!output.includes("Version")) throw new Error(`Unexpected TypeScript compiler output: ${output}`);
  });

  // 5. AI Operating System Health Check
  runCheck("AI Operating System (.agents/)", () => {
    const agentsDir = path.join(process.cwd(), ".agents");
    if (!fs.existsSync(agentsDir)) throw new Error("Missing .agents/ directory");
    const versionPath = path.join(agentsDir, "VERSION");
    if (!fs.existsSync(versionPath)) throw new Error("Missing VERSION file in .agents/");
    const version = fs.readFileSync(versionPath, "utf-8").trim();
    if (!version) throw new Error("VERSION file is empty");
  });

  // 6. Git Repository Health Check
  runCheck("Git Repository Health", () => {
    const output = execSync("git rev-parse --is-inside-work-tree", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (output !== "true") throw new Error("Not inside a valid Git working directory");
  });

  // 7. SSH Service Status Check
  runCheck("SSH Command Availability", () => {
    try {
      execSync("ssh -V", { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not recognized") || msg.includes("not found")) {
        throw new Error("SSH command client is not installed or not in PATH");
      }
    }
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passedChecks} PASSED, ${failedChecks} FAILED`);
  console.log("==================================================");

  if (failedChecks > 0) {
    process.exit(1);
  }
}
