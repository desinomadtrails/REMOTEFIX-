import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { RepositoryScanner } from "../../apps/api/src/services/ai/runtime/RepositoryScanner.js";

export async function handleStatus(): Promise<void> {
  const root = process.cwd();
  
  const rootPkgPath = path.join(root, "package.json");
  const rootPkg = fs.existsSync(rootPkgPath) ? JSON.parse(fs.readFileSync(rootPkgPath, "utf-8")) : {};
  
  const aiVersionPath = path.join(root, ".agents", "VERSION");
  const aiVersion = fs.existsSync(aiVersionPath) ? fs.readFileSync(aiVersionPath, "utf-8").trim() : "Unknown";

  const scan = RepositoryScanner.scan();
  
  let branch = "Unknown";
  let gitStatus = "";
  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    gitStatus = execSync("git status", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}

  console.log(`==================================================`);
  console.log(`RemoteFix Project Status`);
  console.log(`==================================================`);
  console.log(`Project:        ${rootPkg.name || "remotefix"} (v${rootPkg.version || "1.0.0"})`);
  console.log(`AI OS Version:  ${aiVersion}`);
  console.log(`Branch:         ${branch}`);
  console.log(`Workspaces:     ${scan.apps.length} Apps, ${scan.packages.length} Packages`);
  console.log(`\nGit Status:`);
  console.log(gitStatus);
  console.log(`==================================================`);
}
