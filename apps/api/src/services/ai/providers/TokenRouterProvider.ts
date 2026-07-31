import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class TokenRouterProvider extends BaseProvider {
  public name = "TokenRouter";
  protected defaultModel = "moonshotai/kimi-k3-free";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const apiKey = process.env.TOKENROUTER_API_KEY;
    const baseUrl = process.env.TOKENROUTER_BASE_URL || "https://api.tokenrouter.com/v1";
    const model = process.env.TOKENROUTER_MODEL || this.defaultModel;

    const userPrompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    if (!apiKey) {
      throw new Error("TOKENROUTER_API_KEY environment variable is not configured.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: options.messages || [{ role: "user", content: userPrompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1024,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`TokenRouter HTTP Error ${response.status}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content || "";
      const latencyMs = Date.now() - startTime;
      const promptTokens = data?.usage?.prompt_tokens || Math.round(userPrompt.length / 4);
      const completionTokens = data?.usage?.completion_tokens || Math.round(content.length / 4);
      const totalTokens = promptTokens + completionTokens;

      return {
        content,
        providerUsed: this.name,
        modelUsed: model,
        usage: { promptTokens, completionTokens, totalTokens },
        latencyMs,
        estimatedCostUsd: this.estimateCost(promptTokens, completionTokens),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`TokenRouter Provider Error: ${err.message}`);
    }
  }

  public async healthCheck(): Promise<boolean> {
    return !!process.env.TOKENROUTER_API_KEY;
  }
}
