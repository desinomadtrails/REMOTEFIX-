import { execSync } from "child_process";

export async function handlePull(): Promise<void> {
  console.log("Pulling latest updates from remote origin...");
  try {
    const output = execSync("git pull", { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    console.log(`\n==================================================`);
    console.log(`Pull Executed Successfully`);
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
    console.error(`Pull failed: ${errMsg}`);
    process.exit(1);
  }
}
