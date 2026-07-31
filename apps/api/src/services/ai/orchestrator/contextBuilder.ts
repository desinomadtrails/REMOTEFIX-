export interface ContextOptions {
  customerName?: string;
  organizationName?: string;
  ticketId?: string;
  assetTag?: string;
  serviceHistory?: string[];
  recentAlerts?: string[];
}

export class ContextBuilder {
  /** Assembles contextual metadata into structured AI system prompt string */
  public static buildSystemContext(options: ContextOptions): string {
    const parts: string[] = [];

    if (options.customerName) parts.push(`Customer: ${options.customerName}`);
    if (options.organizationName) parts.push(`Organization: ${options.organizationName}`);
    if (options.assetTag) parts.push(`Asset Tag: ${options.assetTag}`);
    if (options.ticketId) parts.push(`Ticket ID: ${options.ticketId}`);
    if (options.serviceHistory && options.serviceHistory.length > 0) {
      parts.push(`Recent Repairs: ${options.serviceHistory.join(" | ")}`);
    }

    return parts.length > 0 ? `[CONTEXT METADATA]\n${parts.join("\n")}\n` : "";
  }
}
