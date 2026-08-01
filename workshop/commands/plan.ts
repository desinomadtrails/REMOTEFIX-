import { AIEngine } from "../../apps/api/src/services/ai/runtime/AIEngine.js";

export async function handlePlan(taskDescription: string): Promise<void> {
  if (!taskDescription) {
    console.error("Error: Please provide a task description to plan.");
    console.error("Usage: rf plan \"<task-description>\"");
    process.exit(1);
  }

  console.log(`Generating AI implementation plan for: "${taskDescription}"...`);
  try {
    const result = await AIEngine.plan(taskDescription);
    console.log(`\n==================================================`);
    console.log(`AI Plan Generated Successfully!`);
    console.log(`==================================================`);
    console.log(`Risk Rating: ${result.riskRating.toUpperCase()}`);
    console.log(`Plan written to implementation_plan.md in project root.`);
    console.log(`==================================================`);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`AI Plan generation failed: ${errMsg}`);
    process.exit(1);
  }
}
