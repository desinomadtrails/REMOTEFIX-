// RemoteFix AI Engine - AI Service Orchestration Hook
import { AIEngine } from "./AIEngine.js";
import { WorkflowRunner } from "./WorkflowRunner.js";

export class AIService {
  public static async processEngineeringRequest(request: { type: string; details: string; file?: string }) {
    if (request.type === "plan") {
      return await AIEngine.plan(request.details);
    }
    if (request.type === "workflow") {
      return await WorkflowRunner.runFeatureWorkflow(request.details);
    }
    return { success: false, message: "Request type not mapped." };
  }
}
