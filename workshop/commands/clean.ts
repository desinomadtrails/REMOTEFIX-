import * as fs from "fs";
import * as path from "path";

export async function handleClean(): Promise<void> {
  console.log("Cleaning temporary development artifacts...");
  
  const root = process.cwd();
  const filesToDelete = [
    "implementation_plan.md",
    "review_report.md",
    "execution_log.md",
  ];

  let removedCount = 0;

  filesToDelete.forEach(file => {
    const filePath = path.join(root, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`  - Removed: ${file}`);
        removedCount++;
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`  - Failed to remove ${file}: ${errMsg}`);
      }
    }
  });

  if (removedCount === 0) {
    console.log("No temporary artifacts found. Project is already clean.");
  } else {
    console.log(`Total removed: ${removedCount} files.`);
  }
}
