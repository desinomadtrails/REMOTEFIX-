import { BaseAIProvider, AiCompletionOptions, AiCompletionResult } from "./types.js";
import { TokenRouterProvider } from "./providers/TokenRouterProvider.js";
import { OpenAIProvider } from "./providers/OpenAIProvider.js";
import { AnthropicProvider } from "./providers/AnthropicProvider.js";
import { GeminiProvider } from "./providers/GeminiProvider.js";
import { AzureOpenAIProvider } from "./providers/AzureOpenAIProvider.js";
import { OllamaProvider } from "./providers/OllamaProvider.js";
import { MockProvider } from "./providers/MockProvider.js";

export class AIProviderFactory {
  private static providersMap: Record<string, BaseAIProvider> = {
    TokenRouter: new TokenRouterProvider(),
    OpenAI: new OpenAIProvider(),
    Anthropic: new AnthropicProvider(),
    "Google Gemini": new GeminiProvider(),
    "Azure OpenAI": new AzureOpenAIProvider(),
    Ollama: new OllamaProvider(),
    Mock: new MockProvider(),
  };

  /** Returns provider by name or primary configured provider */
  public static getProvider(name?: string): BaseAIProvider {
    const providerName = name || process.env.AI_PROVIDER || "TokenRouter";
    return this.providersMap[providerName] || this.providersMap["TokenRouter"] || this.providersMap["Mock"];
  }

  /**
   * Executes completion with automatic failover mechanism.
   * Failover Chain: Configured Provider -> TokenRouter -> OpenAI -> Google Gemini -> Ollama -> Mock Provider
   */
  public static async executeWithFailover(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const primaryName = process.env.AI_PROVIDER || "TokenRouter";
    const failoverChain = Array.from(new Set([primaryName, "TokenRouter", "OpenAI", "Google Gemini", "Ollama", "Mock"]));

    const errors: string[] = [];

    for (const providerName of failoverChain) {
      const provider = this.providersMap[providerName];
      if (!provider) continue;

      try {
        const isHealthy = await provider.healthCheck();
        if (!isHealthy && providerName !== "Mock") {
          errors.push(`${providerName}: Healthcheck failed (missing API key or endpoint down)`);
          continue;
        }

        const result = await provider.chat(options);
        return result;
      } catch (err: any) {
        errors.push(`${providerName}: ${err.message}`);
        console.warn(`[AI Failover Warning] Provider '${providerName}' failed: ${err.message}. Trying next fallback provider...`);
      }
    }

    // Ultimate fallback to deterministic MockProvider to ensure zero API breakage
    const mockProvider = this.providersMap["Mock"];
    return await mockProvider.chat(options);
  }
}
