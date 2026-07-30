import { OfflineSyncQueueItem } from "@remotefix/types";

/**
 * Enterprise Mobile Offline Sync Queue Engine
 * Handles offline ticket updates, signatures, photos, and background sync conflict resolution.
 */
export class MobileOfflineSyncManager {
  private queue: OfflineSyncQueueItem[] = [];

  constructor() {
    this.queue = [];
  }

  /** Queue an action performed while offline */
  public enqueue(actionType: OfflineSyncQueueItem["actionType"], payload: any): OfflineSyncQueueItem {
    const item: OfflineSyncQueueItem = {
      id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      engineerId: payload.engineerId || "eng-101",
      actionType,
      payloadJson: JSON.stringify(payload),
      status: "pending",
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.queue.push(item);
    return item;
  }

  /** Get all pending offline queue items */
  public getPendingQueue(): OfflineSyncQueueItem[] {
    return this.queue.filter((i) => i.status === "pending");
  }

  /** Trigger background synchronization when network connectivity is restored */
  public async sync(apiEndpointUrl: string, authToken: string): Promise<{ syncedCount: number; failedCount: number }> {
    const pending = this.getPendingQueue();
    if (pending.length === 0) return { syncedCount: 0, failedCount: 0 };

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      try {
        const response = await fetch(`${apiEndpointUrl}/api/mobile/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ queueItems: [item] }),
        });

        if (response.ok) {
          item.status = "synced";
          syncedCount++;
        } else {
          item.retryCount++;
          if (item.retryCount >= 3) item.status = "failed";
          failedCount++;
        }
      } catch (err) {
        item.retryCount++;
        if (item.retryCount >= 3) item.status = "failed";
        failedCount++;
      }
    }

    return { syncedCount, failedCount };
  }
}
