import { execSync } from "child_process";

export async function handleCommit(message: string): Promise<void> {
  if (!message) {
    console.error("Error: Please provide a commit message.");
    console.error("Usage: rf commit \"<commit-message>\"");
    process.exit(1);
  }

  console.log("Staging all changes...");
  try {
    execSync("git add .", { stdio: ["ignore", "ignore", "pipe"] });
    console.log("Creating commit...");
    const sanitizedMsg = message.replace(/"/g, '\\"');
    const output = execSync(`git commit -m "${sanitizedMsg}"`, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    console.log(`\n==================================================`);
    console.log(`Commit Created Successfully`);
    console.log(`==================================================`);
    console.log(output);
    console.log(`==================================================`);
  } catch (error: unknown) {
    const hasStderr = error && typeof error === "object" && "stderr" in error;
    const errMsg = hasStderr
      ? String((error as { stderr: unknown }).stderr).trim()
      : error instanceof Error
      ? error.message
      : String(error);
    console.error(`Commit failed: ${errMsg}`);
    process.exit(1);
  }
}
