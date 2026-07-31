import { PromptRegistry } from "./promptRegistry.js";
import { ContextBuilder, ContextOptions } from "./contextBuilder.js";
import { ModelRouter } from "./modelRouter.js";
import { ToolRegistry } from "./toolRegistry.js";
import { AiCache } from "./aiCache.js";
import { MemoryLayer } from "./memoryLayer.js";
import { AIProviderFactory } from "../aiFactory.js";
import { AiCompletionResult } from "../types.js";

export interface OrchestratorRequest {
  requestType: "triage" | "diagnosis" | "customer_chat" | "executive_report" | string;
  promptVariables?: Record<string, string>;
  contextOptions?: ContextOptions;
  useCache?: boolean;
  tenantId?: string;
  toolsToExecute?: string[];
}

export interface OrchestratorResponse {
  success: boolean;
  result: AiCompletionResult;
  promptVersion: string;
  cacheHit: boolean;
  toolsExecuted?: Record<string, any>;
  routeDecision: { providerName: string; modelName: string; reasoning: string };
}

export class AIOrchestrator {
  /** Single Entrypoint for all AI Requests in RemoteFix Platform */
  public static async execute(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    const promptVars = request.promptVariables || {};

    // 1. Render Prompt Template
    const { prompt: userPrompt, template } = PromptRegistry.renderPrompt(request.requestType, promptVars);

    // 2. Check AI Response Cache
    if (request.useCache !== false) {
      const cached = AiCache.get(request.tenantId, request.requestType, userPrompt);
      if (cached) {
        return {
          success: true,
          result: cached,
          promptVersion: template.version,
          cacheHit: true,
          routeDecision: { providerName: cached.providerUsed, modelName: cached.modelUsed, reasoning: "Served from AI Cache" },
        };
      }
    }

    // 3. Assemble Context & System Prompt
    const systemContext = ContextBuilder.buildSystemContext(request.contextOptions || {});
    const fullSystemPrompt = `${template.systemPrompt}\n${systemContext}`;

    // 4. Model Routing Decision
    const routeDecision = ModelRouter.route(request.requestType);

    // 5. Execute Tool Calls if requested
    const toolResults: Record<string, any> = {};
    if (request.toolsToExecute && request.toolsToExecute.length > 0) {
      for (const toolName of request.toolsToExecute) {
        try {
          toolResults[toolName] = await ToolRegistry.executeTool(toolName, promptVars);
        } catch (err: any) {
          toolResults[toolName] = { error: err.message };
        }
      }
    }

    // 6. Execute Provider Request with Failover
    const result = await AIProviderFactory.executeWithFailover({
      prompt: userPrompt,
      systemPrompt: fullSystemPrompt,
      temperature: template.temperature,
      maxTokens: template.maxTokens,
    });

    // 7. Store in Cache
    if (request.useCache !== false) {
      AiCache.set(request.tenantId, request.requestType, userPrompt, result);
    }

    // 8. Save Conversation Memory if session/customer key provided
    if (request.contextOptions?.customerName) {
      MemoryLayer.saveMemory("customer", request.contextOptions.customerName, {
        lastQuery: userPrompt,
        lastResult: result.content,
      });
    }

    return {
      success: true,
      result,
      promptVersion: template.version,
      cacheHit: false,
      toolsExecuted: Object.keys(toolResults).length > 0 ? toolResults : undefined,
      routeDecision,
    };
  }
}
