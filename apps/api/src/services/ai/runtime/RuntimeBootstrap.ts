// RemoteFix AI Engine - Runtime Bootstrap
import * as fs from "fs";
import * as path from "path";

export class RuntimeBootstrap {
  private static isBootstrapped = false;

  public static bootstrap(): boolean {
    if (this.isBootstrapped) return true;

    // Verify presence of frozen .agents layer directories
    const agentsPath = path.resolve(process.cwd(), ".agents");
    const requiredDirs = ["knowledge", "templates", "playbooks", "rules", "checks", "examples", "orchestration", "skills"];

    for (const d of requiredDirs) {
      const fullPath = path.join(agentsPath, d);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Framework Bootstrapping Failed: Missing required directory: ${d}`);
      }
    }

    this.isBootstrapped = true;
    return true;
  }
}
