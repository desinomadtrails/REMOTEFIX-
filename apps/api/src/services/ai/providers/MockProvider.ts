import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class MockProvider extends BaseProvider {
  public name = "Mock";
  protected defaultModel = "mock-model";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const prompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    let mockReply = "Mock AI Response: Operation analyzed and processed successfully.";
    if (prompt.toLowerCase().includes("triage") || prompt.toLowerCase().includes("bsod")) {
      mockReply = JSON.stringify({ category: "Hardware Failure", recommendedPriority: "high", confidenceScore: 0.96 });
    }

    const latencyMs = Date.now() - startTime;
    const promptTokens = Math.round(prompt.length / 4);
    const completionTokens = Math.round(mockReply.length / 4);

    return {
      content: mockReply,
      providerUsed: this.name,
      modelUsed: this.defaultModel,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      latencyMs,
      estimatedCostUsd: 0,
    };
  }

  public async healthCheck(): Promise<boolean> {
    return true;
  }
}
