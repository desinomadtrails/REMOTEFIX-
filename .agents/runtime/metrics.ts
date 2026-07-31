// RemoteFix AI Runtime - Metrics Module
export interface ExecutionMetrics {
  startTime: number;
  skillUsage: Record<string, number>;
  routingCount: Record<string, number>;
  failureRate: number;
  retryCount: number;
}

export class MetricsCollector {
  private metrics: ExecutionMetrics = {
    startTime: Date.now(),
    skillUsage: {},
    routingCount: {},
    failureRate: 0,
    retryCount: 0,
  };

  trackSkill(skill: string) {
    this.metrics.skillUsage[skill] = (this.metrics.skillUsage[skill] || 0) + 1;
  }

  trackRouting(taskType: string) {
    this.metrics.routingCount[taskType] = (this.metrics.routingCount[taskType] || 0) + 1;
  }

  incrementRetry() {
    this.metrics.retryCount++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptimeMs: Date.now() - this.metrics.startTime,
    };
  }
}
