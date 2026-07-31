export interface AiTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute: (args: Record<string, any>) => Promise<any>;
}

export class ToolRegistry {
  private static tools: Record<string, AiTool> = {
    get_asset: {
      name: "get_asset",
      description: "Fetches details and health of a registered asset by tag or serial.",
      parameters: { assetTag: "string" },
      execute: async (args) => {
        return { assetTag: args.assetTag || "RF-AST-00101", name: "Dell XPS Workstation", health: "Healthy", warranty: "Active 2027" };
      },
    },
    get_customer: {
      name: "get_customer",
      description: "Fetches customer profile and SLA tier.",
      parameters: { customerId: "string" },
      execute: async (args) => {
        return { customerId: args.customerId || "cust-101", name: "Acme Corp", slaTier: "Enterprise 15-min SLA" };
      },
    },
    search_kb: {
      name: "search_kb",
      description: "Searches knowledge base for resolution guides.",
      parameters: { query: "string" },
      execute: async (args) => {
        return [{ title: "BSOD Fix Guide", solution: "Run Windows Memory Diagnostic tool." }];
      },
    },
    get_sla: {
      name: "get_sla",
      description: "Calculates SLA remaining minutes.",
      parameters: { ticketId: "string" },
      execute: async (args) => {
        return { ticketId: args.ticketId || "b-101", remainingMin: 28, status: "within_sla" };
      },
    },
  };

  public static getTool(name: string): AiTool | undefined {
    return this.tools[name];
  }

  public static async executeTool(name: string, args: Record<string, any>): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) throw new Error(`AI Tool '${name}' not found in registry.`);
    return await tool.execute(args);
  }
}
