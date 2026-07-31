// RemoteFix AI Engine - Execution Manager
import * as fs from "fs";
import * as path from "path";

export class ExecutionManager {
  public static executeCodeChanges(filePath: string, code: string) {
    const fullPath = path.resolve(process.cwd(), filePath);
    fs.writeFileSync(fullPath, code, "utf-8");
  }
}
