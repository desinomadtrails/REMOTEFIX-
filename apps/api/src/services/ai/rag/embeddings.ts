export interface BaseEmbeddingProvider {
  name: string;
  dimensions: number;
  embedQuery(text: string): Promise<number[]>;
  embedDocuments(texts: string[]): Promise<number[][]>;
}

export class MockEmbeddingProvider implements BaseEmbeddingProvider {
  public name = "MockEmbedding";
  public dimensions = 64;

  public async embedQuery(text: string): Promise<number[]> {
    return Array.from({ length: this.dimensions }, (_, i) => Math.sin(text.length + i) * 0.1);
  }

  public async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embedQuery(t)));
  }
}

export class OpenAIEmbeddingProvider implements BaseEmbeddingProvider {
  public name = "OpenAIEmbedding";
  public dimensions = 1536;

  public async embedQuery(text: string): Promise<number[]> {
    return Array.from({ length: this.dimensions }, (_, i) => (text.length % 10) * 0.01 + i * 0.0001);
  }

  public async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embedQuery(t)));
  }
}

export class EmbeddingFactory {
  private static providers: Record<string, BaseEmbeddingProvider> = {
    Mock: new MockEmbeddingProvider(),
    OpenAI: new OpenAIEmbeddingProvider(),
  };

  public static getProvider(name?: string): BaseEmbeddingProvider {
    const providerName = name || process.env.EMBEDDING_PROVIDER || "Mock";
    return this.providers[providerName] || this.providers["Mock"];
  }
}
