// RemoteFix AI Runtime - Logger Module
export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  requestId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

export class StructuredLogger {
  private requestId: string;

  constructor(requestId = "system") {
    this.requestId = requestId;
  }

  private log(level: "info" | "warn" | "error", message: string, durationMs?: number, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: this.requestId,
      durationMs,
      metadata,
    };
    console.log(JSON.stringify(entry));
  }

  info(message: string, durationMs?: number, metadata?: Record<string, any>) {
    this.log("info", message, durationMs, metadata);
  }

  warn(message: string, durationMs?: number, metadata?: Record<string, any>) {
    this.log("warn", message, durationMs, metadata);
  }

  error(message: string, durationMs?: number, metadata?: Record<string, any>) {
    this.log("error", message, durationMs, metadata);
  }
}
