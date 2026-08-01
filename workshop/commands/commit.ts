import { GitService } from "../services/GitService.js";

export async function handleCommit(message: string): Promise<void> {
  if (!message) {
    console.error("Error: Please provide a commit message.");
    console.error("Usage: rf commit \"<commit-message>\"");
    process.exit(1);
  }

  console.log("Staging all changes...");
  try {
    GitService.stageAll();
    console.log("Creating commit...");
    const output = GitService.commit(message);
    console.log(`\n==================================================`);
    console.log(`Commit Created Successfully`);
    console.log(`==================================================`);
    console.log(output);
    console.log(`==================================================`);
  } catch (error: any) {
    console.error(`Commit failed: ${error.message}`);
    process.exit(1);
  }
}
