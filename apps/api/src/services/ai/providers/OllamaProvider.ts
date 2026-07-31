import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class OllamaProvider extends BaseProvider {
  public name = "Ollama";
  protected defaultModel = "llama3";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || this.defaultModel;
    const userPrompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: userPrompt }],
        stream: false,
      }),
    });

    if (!response.ok) throw new Error(`Ollama Local LLM HTTP Error ${response.status}`);

    const data: any = await response.json();
    const content = data.message?.content || "";
    const latencyMs = Date.now() - startTime;
    const promptTokens = Math.round(userPrompt.length / 4);
    const completionTokens = Math.round(content.length / 4);

    return {
      content,
      providerUsed: this.name,
      modelUsed: model,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      latencyMs,
      estimatedCostUsd: 0,
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${process.env.OLLAMA_URL || "http://localhost:11434"}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
