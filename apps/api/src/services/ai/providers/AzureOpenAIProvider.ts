import { BaseProvider } from "./BaseProvider.js";
import { AiCompletionOptions, AiCompletionResult } from "../types.js";

export class AzureOpenAIProvider extends BaseProvider {
  public name = "Azure OpenAI";
  protected defaultModel = "gpt-4o";

  public async chat(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT; // e.g. https://my-resource.openai.azure.com/
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
    const userPrompt = options.prompt || (options.messages && options.messages.length > 0 ? options.messages[options.messages.length - 1].content : "");

    if (!apiKey || !endpoint) {
      throw new Error("AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT environment variables are required.");
    }

    const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: options.messages || [{ role: "user", content: userPrompt }],
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) throw new Error(`Azure OpenAI HTTP Error ${response.status}`);

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const latencyMs = Date.now() - startTime;
    const promptTokens = data.usage?.prompt_tokens || Math.round(userPrompt.length / 4);
    const completionTokens = data.usage?.completion_tokens || Math.round(content.length / 4);

    return {
      content,
      providerUsed: this.name,
      modelUsed: deployment,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      latencyMs,
      estimatedCostUsd: this.estimateCost(promptTokens, completionTokens),
    };
  }

  public async healthCheck(): Promise<boolean> {
    return !!process.env.AZURE_OPENAI_KEY && !!process.env.AZURE_OPENAI_ENDPOINT;
  }
}
