export type MemoryScope =
  | "session"
  | "conversation"
  | "customer"
  | "technician"
  | "asset"
  | "organization"
  | "tenant"
  | "knowledge"
  | "workflow";

export interface MemoryRecord {
  key: string;
  scope: MemoryScope;
  value: any;
  tenantId?: string;
  expiresAt?: number;
  createdAt: number;
}

export class EnterpriseMemoryManager {
  private static memoryStore = new Map<string, MemoryRecord>();

  private static formatKey(scope: MemoryScope, key: string, tenantId?: string): string {
    return `${tenantId || "global"}:${scope}:${key}`;
  }

  public static saveMemory(scope: MemoryScope, key: string, value: any, options?: { tenantId?: string; ttlMs?: number }): void {
    const fullKey = this.formatKey(scope, key, options?.tenantId);
    this.memoryStore.set(fullKey, {
      key,
      scope,
      value,
      tenantId: options?.tenantId,
      expiresAt: options?.ttlMs ? Date.now() + options.ttlMs : undefined,
      createdAt: Date.now(),
    });
  }

  public static getMemory<T = any>(scope: MemoryScope, key: string, tenantId?: string): T | null {
    const fullKey = this.formatKey(scope, key, tenantId);
    const record = this.memoryStore.get(fullKey);
    if (!record) return null;

    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.memoryStore.delete(fullKey);
      return null;
    }

    return record.value as T;
  }

  public static summarizeConversation(messages: Array<{ role: string; content: string }>): string {
    if (!messages || messages.length === 0) return "No prior conversation.";
    return messages.map(m => `${m.role}: ${m.content.slice(0, 100)}...`).join(" | ");
  }

  public static clear(): void {
    this.memoryStore.clear();
  }
}
