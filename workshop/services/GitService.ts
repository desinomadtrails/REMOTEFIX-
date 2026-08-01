import { execSync } from "child_process";

export class GitService {
  private static exec(command: string): string {
    try {
      return execSync(command, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    } catch (error: any) {
      const stderr = error.stderr ? error.stderr.toString() : error.message;
      throw new Error(stderr.trim());
    }
  }

  public static getStatus(): string {
    return this.exec("git status");
  }

  public static getBranch(): string {
    return this.exec("git rev-parse --abbrev-ref HEAD");
  }

  public static stageAll(): void {
    this.exec("git add .");
  }

  public static commit(message: string): string {
    // Avoid nested quotes issues
    const sanitizedMsg = message.replace(/"/g, '\\"');
    return this.exec(`git commit -m "${sanitizedMsg}"`);
  }
}
