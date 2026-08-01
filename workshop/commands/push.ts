import { execSync } from "child_process";

export async function handlePush(): Promise<void> {
  console.log("Pushing local commits to remote origin...");
  try {
    const output = execSync("git push", { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    console.log(`\n==================================================`);
    console.log(`Push Executed Successfully`);
    console.log(`==================================================`);
    if (output) console.log(output);
    else console.log("Everything up-to-date.");
    console.log(`==================================================`);
  } catch (error: unknown) {
    const hasStderr = error && typeof error === "object" && "stderr" in error;
    const errMsg = hasStderr
      ? String((error as { stderr: unknown }).stderr).trim()
      : error instanceof Error
      ? error.message
      : String(error);
    console.error(`Push failed: ${errMsg}`);
    process.exit(1);
  }
}
