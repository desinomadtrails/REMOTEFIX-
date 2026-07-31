import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class GeminiProvider extends BaseProvider {
  public name = "Google Gemini";
  protected defaultModel = "gemini-1.5-pro";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    const userPrompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });

    if (!response.ok) throw new Error(`Google Gemini HTTP Error ${response.status}`);

    const data: any = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const latencyMs = Date.now() - startTime;
    const promptTokens = Math.round(userPrompt.length / 4);
    const completionTokens = Math.round(content.length / 4);

    return {
      content,
      providerUsed: this.name,
      modelUsed: this.defaultModel,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      latencyMs,
      estimatedCostUsd: this.estimateCost(promptTokens, completionTokens),
    };
  }

  public async healthCheck(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
  }
}
