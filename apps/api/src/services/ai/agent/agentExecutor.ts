import { EnterpriseToolRegistry } from "./enterpriseToolRegistry.js";
import { AIWorkflowEngine, WorkflowStep } from "./workflowEngine.js";
import { UserContext } from "./permissionEngine.js";

export class AIAgentExecutor {
  /** Single entrypoint for AI Agent Tool & Multi-Step Workflow Execution */
  public static async executeAction(toolId: string, args: Record<string, any>, user: UserContext) {
    const startTime = Date.now();
    try {
      const result = await EnterpriseToolRegistry.executeTool(toolId, args, user);
      return {
        success: true,
        toolId,
        result,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId,
        error: err.message,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  public static async executeWorkflow(steps: WorkflowStep[], user: UserContext) {
    return await AIWorkflowEngine.executeWorkflow(steps, user);
  }
}
