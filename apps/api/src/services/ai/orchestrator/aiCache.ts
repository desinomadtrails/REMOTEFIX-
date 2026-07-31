import { AiCompletionResult } from "../types.js";

interface CacheEntry {
  result: AiCompletionResult;
  expiresAt: number;
}

export class AiCache {
  private static cacheMap = new Map<string, CacheEntry>();
  private static defaultTtlMs = 5 * 60 * 1000; // 5 minutes TTL

  private static generateKey(tenantId: string | undefined, requestType: string, prompt: string): string {
    return `${tenantId || "global"}:${requestType}:${prompt.trim().toLowerCase()}`;
  }

  public static get(tenantId: string | undefined, requestType: string, prompt: string): AiCompletionResult | null {
    const key = this.generateKey(tenantId, requestType, prompt);
    const entry = this.cacheMap.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cacheMap.delete(key);
      return null;
    }

    return { ...entry.result, providerUsed: `${entry.result.providerUsed} (Cached)` };
  }

  public static set(tenantId: string | undefined, requestType: string, prompt: string, result: AiCompletionResult, ttlMs?: number): void {
    const key = this.generateKey(tenantId, requestType, prompt);
    this.cacheMap.set(key, {
      result,
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs),
    });
  }

  public static clear(): void {
    this.cacheMap.clear();
  }
}
