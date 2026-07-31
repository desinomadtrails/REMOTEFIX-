import { BaseAIProvider, AiCompletionOptions, AiCompletionResult } from "../types.js";
import { MODEL_REGISTRY } from "../modelRegistry.js";

export abstract class BaseProvider implements BaseAIProvider {
  public abstract name: string;
  protected defaultModel: string = "mock-model";

  public async initialize(config?: Record<string, any>): Promise<void> {}

  public abstract chat(options: AiCompletionOptions): Promise<AiCompletionResult>;

  public async healthCheck(): Promise<boolean> {
    return true;
  }

  public listModels(): string[] {
    return Object.keys(MODEL_REGISTRY).filter((m) => MODEL_REGISTRY[m].provider === this.name);
  }

  public supports(capability: "vision" | "tools" | "streaming" | "json"): boolean {
    const meta = MODEL_REGISTRY[this.defaultModel];
    if (!meta) return true;
    if (capability === "vision") return meta.supportsVision;
    if (capability === "tools") return meta.supportsToolCalling;
    if (capability === "streaming") return meta.supportsStreaming;
    if (capability === "json") return meta.supportsJson;
    return true;
  }

  public estimateCost(inputTokens: number, outputTokens: number): number {
    const meta = MODEL_REGISTRY[this.defaultModel];
    if (!meta) return 0;
    return (
      (inputTokens / 1000) * meta.costPer1kInputTokens +
      (outputTokens / 1000) * meta.costPer1kOutputTokens
    );
  }
}
