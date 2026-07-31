import { VectorStoreFactory, VectorSearchResult } from "./vectorStore.js";
import { EmbeddingFactory } from "./embeddings.js";
import { RagStore } from "./ragStore.js";
import { AIOrchestrator } from "../orchestrator/aiOrchestrator.js";

export interface Citation {
  documentTitle: string;
  category: string;
  snippet: string;
  confidenceScore: number;
}

export interface EnterpriseRAGResult {
  query: string;
  retrievedDocuments: VectorSearchResult[];
  citations: Citation[];
  confidenceScore: number;
  answer: string;
  providerUsed: string;
  modelUsed: string;
}

export class EnterpriseRAGEngine {
  /** Hybrid Semantic Vector & Keyword Search Engine with Citations */
  public static async query(queryText: string, options?: { tenantId?: string; limit?: number }): Promise<EnterpriseRAGResult> {
    const startTime = Date.now();
    const limit = options?.limit || 3;
    const embeddingProvider = EmbeddingFactory.getProvider();
    const vectorStore = VectorStoreFactory.getStore();

    // 1. Generate query embedding
    const queryVector = await embeddingProvider.embedQuery(queryText);

    // 2. Search Vector Database with Tenant Isolation
    let vectorResults = await vectorStore.search(queryVector, { tenantId: options?.tenantId, limit });

    // 3. Fallback to pre-indexed RagStore if vector DB is empty
    if (vectorResults.length === 0) {
      const fallbackDocs = RagStore.search(queryText, limit);
      vectorResults = fallbackDocs.map(d => ({
        id: d.id,
        title: d.title,
        content: d.content,
        category: d.category,
        vector: [],
        score: d.score || 0.85,
      }));
    }

    // 4. Build Citations & System Context
    const citations: Citation[] = vectorResults.map(doc => ({
      documentTitle: doc.title,
      category: doc.category,
      snippet: doc.content.slice(0, 150) + "...",
      confidenceScore: Math.min(0.99, Math.max(0.70, doc.score || 0.85)),
    }));

    const overallConfidence = citations.length > 0
      ? citations.reduce((sum, c) => sum + c.confidenceScore, 0) / citations.length
      : 0.50;

    const ragContext = `[ENTERPRISE KNOWLEDGE CONTEXT]\n` +
      vectorResults.map((d, idx) => `[Source ${idx + 1}: ${d.title}]\n${d.content}`).join("\n\n");

    // 5. Execute LLM completion via AI Orchestrator
    const orchestration = await AIOrchestrator.execute({
      requestType: "customer_chat",
      promptVariables: {
        customerName: "Technician",
        userMessage: `${queryText}\n\n${ragContext}`,
      },
      useCache: true,
      tenantId: options?.tenantId,
    });

    return {
      query: queryText,
      retrievedDocuments: vectorResults,
      citations,
      confidenceScore: Math.round(overallConfidence * 100) / 100,
      answer: orchestration.result.content,
      providerUsed: orchestration.result.providerUsed,
      modelUsed: orchestration.result.modelUsed,
    };
  }
}
