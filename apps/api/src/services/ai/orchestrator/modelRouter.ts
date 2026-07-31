export interface ModelRouteDecision {
  providerName: string;
  modelName: string;
  reasoning: string;
}

export class ModelRouter {
  /** Intelligently selects provider and model based on request complexity and requirements */
  public static route(requestType: string, options?: { requiresVision?: boolean; requiresLongContext?: boolean }): ModelRouteDecision {
    if (options?.requiresVision) {
      return {
        providerName: "OpenAI",
        modelName: "gpt-4o",
        reasoning: "Task requires multimodal vision understanding.",
      };
    }

    if (options?.requiresLongContext || requestType === "executive_report") {
      return {
        providerName: "Google Gemini",
        modelName: "gemini-1.5-pro",
        reasoning: "Task requires ultra-long context window analysis.",
      };
    }

    if (requestType === "diagnosis" || requestType === "predictive_maintenance") {
      return {
        providerName: "TokenRouter",
        modelName: "moonshotai/kimi-k3-free",
        reasoning: "Complex technical diagnosis requires high-tier reasoning model.",
      };
    }

    // Default fast & cheap routing
    return {
      providerName: "TokenRouter",
      modelName: "moonshotai/kimi-k3-free",
      reasoning: "Standard fast routing via TokenRouter provider.",
    };
  }
}
