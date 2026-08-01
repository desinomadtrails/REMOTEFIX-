import { AIEngine } from "../../apps/api/src/services/ai/runtime/AIEngine.js";

export class AIService {
  public static async plan(taskDescription: string) {
    return await AIEngine.plan(taskDescription);
  }

  public static async review(targetFile: string) {
    return await AIEngine.review(targetFile);
  }
}
