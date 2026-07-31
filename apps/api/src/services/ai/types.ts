export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionOptions {
  prompt?: string;
  messages?: AiMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AiUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiCompletionResult {
  content: string;
  providerUsed: string;
  modelUsed: string;
  usage: AiUsageStats;
  latencyMs: number;
  estimatedCostUsd: number;
}

export interface AiModelMetadata {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  supportsVision: boolean;
  supportsToolCalling: boolean;
  supportsStreaming: boolean;
  supportsJson: boolean;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export interface BaseAIProvider {
  name: string;
  initialize(config?: Record<string, any>): Promise<void>;
  chat(options: AiCompletionOptions): Promise<AiCompletionResult>;
  healthCheck(): Promise<boolean>;
  listModels(): string[];
  supports(capability: "vision" | "tools" | "streaming" | "json"): boolean;
  estimateCost(inputTokens: number, outputTokens: number): number;
}
