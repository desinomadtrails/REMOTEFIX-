// RemoteFix AI Engine - Runtime Bootstrap
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";

export class RuntimeBootstrap {
  private static isBootstrapped = false;
  private static agentsResolvedPath: string | null = null;

  public static getAgentsPath(): string {
    if (this.agentsResolvedPath) return this.agentsResolvedPath;

    // First check environment variable
    if (process.env.REMOTEFIX_AGENTS_PATH) {
      this.agentsResolvedPath = path.resolve(process.env.REMOTEFIX_AGENTS_PATH);
      return this.agentsResolvedPath;
    }

    // Try finding .agents from process.cwd() upwards
    let currentDir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const target = path.join(currentDir, ".agents");
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        this.agentsResolvedPath = target;
        return target;
      }
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }

    // Try finding .agents from this module's directory upwards
    try {
      const modulePath = fileURLToPath(import.meta.url);
      let searchDir = path.dirname(modulePath);
      for (let i = 0; i < 6; i++) {
        const target = path.join(searchDir, ".agents");
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
          this.agentsResolvedPath = target;
          return target;
        }
        const parent = path.dirname(searchDir);
        if (parent === searchDir) break;
        searchDir = parent;
      }
    } catch (e) {
      // Fallback
    }

    // Fallback to resolving relative to process.cwd()
    this.agentsResolvedPath = path.resolve(process.cwd(), ".agents");
    return this.agentsResolvedPath;
  }

  public static bootstrap(): boolean {
    if (this.isBootstrapped) return true;

    const agentsPath = this.getAgentsPath();
    const requiredDirs = ["knowledge", "templates", "playbooks", "rules", "checks", "examples", "orchestration", "skills"];

    // Make sure .agents exists
    if (!fs.existsSync(agentsPath)) {
      try {
        fs.mkdirSync(agentsPath, { recursive: true });
      } catch (err) {
        throw new Error(`Framework Bootstrapping Failed: Cannot create .agents directory at ${agentsPath}`);
      }
    }

    for (const d of requiredDirs) {
      const fullPath = path.join(agentsPath, d);
      if (!fs.existsSync(fullPath)) {
        try {
          fs.mkdirSync(fullPath, { recursive: true });
        } catch (err) {
          throw new Error(`Framework Bootstrapping Failed: Cannot create missing required directory: ${d} at ${fullPath}`);
        }
      }
    }

    this.isBootstrapped = true;
    return true;
  }
}
