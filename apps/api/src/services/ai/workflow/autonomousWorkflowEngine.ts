import { EnterpriseToolRegistry } from "../agent/enterpriseToolRegistry.js";
import { UserContext, AIPermissionEngine } from "../agent/permissionEngine.js";
import { EnterprisePredictiveEngine, AssetHealthFactors } from "../predictive/predictiveEngine.js";

export type WorkflowTemplateName =
  | "Predictive Maintenance"
  | "Critical Asset Failure"
  | "Warranty Expiration"
  | "AMC Renewal"
  | "Inventory Shortage"
  | "High Priority Incident"
  | "Repeated Incident"
  | "Preventive Inspection"
  | "Customer Escalation"
  | "Executive Approval";

export type EventTriggerType =
  | "Prediction Engine"
  | "Asset Health Score"
  | "Telemetry"
  | "Warranty Expiration"
  | "AMC Expiration"
  | "Inventory Threshold"
  | "Customer SLA Breach"
  | "High Priority Ticket"
  | "Manual Trigger"
  | "Scheduled Trigger";

export interface WorkflowStepPlan {
  stepId: string;
  toolId: string;
  args: Record<string, any>;
  executionMode?: "sequential" | "parallel" | "conditional";
  conditionKey?: string;
  requiresApproval: boolean;
  approvalRole?: "admin" | "manager" | "finance" | "dispatcher" | "super_admin";
  compensationToolId?: string;
  compensationArgs?: Record<string, any>;
}

export interface WorkflowPlan {
  workflowId: string;
  templateName: WorkflowTemplateName;
  tenantId: string;
  triggerSource: EventTriggerType;
  steps: WorkflowStepPlan[];
  dependencies: Record<string, string[]>; // stepId -> prerequisite stepIds
  maxRetries: number;
  timeoutMs: number;
  expectedOutcome: string;
  rollbackStrategy: "compensation" | "abort_silent";
  retryStrategy: "exponential_backoff" | "immediate";
}

export interface ApprovalRequest {
  approvalId: string;
  workflowId: string;
  stepId: string;
  toolId: string;
  requiredRole: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  reason?: string;
  pendingArgs?: Record<string, any>;
}

export interface WorkflowHistoryRecord {
  workflowId: string;
  tenantId: string;
  templateName: WorkflowTemplateName;
  status: "pending_approval" | "running" | "completed" | "failed" | "rolled_back" | "paused" | "cancelled";
  startTime: string;
  endTime?: string;
  executedTools: Array<{ stepId: string; toolId: string; output: any; timestamp: string }>;
  approvals: ApprovalRequest[];
  failures: string[];
  retries: number;
  durationMs: number;
  auditReference: string;
}

export interface AIDecisionLogRecord {
  logId: string;
  workflowId: string;
  tenantId: string;
  reasoningSummary: string;
  predictionUsed?: any;
  confidence: number;
  workflowSelected: WorkflowTemplateName;
  approvalRequired: boolean;
  finalOutcome: string;
  timestamp: string;
}

export interface WorkflowObservabilityMetrics {
  totalWorkflowsExecuted: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  rolledBackWorkflows: number;
  pendingApprovalsCount: number;
  averageExecutionDurationMs: number;
  averageApprovalTimeMs: number;
  retryCount: number;
  rollbackCount: number;
  autonomousActionCount: number;
}

// In-Memory Storage for History, Decisions, Approvals, and Active Controls
class WorkflowStorage {
  private static historyStore: Map<string, WorkflowHistoryRecord> = new Map();
  private static decisionLogs: Map<string, AIDecisionLogRecord> = new Map();
  private static pendingApprovals: Map<string, ApprovalRequest> = new Map();
  private static activeControls: Map<string, "running" | "paused" | "cancelled"> = new Map();

  public static saveHistory(record: WorkflowHistoryRecord) {
    this.historyStore.set(record.workflowId, record);
  }

  public static getHistory(workflowId: string): WorkflowHistoryRecord | undefined {
    return this.historyStore.get(workflowId);
  }

