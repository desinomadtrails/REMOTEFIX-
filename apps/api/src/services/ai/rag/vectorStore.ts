export interface VectorRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  tenantId?: string;
  vector: number[];
  metadata?: Record<string, any>;
}

export interface VectorSearchResult extends VectorRecord {
  score: number;
}

export interface VectorSearchOptions {
  limit?: number;
  tenantId?: string;
  category?: string;
  minScore?: number;
}

export interface BaseVectorStore {
  name: string;
  upsert(records: VectorRecord[]): Promise<void>;
  search(queryVector: number[], options: VectorSearchOptions): Promise<VectorSearchResult[]>;
}

export class InMemoryVectorStore implements BaseVectorStore {
  public name = "InMemoryVectorStore";
  private store = new Map<string, VectorRecord>();

  private cosineSimilarity(v1: number[], v2: number[]): number {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      normA += v1[i] * v1[i];
      normB += v2[i] * v2[i];
    }
    return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async upsert(records: VectorRecord[]): Promise<void> {
    for (const record of records) {
      this.store.set(record.id, record);
    }
  }

  public async search(queryVector: number[], options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];
    const limit = options.limit || 5;

    for (const record of this.store.values()) {
      // Tenant Isolation Filter
      if (options.tenantId && record.tenantId && record.tenantId !== options.tenantId) {
        continue;
      }
      if (options.category && record.category !== options.category) {
        continue;
      }

      const score = this.cosineSimilarity(queryVector, record.vector);
      if (options.minScore !== undefined && score < options.minScore) {
        continue;
      }

      results.push({ ...record, score });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export class VectorStoreFactory {
  private static store: BaseVectorStore = new InMemoryVectorStore();

  public static getStore(): BaseVectorStore {
    return this.store;
  }
}
