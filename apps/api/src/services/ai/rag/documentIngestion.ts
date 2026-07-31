import { VectorStoreFactory } from "./vectorStore.js";
import { EmbeddingFactory } from "./embeddings.js";

export interface IngestionOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export class DocumentIngestionPipeline {
  /** Splits document text into overlapping chunks */
  public static chunkText(text: string, chunkSize = 300, chunkOverlap = 50): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      if (end === text.length) break;
      start += chunkSize - chunkOverlap;
    }

    return chunks;
  }

  /** Ingests raw document into vector database store */
  public static async ingestDocument(doc: { id: string; title: string; category: string; content: string; tenantId?: string }, options?: IngestionOptions): Promise<number> {
    const chunks = this.chunkText(doc.content, options?.chunkSize || 300, options?.chunkOverlap || 50);
    const embeddingProvider = EmbeddingFactory.getProvider();
    const vectorStore = VectorStoreFactory.getStore();

    const records = await Promise.all(
      chunks.map(async (chunk, index) => {
        const vector = await embeddingProvider.embedQuery(chunk);
        return {
          id: `${doc.id}_chunk_${index}`,
          title: `${doc.title} (Part ${index + 1})`,
          content: chunk,
          category: doc.category,
          tenantId: doc.tenantId,
          vector,
          metadata: { parentId: doc.id, chunkIndex: index },
        };
      })
    );

    await vectorStore.upsert(records);
    return chunks.length;
  }
}
