// RemoteFix AI Runtime - Planner Module
import { RoutedTask } from "./task_router";

export interface PlanStep {
  id: number;
  skill: string;
  action: string;
  completed: boolean;
}

export interface ExecutionPlan {
  steps: PlanStep[];
  rollbackSteps: string[];
  riskRating: "low" | "medium" | "high";
}

export class PlanGenerator {
  generate(task: RoutedTask): ExecutionPlan {
    const steps: PlanStep[] = [];
    const rollbackSteps: string[] = ["git reset --hard HEAD"];

    // Task specific planning
    if (task.category === "Database") {
      steps.push({ id: 1, skill: "architect", action: "Design schema mappings", completed: false });
      steps.push({ id: 2, skill: "database", action: "Run Drizzle generate & migrate", completed: false });
      rollbackSteps.push("drizzle-kit drop");
    } else {
      steps.push({ id: 1, skill: "planner", action: "Review feature requirements", completed: false });
      steps.push({ id: 2, skill: "implementer", action: "Write application code changes", completed: false });
    }

    steps.push({ id: steps.length + 1, skill: "reviewer", action: "Run linter and check code styles", completed: false });

    return {
      steps,
      rollbackSteps,
      riskRating: task.priority === "high" ? "high" : "medium",
    };
  }
}
