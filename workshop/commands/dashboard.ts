import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export async function handleDashboard(): Promise<void> {
  const root = process.cwd();
  const pkgPath = path.join(root, "package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf-8")) : {};
  const aiOsVersionPath = path.join(root, ".agents", "VERSION");
  const aiOsVersion = fs.existsSync(aiOsVersionPath) ? fs.readFileSync(aiOsVersionPath, "utf-8").trim() : "Unknown";

  let branch = "Unknown";
  let gitClean = "Clean";
  let typecheckStatus = "PASS";
  let testStatus = "PASS";
  let sshStatus = "Unavailable";
  let overallHealth = "Healthy";

  // Check Branch & Git Status
  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const gitDiff = execSync("git status --porcelain", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (gitDiff) {
      gitClean = "Dirty";
      overallHealth = "Degraded (Uncommitted changes)";
    }
  } catch {
    gitClean = "Error";
    overallHealth = "Unhealthy";
  }

  // Quick Typecheck (Under 2 seconds target)
  try {
    execSync("npx tsc --noEmit --skipLibCheck workshop/rf.ts", { stdio: ["ignore", "ignore", "ignore"] });
  } catch {
    typecheckStatus = "FAIL";
    overallHealth = "Unhealthy (Compilation errors)";
  }

  // Quick Test Check (Runs fast unit tests)
  try {
    execSync("npx tsx tests/ai_platform.test.ts", { stdio: ["ignore", "ignore", "ignore"] });
  } catch {
    testStatus = "FAIL";
    overallHealth = "Unhealthy (Tests failing)";
  }

  // SSH Check
  if (process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION) {
    sshStatus = "Available (Active Session)";
  } else {
    try {
      execSync("ssh -V", { stdio: ["ignore", "ignore", "ignore"] });
      sshStatus = "Available (Client installed)";
    } catch {}
  }

  console.log(`\n==================================================`);
  console.log(`  RemoteFix Workshop Dashboard`);
  console.log(`==================================================`);
  console.log(`Project:     ${(pkg.name || "REMOTEFIX").toUpperCase()}`);
  console.log(`Workshop:    v${pkg.version || "1.0.0"}`);
  console.log(`AI OS:       v${aiOsVersion}`);
  console.log(`Branch:      ${branch}`);
  console.log(`Git:         ${gitClean}`);
  console.log(`Typecheck:   ${typecheckStatus}`);
  console.log(`Tests:       ${testStatus}`);
  console.log(`SSH:         ${sshStatus}`);
  console.log(`Health:      ${overallHealth}`);
  console.log(`==================================================\n`);
}
