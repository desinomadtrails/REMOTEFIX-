// RemoteFix AI Engine - Context Resolver
import * as fs from "fs";
import * as path from "path";

export class ContextResolver {
  public static resolve(taskType: string): string {
    const agentsPath = path.resolve(process.cwd(), ".agents");
    let combinedContext = "";

    // Resolve Knowledge
    const techStackPath = path.join(agentsPath, "knowledge", "tech-stack.md");
    if (fs.existsSync(techStackPath)) {
      combinedContext += `\n\n[KNOWLEDGE BASE]\n${fs.readFileSync(techStackPath, "utf-8")}`;
    }

    // Resolve Rules
    const rulesPath = path.join(agentsPath, "rules", `${taskType.toLowerCase()}.md`);
    if (fs.existsSync(rulesPath)) {
      combinedContext += `\n\n[RULES ENFORCED]\n${fs.readFileSync(rulesPath, "utf-8")}`;
    }

    return combinedContext;
  }
}