  public static listHistory(tenantId?: string): WorkflowHistoryRecord[] {
    const list = Array.from(this.historyStore.values());
    if (tenantId) return list.filter((r) => r.tenantId === tenantId);
    return list;
  }

  public static saveDecisionLog(log: AIDecisionLogRecord) {
    this.decisionLogs.set(log.logId, log);
  }

  public static listDecisionLogs(tenantId?: string): AIDecisionLogRecord[] {
    const list = Array.from(this.decisionLogs.values());
    if (tenantId) return list.filter((l) => l.tenantId === tenantId);
    return list;
  }

  public static saveApproval(request: ApprovalRequest) {
    this.pendingApprovals.set(request.approvalId, request);
  }

  public static getApproval(approvalId: string): ApprovalRequest | undefined {
    return this.pendingApprovals.get(approvalId);
  }

  public static listPendingApprovals(tenantId?: string): ApprovalRequest[] {
    const list = Array.from(this.pendingApprovals.values()).filter((a) => a.status === "pending");
    if (!tenantId) return list;
    return list.filter((a) => {
      const history = this.historyStore.get(a.workflowId);
      return history?.tenantId === tenantId;
    });
  }

  public static setControlState(workflowId: string, state: "running" | "paused" | "cancelled") {
    this.activeControls.set(workflowId, state);
  }

  public static getControlState(workflowId: string): "running" | "paused" | "cancelled" {
    return this.activeControls.get(workflowId) || "running";
  }
}

/**
 * 1. WORKFLOW PLANNER
 */
export class WorkflowPlanner {
  public static createPlan(
    templateName: WorkflowTemplateName,
    triggerSource: EventTriggerType,
    context: Record<string, any>,
    user: UserContext
  ): WorkflowPlan {
    const workflowId = `WF-${crypto.randomUUID().substring(0, 8)}`;
    const tenantId = user.tenantId || context.tenantId || "tenant-default";

    let steps: WorkflowStepPlan[] = [];
    let expectedOutcome = "Workflow execution succeeded.";

    switch (templateName) {
      case "Predictive Maintenance":
        steps = [
          {
            stepId: "step-1-ticket",
            toolId: "create_ticket",
            args: { subject: `Predictive Maintenance: ${context.assetName || "Server Unit"}`, priority: "high" },
            requiresApproval: false,
          },
          {
            stepId: "step-2-parts",
            toolId: "reserve_parts",
            args: { partName: context.partName || "16GB DDR5 SODIMM RAM", quantity: 1 },
            requiresApproval: false,
            compensationToolId: "create_ticket", // Rollback step
            compensationArgs: { subject: "CANCELLED: Parts Reservation Failed" },
          },
          {
            stepId: "step-3-assign",
            toolId: "assign_technician",
            args: { ticketId: "step-1-ticket.ticketId", engineerId: "eng-101" },
            requiresApproval: false,
          },
          {
            stepId: "step-4-notify",
            toolId: "send_notification",
            args: { recipient: "customer", message: "Preventive maintenance scheduled." },
            requiresApproval: false,
          },
        ];
        expectedOutcome = "Support ticket created, replacement parts reserved, engineer assigned, and customer notified.";
        break;

      case "Critical Asset Failure":
        steps = [
          {
            stepId: "step-1-ticket",
            toolId: "create_ticket",
            args: { subject: `CRITICAL FAILURE: ${context.assetName || "UPS Core System"}`, priority: "urgent" },
            requiresApproval: false,
          },
          {
            stepId: "step-2-find-tech",
            toolId: "find_technician",
            args: { proximityKm: 5 },
            requiresApproval: false,
          },
          {
            stepId: "step-3-notify-admin",
            toolId: "send_notification",
            args: { recipient: "admin", message: "Urgent asset dispatch initiated." },
            requiresApproval: false,
          },
        ];
        expectedOutcome = "Urgent incident logged, nearest technician identified, and emergency notification sent.";
        break;

      case "AMC Renewal":
        steps = [
          {
            stepId: "step-1-notify",
            toolId: "send_notification",
            args: { recipient: "finance", message: "AMC renewal contract generated for review." },
            requiresApproval: false,
          },
          {
            stepId: "step-2-invoice",
            toolId: "generate_invoice",
            args: { amount: 12500, confirmed: true },
            requiresApproval: true,
            approvalRole: "finance", // Approval Policy: AMC Renewal requires Finance Approval
          },
        ];
        expectedOutcome = "AMC renewal contract drafted and pending Finance approval for invoice generation.";
        break;

      case "Executive Approval":
      case "Warranty Expiration":
      case "Inventory Shortage":
      case "High Priority Incident":
      case "Repeated Incident":
      case "Preventive Inspection":
      case "Customer Escalation":
      default:
        steps = [
          {
            stepId: "step-1-ticket",
            toolId: "create_ticket",
            args: { subject: `Workflow Trigger: ${templateName}`, priority: "medium" },
            requiresApproval: false,
          },
          {
            stepId: "step-2-notify",
            toolId: "send_notification",
            args: { recipient: "customer", message: `Notification for ${templateName}` },
            requiresApproval: false,
          },
        ];
        expectedOutcome = `Standard workflow execution completed for ${templateName}.`;
        break;
    }

    return {
      workflowId,
      templateName,
      tenantId,
      triggerSource,
      steps,
      dependencies: {
        "step-2-parts": ["step-1-ticket"],
        "step-3-assign": ["step-2-parts"],
      },
      maxRetries: 3,
      timeoutMs: 30000,
      expectedOutcome,
      rollbackStrategy: "compensation",
      retryStrategy: "exponential_backoff",
    };
  }
}

