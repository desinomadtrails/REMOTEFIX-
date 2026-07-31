// RemoteFix AI Runtime - Artifact Manager Module
import * as fs from "fs";
import * as path from "path";

export class ArtifactManager {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  saveArtifact(name: string, content: string) {
    const fullPath = path.join(this.outputDir, name);
    fs.writeFileSync(fullPath, content, "utf-8");
  }

  loadArtifact(name: string): string {
    const fullPath = path.join(this.outputDir, name);
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf-8") : "";
  }
}
