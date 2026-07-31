export interface UserContext {
  userId: string;
  role: "admin" | "technician" | "customer" | string;
  tenantId?: string;
  permissions?: string[];
}

export interface PermissionCheckResult {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason?: string;
}

export class AIPermissionEngine {
  /**
   * Validates user role, tenant isolation, and confirmation requirements for tool execution
   */
  public static validate(
    tool: { toolId: string; category: string; supportedRoles: string[]; confirmationRequired: boolean },
    user: UserContext
  ): PermissionCheckResult {
    // 1. Role validation
    if (!tool.supportedRoles.includes(user.role) && !tool.supportedRoles.includes("*")) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: `User role '${user.role}' is not authorized to execute tool '${tool.toolId}'. Allowed roles: ${tool.supportedRoles.join(", ")}.`,
      };
    }

    // 2. High-risk confirmation check
    const requiresConfirmation = tool.confirmationRequired || tool.toolId.startsWith("delete_") || tool.toolId.startsWith("close_");

    return {
      allowed: true,
      requiresConfirmation,
    };
  }
}