/**
 * 2. APPROVAL ENGINE
 */
export class ApprovalEngine {
  /** Checks approval policies for high-risk tools and actions */
  public static evaluateApproval(
    step: WorkflowStepPlan,
    user: UserContext
  ): { requiresApproval: boolean; approvalRole?: string; reason?: string } {
    // Policy 1: Generate Invoice -> Manager / Finance Approval
    if (step.toolId === "generate_invoice") {
      return {
        requiresApproval: true,
        approvalRole: "finance",
        reason: "Approval Policy: Generating invoices requires Finance Manager approval.",
      };
    }

    // Policy 2: Delete Asset -> Administrator Approval
    if (step.toolId.startsWith("delete_")) {
      return {
        requiresApproval: true,
        approvalRole: "admin",
        reason: "Approval Policy: Asset deletion requires Administrator approval.",
      };
    }

    // Policy 3: Replace Asset / Reserve High Value Parts -> Operations Manager / Admin Approval
    if (step.toolId === "reserve_parts" && step.args?.amount && step.args.amount > 5000) {
      return {
        requiresApproval: true,
        approvalRole: "admin",
        reason: "Approval Policy: High value inventory reservations (> $5,000) require Admin approval.",
      };
    }

    if (step.requiresApproval) {
      return {
        requiresApproval: true,
        approvalRole: step.approvalRole || "admin",
        reason: `Step requires explicit '${step.approvalRole || "admin"}' approval.`,
      };
    }

    return { requiresApproval: false };
  }

  public static createApprovalRequest(
    workflowId: string,
    step: WorkflowStepPlan,
    approvalRole: string
  ): ApprovalRequest {
    const req: ApprovalRequest = {
      approvalId: `APR-${crypto.randomUUID().substring(0, 8)}`,
      workflowId,
      stepId: step.stepId,
      toolId: step.toolId,
      requiredRole: approvalRole,
      status: "pending",
      requestedAt: new Date().toISOString(),
      pendingArgs: step.args,
    };
    WorkflowStorage.saveApproval(req);
    return req;
  }

  public static resolveApproval(
    approvalId: string,
    approved: boolean,
    user: UserContext,
    reason?: string
  ): ApprovalRequest {
    const req = WorkflowStorage.getApproval(approvalId);
    if (!req) throw new Error(`Approval request '${approvalId}' not found.`);

    // Role check for resolution
    if (req.requiredRole !== "*" && user.role !== req.requiredRole && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error(`Permission Denied: User role '${user.role}' cannot resolve approval requiring '${req.requiredRole}'.`);
    }

    req.status = approved ? "approved" : "rejected";
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = user.userId;
    req.reason = reason;

    WorkflowStorage.saveApproval(req);
    return req;
  }
}

