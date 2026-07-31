// RemoteFix AI Runtime - Memory Module
export interface MemoryStore {
  history: Array<{ task: string; timestamp: string; outcome: string }>;
}

export class AgentMemory {
  private store: MemoryStore = { history: [] };

  record(task: string, outcome: string) {
    this.store.history.push({
      task,
      timestamp: new Date().toISOString(),
      outcome,
    });
  }

  getHistory() {
    return this.store.history;
  }
}
