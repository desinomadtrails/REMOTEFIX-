import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class OpenAIProvider extends BaseProvider {
  public name = "OpenAI";
  protected defaultModel = "gpt-4o";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || this.defaultModel;
    const userPrompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not configured.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    });

    if (!response.ok) throw new Error(`OpenAI HTTP Error ${response.status}`);

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const latencyMs = Date.now() - startTime;
    const promptTokens = data.usage?.prompt_tokens || Math.round(userPrompt.length / 4);
    const completionTokens = data.usage?.completion_tokens || Math.round(content.length / 4);

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
    return !!process.env.OPENAI_API_KEY;
  }
}