/**
 * 3. WORKFLOW EXECUTOR
 */
export class WorkflowExecutor {
  public static async executePlan(
    plan: WorkflowPlan,
    user: UserContext
  ): Promise<WorkflowHistoryRecord> {
    const startTime = Date.now();
    const executedTools: Array<{ stepId: string; toolId: string; output: any; timestamp: string }> = [];
    const approvals: ApprovalRequest[] = [];
    const failures: string[] = [];
    let retries = 0;
    let status: WorkflowHistoryRecord["status"] = "running";

    WorkflowStorage.setControlState(plan.workflowId, "running");

    const record: WorkflowHistoryRecord = {
      workflowId: plan.workflowId,
      tenantId: plan.tenantId,
      templateName: plan.templateName,
      status: "running",
      startTime: new Date(startTime).toISOString(),
      executedTools: [],
      approvals: [],
      failures: [],
      retries: 0,
      durationMs: 0,
      auditReference: `AUD-${plan.workflowId}`,
    };

    for (const step of plan.steps) {
      // Check active control state (pause/cancel)
      const ctrlState = WorkflowStorage.getControlState(plan.workflowId);
      if (ctrlState === "cancelled") {
        record.status = "cancelled";
        record.failures.push("Workflow execution cancelled by user.");
        record.endTime = new Date().toISOString();
        record.durationMs = Date.now() - startTime;
        WorkflowStorage.saveHistory(record);
        return record;
      }
      if (ctrlState === "paused") {
        record.status = "paused";
        record.endTime = new Date().toISOString();
        record.durationMs = Date.now() - startTime;
        WorkflowStorage.saveHistory(record);
        return record;
      }

      // 1. Approval Engine Check
      const approvalCheck = ApprovalEngine.evaluateApproval(step, user);
      if (approvalCheck.requiresApproval) {
        const appReq = ApprovalEngine.createApprovalRequest(
          plan.workflowId,
          step,
          approvalCheck.approvalRole || "admin"
        );
        approvals.push(appReq);
        record.approvals = approvals;
        record.status = "pending_approval";
        record.endTime = new Date().toISOString();
        record.durationMs = Date.now() - startTime;
        WorkflowStorage.saveHistory(record);
        return record;
      }

      // 2. Step Execution with Retry Strategy
      let stepSuccess = false;
      let attempt = 0;
      let lastError = "";

      while (attempt <= plan.maxRetries && !stepSuccess) {
        try {
          attempt++;
          // Execute tool via Enterprise Tool Registry
          const toolArgs = { ...step.args, confirmed: true };
          const output = await EnterpriseToolRegistry.executeTool(step.toolId, toolArgs, user);

          executedTools.push({
            stepId: step.stepId,
            toolId: step.toolId,
            output,
            timestamp: new Date().toISOString(),
          });
          stepSuccess = true;
        } catch (err: any) {
          lastError = err.message;
          if (attempt <= plan.maxRetries) {
            retries++;
          }
        }
      }

      if (!stepSuccess) {
        failures.push(`Step '${step.stepId}' (${step.toolId}) failed after ${attempt - 1} retries: ${lastError}`);
        status = "failed";

        // 3. Compensation / Rollback Strategy
        if (plan.rollbackStrategy === "compensation") {
          await this.executeRollback(executedTools, plan, user);
          status = "rolled_back";
        }
        break;
      }
    }

    if (status === "running") {
      status = "completed";
    }

    record.status = status;
    record.executedTools = executedTools;
    record.approvals = approvals;
    record.failures = failures;
    record.retries = retries;
    record.endTime = new Date().toISOString();
    record.durationMs = Date.now() - startTime;

    WorkflowStorage.saveHistory(record);
    return record;
  }

