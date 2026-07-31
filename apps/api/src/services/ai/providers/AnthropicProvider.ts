import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class AnthropicProvider extends BaseProvider {
  public name = "Anthropic";
  protected defaultModel = "claude-3-5-sonnet";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || this.defaultModel;
    const userPrompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not configured.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: options.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) throw new Error(`Anthropic HTTP Error ${response.status}`);

    const data: any = await response.json();
    const content = data.content?.[0]?.text || "";
    const latencyMs = Date.now() - startTime;
    const promptTokens = data.usage?.input_tokens || Math.round(userPrompt.length / 4);
    const completionTokens = data.usage?.output_tokens || Math.round(content.length / 4);

    return {
      content,
      providerUsed: this.name,
      modelUsed: model,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      latencyMs,
      estimatedCostUsd: this.estimateCost(promptTokens, completionTokens),
    };
  }

  public async healthCheck(): Promise<boolean> {
    return !!process.env.ANTHROPIC_API_KEY;
  }
}
