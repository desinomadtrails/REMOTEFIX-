import { AIService } from "../services/AIService.js";

export async function handlePlan(taskDescription: string): Promise<void> {
  if (!taskDescription) {
    console.error("Error: Please provide a task description to plan.");
    console.error("Usage: rf plan \"<task-description>\"");
    process.exit(1);
  }

  console.log(`Generating AI implementation plan for: "${taskDescription}"...`);
  try {
    const result = await AIService.plan(taskDescription);
    console.log(`\n==================================================`);
    console.log(`AI Plan Generated Successfully!`);
    console.log(`==================================================`);
    console.log(`Risk Rating: ${result.riskRating.toUpperCase()}`);
    console.log(`Plan written to implementation_plan.md in project root.`);
    console.log(`==================================================`);
  } catch (error: any) {
    console.error(`AI Plan generation failed: ${error.message}`);
    process.exit(1);
  }
}
