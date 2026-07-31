import { UserContext, AIPermissionEngine } from "./permissionEngine.js";

export interface EnterpriseToolDefinition {
  toolId: string;
  name: string;
  category: "ticket" | "asset" | "customer" | "technician" | "inventory" | "invoice" | "kb" | "notification" | "report";
  description: string;
  supportedRoles: string[];
  confirmationRequired: boolean;
  execute: (args: Record<string, any>, user: UserContext) => Promise<any>;
}

export class EnterpriseToolRegistry {
  private static tools: Record<string, EnterpriseToolDefinition> = {
    // 1. TICKET TOOLS
    create_ticket: {
      toolId: "create_ticket",
      name: "Create Support Ticket",
      category: "ticket",
      description: "Creates a new IT service ticket in the system.",
      supportedRoles: ["admin", "technician", "customer"],
      confirmationRequired: false,
      execute: async (args, user) => ({
        ticketId: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
        subject: args.subject || "Reported Issue",
        status: "open",
        priority: args.priority || "medium",
        createdAt: new Date().toISOString(),
      }),
    },
    close_ticket: {
      toolId: "close_ticket",
      name: "Close Ticket",
      category: "ticket",
      description: "Closes a resolved ticket with resolution notes.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: true, // Requires confirmation
      execute: async (args) => ({ ticketId: args.ticketId, status: "closed", resolutionNotes: args.notes || "Resolved by AI Agent" }),
    },
    assign_technician: {
      toolId: "assign_technician",
      name: "Assign Technician",
      category: "ticket",
      description: "Assigns a field engineer to a ticket.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: false,
      execute: async (args) => ({ ticketId: args.ticketId, engineerId: args.engineerId || "eng-101", status: "assigned" }),
    },

    // 2. ASSET TOOLS
    search_assets: {
      toolId: "search_assets",
      name: "Search Asset Inventory",
      category: "asset",
      description: "Searches hardware assets by query or tag.",
      supportedRoles: ["admin", "technician", "customer"],
      confirmationRequired: false,
      execute: async (args) => ([
        { assetTag: args.assetTag || "RF-AST-00101", name: "Dell XPS 15", status: "active", health: "Healthy" }
      ]),
    },
    generate_qr_code: {
      toolId: "generate_qr_code",
      name: "Generate Asset QR Code",
      category: "asset",
      description: "Generates quick scan QR code payload for asset identification.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: false,
      execute: async (args) => ({ assetTag: args.assetTag, qrCodeUrl: `https://api.remotefix.com/qr/${args.assetTag}` }),
    },

    // 3. CUSTOMER TOOLS
    search_customer: {
      toolId: "search_customer",
      name: "Search Customer Database",
      category: "customer",
      description: "Finds customer profile by email or phone.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: false,
      execute: async (args) => ({ customerId: "cust-101", name: args.query || "Acme Corp", email: "support@acme.com", slaTier: "Enterprise" }),
    },

    // 4. TECHNICIAN TOOLS
    find_technician: {
      toolId: "find_technician",
      name: "Find Nearest Available Technician",
      category: "technician",
      description: "Finds nearest engineer based on GPS proximity.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: false,
      execute: async (args) => ({ engineerId: "eng-101", fullName: "John Doe", distanceKm: 2.4, status: "available" }),
    },

    // 5. INVENTORY TOOLS
    reserve_parts: {
      toolId: "reserve_parts",
      name: "Reserve Spare Parts",
      category: "inventory",
      description: "Reserves replacement hardware parts from warehouse inventory.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: false,
      execute: async (args) => ({ reservationId: `RES-${Date.now()}`, partName: args.partName || "DDR5 16GB RAM", quantity: args.quantity || 1, status: "reserved" }),
    },

    // 6. INVOICE TOOLS
    generate_invoice: {
      toolId: "generate_invoice",
      name: "Generate Billing Invoice",
      category: "invoice",
      description: "Generates GST compliant tax invoice.",
      supportedRoles: ["admin"],
      confirmationRequired: true, // Sensitive operation
      execute: async (args) => ({ invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`, totalAmount: args.amount || 4500, status: "issued" }),
    },

    // 7. KNOWLEDGE BASE TOOLS
    search_kb: {
      toolId: "search_kb",
      name: "Search Knowledge Base",
      category: "kb",
      description: "Searches IT resolution articles.",
      supportedRoles: ["admin", "technician", "customer"],
      confirmationRequired: false,
      execute: async (args) => ([{ id: "kb-101", title: "Printer Spooler Troubleshooting", snippet: "Restart Spooler service via services.msc." }]),
    },

    // 8. NOTIFICATION TOOLS
    send_notification: {
      toolId: "send_notification",
      name: "Send Multi-Channel Notification",
      category: "notification",
      description: "Dispatches SMS/Push/Email notification to user.",
      supportedRoles: ["admin", "technician"],
      confirmationRequired: false,
      execute: async (args) => ({ notificationId: `NTF-${Date.now()}`, recipient: args.recipient || "customer", status: "dispatched" }),
    },
  };

  public static getTool(toolId: string): EnterpriseToolDefinition | undefined {
    return this.tools[toolId];
  }

  public static listTools(): EnterpriseToolDefinition[] {
    return Object.values(this.tools);
  }

  public static async executeTool(toolId: string, args: Record<string, any>, user: UserContext): Promise<any> {
    const tool = this.getTool(toolId);
    if (!tool) throw new Error(`Tool '${toolId}' is not registered in Enterprise Tool Registry.`);

    const check = AIPermissionEngine.validate(tool, user);
    if (!check.allowed) {
      throw new Error(`Permission Denied: ${check.reason}`);
    }

    if (check.requiresConfirmation && !args.confirmed) {
      return {
        status: "requires_confirmation",
        toolId,
        message: `High-risk action '${tool.name}' requires explicit confirmation before execution.`,
        pendingParameters: args,
      };
    }

    return await tool.execute(args, user);
  }
}
