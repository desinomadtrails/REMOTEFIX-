export interface MemoryItem {
  key: string;
  type: "session" | "conversation" | "customer" | "asset" | "tenant";
  value: any;
  createdAt: string;
}

export class MemoryLayer {
  private static store = new Map<string, MemoryItem>();

  public static saveMemory(type: MemoryItem["type"], key: string, value: any): void {
    const fullKey = `${type}:${key}`;
    this.store.set(fullKey, {
      key,
      type,
      value,
      createdAt: new Date().toISOString(),
    });
  }

  public static getMemory(type: MemoryItem["type"], key: string): any | null {
    const fullKey = `${type}:${key}`;
    const item = this.store.get(fullKey);
    return item ? item.value : null;
  }
}
