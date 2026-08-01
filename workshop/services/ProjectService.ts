import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "../config/config.js";
import { RepositoryScanner } from "../../apps/api/src/services/ai/runtime/RepositoryScanner.js";

export class ProjectService {
  public static getMetadata() {
    const rootPkgPath = path.join(CONFIG.projectRoot, "package.json");
    const rootPkg = fs.existsSync(rootPkgPath) ? JSON.parse(fs.readFileSync(rootPkgPath, "utf-8")) : {};
    
    const aiVersionPath = path.join(CONFIG.agentsDir, "VERSION");
    const aiVersion = fs.existsSync(aiVersionPath) ? fs.readFileSync(aiVersionPath, "utf-8").trim() : "Unknown";

    const scanResult = RepositoryScanner.scan();

    return {
      projectName: rootPkg.name || "remotefix",
      projectVersion: rootPkg.version || "1.0.0",
      aiOsVersion: aiVersion,
      structure: scanResult,
      paths: {
        root: CONFIG.projectRoot,
        agents: CONFIG.agentsDir,
      }
    };
  }
}
