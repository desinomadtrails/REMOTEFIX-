import { AIService } from "../services/AIService.js";

export async function handleReview(targetFile: string): Promise<void> {
  if (!targetFile) {
    console.error("Error: Please provide a target file path to review.");
    console.error("Usage: rf review <file-path>");
    process.exit(1);
  }

  console.log(`Starting AI review for target file: ${targetFile}...`);
  try {
    const report = await AIService.review(targetFile);
    console.log(`\n==================================================`);
    console.log(`AI Review Report: ${targetFile}`);
    console.log(`==================================================`);
    console.log(`Status: ${report.approved ? "APPROVED" : "REJECTED"}`);
    if (report.issues && report.issues.length > 0) {
      console.log(`\nIssues Found:`);
      report.issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. ${issue}`);
      });
    } else {
      console.log(`\nNo quality or lean code compliance issues detected.`);
    }
    console.log(`==================================================`);
  } catch (error: any) {
    console.error(`AI Review execution failed: ${error.message}`);
    process.exit(1);
  }
}
