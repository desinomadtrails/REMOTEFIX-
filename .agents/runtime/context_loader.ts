// RemoteFix AI Runtime - Context Loader Module
import * as fs from "fs";
import * as path from "path";

export class ContextLoader {
  private baseDir: string;
  private tokenBudget = 12000;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  loadContext(files: string[]): { content: string; tokensUsed: number } {
    let combinedContent = "";
    let mockTokens = 0;

    for (const f of files) {
      const fullPath = path.resolve(this.baseDir, f);
      if (fs.existsSync(fullPath)) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        combinedContent += `\n--- FILE: ${f} ---\n${fileContent}`;
        mockTokens += fileContent.split(/\s+/).length; // rough estimate

        if (mockTokens > this.tokenBudget) {
          combinedContent += `\n[Warning: Context Budget Exceeded limit of ${this.tokenBudget} tokens]`;
          break;
        }
      }
    }

    return { content: combinedContent, tokensUsed: mockTokens };
  }
}
