import { EnterpriseToolRegistry } from "./enterpriseToolRegistry.js";
import { UserContext } from "./permissionEngine.js";

export interface WorkflowStep {
  stepId: string;
  toolId: string;
  args: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  stepsExecuted: Array<{ stepId: string; toolId: string; output: any }>;
  error?: string;
}

export class AIWorkflowEngine {
  /** Sequential multi-tool workflow execution engine */
  public static async executeWorkflow(steps: WorkflowStep[], user: UserContext): Promise<WorkflowResult> {
    const executed: Array<{ stepId: string; toolId: string; output: any }> = [];

    for (const step of steps) {
      try {
        const output = await EnterpriseToolRegistry.executeTool(step.toolId, step.args, user);
        executed.push({ stepId: step.stepId, toolId: step.toolId, output });
        if (output?.status === "requires_confirmation") {
          return {
            success: false,
            stepsExecuted: executed,
            error: `Workflow paused: Step '${step.toolId}' requires user confirmation.`,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          stepsExecuted: executed,
          error: `Workflow failed at step '${step.toolId}': ${err.message}`,
        };
      }
    }

    return {
      success: true,
      stepsExecuted: executed,
    };
  }
}
