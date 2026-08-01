import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export async function handleInfo(): Promise<void> {
  const root = process.cwd();
  const pkgPath = path.join(root, "package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf-8")) : {};
  const aiOsVersionPath = path.join(root, ".agents", "VERSION");
  const aiOsVersion = fs.existsSync(aiOsVersionPath) ? fs.readFileSync(aiOsVersionPath, "utf-8").trim() : "Unknown";

  let gitVersion = "Unknown";
  let npmVersion = "Unknown";
  let branch = "Unknown";
  let commit = "Unknown";

  try {
    gitVersion = execSync("git --version", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    npmVersion = execSync("npm --version", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    commit = execSync("git rev-parse HEAD", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}

  console.log(`==================================================`);
  console.log(`  RemoteFix Developer Workshop - Information`);
  console.log(`==================================================`);
  console.log(`Current Project:   ${pkg.name || "remotefix"}`);
  console.log(`Workshop Version:  v${pkg.version || "1.0.0"}`);
  console.log(`AI OS Version:     ${aiOsVersion}`);
  console.log(`Node Version:      ${process.version}`);
  console.log(`npm Version:       ${npmVersion}`);
  console.log(`Git Version:       ${gitVersion}`);
  console.log(`Current Branch:    ${branch}`);
  console.log(`Current Commit:    ${commit}`);
  console.log(`==================================================`);
}