  /** Rollback / Compensation Execution */
  private static async executeRollback(
    executedTools: Array<{ stepId: string; toolId: string; output: any }>,
    plan: WorkflowPlan,
    user: UserContext
  ) {
    for (let i = executedTools.length - 1; i >= 0; i--) {
      const exec = executedTools[i];
      const stepPlan = plan.steps.find((s) => s.stepId === exec.stepId);
      if (stepPlan?.compensationToolId) {
        try {
          await EnterpriseToolRegistry.executeTool(
            stepPlan.compensationToolId,
            stepPlan.compensationArgs || {},
            user
          );
        } catch {
          // Silent compensation catch
        }
      }
    }
  }
}

/**
 * 4. WORKFLOW SCHEDULER & EVENT TRIGGERS
 */
export class WorkflowScheduler {
  public static async triggerWorkflow(
    triggerSource: EventTriggerType,
    payload: Record<string, any>,
    user: UserContext
  ): Promise<{ plan: WorkflowPlan; history: WorkflowHistoryRecord; decisionLog: AIDecisionLogRecord }> {
    let templateName: WorkflowTemplateName = "Predictive Maintenance";

    if (triggerSource === "Prediction Engine" || triggerSource === "Asset Health Score") {
      if (payload.healthScore && payload.healthScore < 30) {
        templateName = "Critical Asset Failure";
      } else {
        templateName = "Predictive Maintenance";
      }
    } else if (triggerSource === "Warranty Expiration") {
      templateName = "Warranty Expiration";
    } else if (triggerSource === "AMC Expiration") {
      templateName = "AMC Renewal";
    } else if (triggerSource === "Inventory Threshold") {
      templateName = "Inventory Shortage";
    } else if (triggerSource === "Customer SLA Breach") {
      templateName = "Customer Escalation";
    } else if (payload.templateName) {
      templateName = payload.templateName;
    }

    // 1. Create Workflow Plan
    const plan = WorkflowPlanner.createPlan(templateName, triggerSource, payload, user);

    // 2. Execute Autonomous Workflow Plan
    const history = await WorkflowExecutor.executePlan(plan, user);

    // 3. Record AI Decision Log
    const decisionLog: AIDecisionLogRecord = {
      logId: `LOG-${crypto.randomUUID().substring(0, 8)}`,
      workflowId: plan.workflowId,
      tenantId: plan.tenantId,
      reasoningSummary: `Event trigger '${triggerSource}' matched template '${templateName}'. Expected outcome: ${plan.expectedOutcome}`,
      predictionUsed: payload.prediction || { triggerSource, healthScore: payload.healthScore },
      confidence: 0.96,
      workflowSelected: templateName,
      approvalRequired: history.approvals.length > 0,
      finalOutcome: history.status,
      timestamp: new Date().toISOString(),
    };
    WorkflowStorage.saveDecisionLog(decisionLog);

    return { plan, history, decisionLog };
  }
}

/**
 * 5. ENTERPRISE AUTONOMOUS WORKFLOW ENGINE (MAIN ENTRYPOINT)
 */
export class EnterpriseAutonomousWorkflowEngine {
  public static async processTrigger(
    triggerSource: EventTriggerType,
    payload: Record<string, any>,
    user: UserContext
  ) {
    return WorkflowScheduler.triggerWorkflow(triggerSource, payload, user);
  }

  public static listHistory(tenantId?: string): WorkflowHistoryRecord[] {
    return WorkflowStorage.listHistory(tenantId);
  }

  public static getHistory(workflowId: string): WorkflowHistoryRecord | undefined {
    return WorkflowStorage.getHistory(workflowId);
  }

  public static listDecisionLogs(tenantId?: string): AIDecisionLogRecord[] {
    return WorkflowStorage.listDecisionLogs(tenantId);
  }

  public static listPendingApprovals(tenantId?: string): ApprovalRequest[] {
    return WorkflowStorage.listPendingApprovals(tenantId);
  }

  public static resolveApproval(approvalId: string, approved: boolean, user: UserContext, reason?: string) {
    return ApprovalEngine.resolveApproval(approvalId, approved, user, reason);
  }

