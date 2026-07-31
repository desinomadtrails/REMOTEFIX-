// RemoteFix AI Runtime - Workflow Engine Module
import { ExecutionPlan } from "./planner";
import { StructuredLogger } from "./logger";

export class WorkflowEngine {
  private logger: StructuredLogger;

  constructor(logger: StructuredLogger) {
    this.logger = logger;
  }

  async runWorkflow(plan: ExecutionPlan, executeStep: (skill: string, action: string) => Promise<boolean>): Promise<boolean> {
    this.logger.info("Executing AI workflow pipeline...");

    for (const step of plan.steps) {
      this.logger.info(`Activating skill: ${step.skill} - ${step.action}`);
      const success = await executeStep(step.skill, step.action);

      if (!success) {
        this.logger.error(`Pipeline step failed: ${step.skill}`);
        return false;
      }
      step.completed = true;
    }

    this.logger.info("Workflow pipeline completed successfully.");
    return true;
  }
}
