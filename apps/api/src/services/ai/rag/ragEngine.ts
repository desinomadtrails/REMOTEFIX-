import { RagStore, KnowledgeDocument } from "./ragStore.js";
import { AIOrchestrator } from "../orchestrator/aiOrchestrator.js";

export class AIRagEngine {
  /** RAG Knowledge Base Retrieval */
  public static searchKnowledgeBase(query: string, limit = 3): KnowledgeDocument[] {
    return RagStore.search(query, limit);
  }

  /** Augmented RAG Generation using AI Orchestrator */
  public static async chatWithRag(userQuery: string, tenantId?: string) {
    const startTime = Date.now();
    const retrievedDocs = this.searchKnowledgeBase(userQuery, 3);

    const ragContextText = retrievedDocs.length > 0
      ? `[RETRIEVED ENTERPRISE KNOWLEDGE BASE ARTICLES]\n` +
        retrievedDocs.map((d, i) => `Article ${i + 1} (${d.title}): ${d.content}`).join("\n")
      : "No specific knowledge base articles found.";

    const orchestrationResult = await AIOrchestrator.execute({
      requestType: "customer_chat",
      promptVariables: {
        customerName: "Technician",
        userMessage: `${userQuery}\n\n${ragContextText}`,
      },
      useCache: true,
      tenantId,
    });

    return {
      query: userQuery,
      retrievedDocuments: retrievedDocs,
      reply: orchestrationResult.result.content,
      providerUsed: orchestrationResult.result.providerUsed,
      modelUsed: orchestrationResult.result.modelUsed,
      latencyMs: Date.now() - startTime,
    };
  }
}