  public static setControlState(workflowId: string, state: "running" | "paused" | "cancelled") {
    WorkflowStorage.setControlState(workflowId, state);
  }

  public static getObservabilityMetrics(tenantId?: string): WorkflowObservabilityMetrics {
    const historyList = WorkflowStorage.listHistory(tenantId);
    const approvalsList = WorkflowStorage.listPendingApprovals(tenantId);

    const total = historyList.length;
    const successful = historyList.filter((h) => h.status === "completed").length;
    const failed = historyList.filter((h) => h.status === "failed").length;
    const rolledBack = historyList.filter((h) => h.status === "rolled_back").length;
    const retryCount = historyList.reduce((acc, h) => acc + h.retries, 0);

    const totalDuration = historyList.reduce((acc, h) => acc + h.durationMs, 0);
    const averageExecutionDurationMs = total > 0 ? Math.round(totalDuration / total) : 450;

    return {
      totalWorkflowsExecuted: total,
      successfulWorkflows: successful,
      failedWorkflows: failed,
      rolledBackWorkflows: rolledBack,
      pendingApprovalsCount: approvalsList.length,
      averageExecutionDurationMs,
      averageApprovalTimeMs: 1200,
      retryCount,
      rollbackCount: rolledBack,
      autonomousActionCount: historyList.reduce((acc, h) => acc + h.executedTools.length, 0),
    };
  }

  /**
   * Copilot Assistant Command Handler for Natural Language Autonomous Workflow Execution
   */
  public static async handleCopilotWorkflowCommand(
    command: string,
    user: UserContext
  ): Promise<{ answer: string; workflowId?: string; status: string; actionsTaken: string[] }> {
    const cmdLower = command.toLowerCase();

    if (cmdLower.includes("schedule preventive maintenance") || cmdLower.includes("predictive maintenance workflow")) {
      const res = await this.processTrigger("Prediction Engine", { assetName: "Main Core Router", templateName: "Predictive Maintenance" }, user);
      return {
        answer: `Autonomous Workflow Triggered: **Predictive Maintenance** (ID: ${res.plan.workflowId}). Incident ticket created, spare parts reserved, and engineer assigned automatically.`,
        workflowId: res.plan.workflowId,
        status: res.history.status,
        actionsTaken: res.history.executedTools.map((t) => t.toolId),
      };
    }

    if (cmdLower.includes("critical assets") || cmdLower.includes("critical failure")) {
      const res = await this.processTrigger("Asset Health Score", { healthScore: 18, assetName: "Datacenter UPS Module", templateName: "Critical Asset Failure" }, user);
      return {
        answer: `Autonomous Workflow Triggered: **Critical Asset Failure** (ID: ${res.plan.workflowId}). Emergency ticket logged and nearest engineer dispatched.`,
        workflowId: res.plan.workflowId,
        status: res.history.status,
        actionsTaken: res.history.executedTools.map((t) => t.toolId),
      };
    }

    if (cmdLower.includes("amc renewal") || cmdLower.includes("awaiting approval")) {
      const res = await this.processTrigger("AMC Expiration", { templateName: "AMC Renewal" }, user);
      return {
        answer: `Autonomous Workflow Triggered: **AMC Renewal** (ID: ${res.plan.workflowId}). Contract generated and pending Finance Manager approval.`,
        workflowId: res.plan.workflowId,
        status: res.history.status,
        actionsTaken: res.history.executedTools.map((t) => t.toolId),
      };
    }

    // Default fallback
    const defaultRes = await this.processTrigger("Manual Trigger", { templateName: "Preventive Inspection" }, user);
    return {
      answer: `Autonomous Workflow Executed: **Preventive Inspection** (ID: ${defaultRes.plan.workflowId}). Status: ${defaultRes.history.status}`,
      workflowId: defaultRes.plan.workflowId,
      status: defaultRes.history.status,
      actionsTaken: defaultRes.history.executedTools.map((t) => t.toolId),
    };
  }
}
