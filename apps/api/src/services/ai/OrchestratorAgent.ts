import { WorkspaceContext, ImplementationPlan, ReviewResult, ImplementationProposal, VerificationResult } from "@remotefix/types";
import { PlanningEngine } from "./PlanningEngine.js";
import { ReviewEngine } from "./ReviewEngine.js";
import { ImplementationEngine } from "./ImplementationEngine.js";
import { VerificationEngine } from "./VerificationEngine.js";
import { ExecutionEngine, ExecutionReport } from "./ExecutionEngine.js";

export type OrchestratorState = 
  | "IDLE" 
  | "PLANNING" 
  | "REVIEWING" 
  | "IMPLEMENTING" 
  | "VERIFYING" 
  | "EXECUTING" 
  | "COMPLETED" 
  | "FAILED";

export interface TimelineItem {
  stage: string;
  startTime: string;
  finishTime: string;
  duration: string;
  status: "success" | "failure";
}

export interface OrchestratorReport {
  status: "Completed" | "Failed";
  currentStage: OrchestratorState;
  timeline: TimelineItem[];
  planning?: ImplementationPlan;
  review?: ReviewResult;
  implementation?: ImplementationProposal;
  verification?: VerificationResult;
  execution?: ExecutionReport;
  summary: string;
  duration: string;
}

export class OrchestratorAgent {
  public static async runWorkflow(
    context: WorkspaceContext,
    userRequest: string,
    repoPath: string
  ): Promise<OrchestratorReport> {
    const totalStart = Date.now();
    const timeline: TimelineItem[] = [];
    const report: OrchestratorReport = {
      status: "Failed",
      currentStage: "IDLE",
      timeline,
      summary: "Orchestrator initialized.",
      duration: "0s",
    };

    let plan: ImplementationPlan | undefined;
    let review: ReviewResult | undefined;
    let implementation: ImplementationProposal | undefined;
    let verification: VerificationResult | undefined;
    let execution: ExecutionReport | undefined;

    // =========================================================
    // 1. PLANNING
    // =========================================================
    report.currentStage = "PLANNING";
    const planningStart = Date.now();
    try {
      plan = await PlanningEngine.generatePlan(context, userRequest);
      const planningDur = ((Date.now() - planningStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "PLANNING",
        startTime: new Date(planningStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: planningDur,
        status: "success",
      });
      report.planning = plan;
    } catch (err: any) {
      const planningDur = ((Date.now() - planningStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "PLANNING",
        startTime: new Date(planningStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: planningDur,
        status: "failure",
      });
      report.currentStage = "FAILED";
      report.summary = `Failed at PLANNING stage: ${err.message || err}`;
      report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
      return report;
    }

    // =========================================================
    // 2. REVIEWING
    // =========================================================
    report.currentStage = "REVIEWING";
    const reviewStart = Date.now();
    try {
      review = await ReviewEngine.reviewPlan(context, userRequest, plan);
      const reviewDur = ((Date.now() - reviewStart) / 1000).toFixed(1) + "s";
      
      const isApproved = review.approved === true || review.recommendation === "Approve";
      if (!isApproved) {
        timeline.push({
          stage: "REVIEWING",
          startTime: new Date(reviewStart).toISOString(),
          finishTime: new Date().toISOString(),
          duration: reviewDur,
          status: "failure",
        });
        report.review = review;
        report.currentStage = "FAILED";
        report.summary = `Failed at REVIEWING stage: Review rejected the proposed plan. Recommendation: ${review.recommendation}`;
        report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
        return report;
      }

      timeline.push({
        stage: "REVIEWING",
        startTime: new Date(reviewStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: reviewDur,
        status: "success",
      });
      report.review = review;
    } catch (err: any) {
      const reviewDur = ((Date.now() - reviewStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "REVIEWING",
        startTime: new Date(reviewStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: reviewDur,
        status: "failure",
      });
      report.currentStage = "FAILED";
      report.summary = `Failed at REVIEWING stage: ${err.message || err}`;
      report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
      return report;
    }

    // =========================================================
    // 3. IMPLEMENTING
    // =========================================================
    report.currentStage = "IMPLEMENTING";
    const implementationStart = Date.now();
    try {
      implementation = await ImplementationEngine.generateProposal(context, userRequest, plan, review);
      const implementationDur = ((Date.now() - implementationStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "IMPLEMENTING",
        startTime: new Date(implementationStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: implementationDur,
        status: "success",
      });
      report.implementation = implementation;
    } catch (err: any) {
      const implementationDur = ((Date.now() - implementationStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "IMPLEMENTING",
        startTime: new Date(implementationStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: implementationDur,
        status: "failure",
      });
      report.currentStage = "FAILED";
      report.summary = `Failed at IMPLEMENTING stage: ${err.message || err}`;
      report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
      return report;
    }

    // =========================================================
    // 4. VERIFYING
    // =========================================================
    report.currentStage = "VERIFYING";
    const verificationStart = Date.now();
    try {
      verification = await VerificationEngine.verifyProposal(context, userRequest, plan, review, implementation);
      const verificationDur = ((Date.now() - verificationStart) / 1000).toFixed(1) + "s";

      const isProceed = verification.passed === true || (verification as any).verified === true || (verification as any).recommendation === "Proceed";
      if (!isProceed) {
        timeline.push({
          stage: "VERIFYING",
          startTime: new Date(verificationStart).toISOString(),
          finishTime: new Date().toISOString(),
          duration: verificationDur,
          status: "failure",
        });
        report.verification = verification;
        report.currentStage = "FAILED";
        report.summary = `Failed at VERIFYING stage: Verification failed or recommendation is not Proceed.`;
        report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
        return report;
      }

      timeline.push({
        stage: "VERIFYING",
        startTime: new Date(verificationStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: verificationDur,
        status: "success",
      });
      report.verification = verification;
    } catch (err: any) {
      const verificationDur = ((Date.now() - verificationStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "VERIFYING",
        startTime: new Date(verificationStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: verificationDur,
        status: "failure",
      });
      report.currentStage = "FAILED";
      report.summary = `Failed at VERIFYING stage: ${err.message || err}`;
      report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
      return report;
    }

    // =========================================================
    // 5. EXECUTING
    // =========================================================
    report.currentStage = "EXECUTING";
    const executionStart = Date.now();
    try {
      execution = await ExecutionEngine.executeProposal(context, userRequest, plan, review, implementation, verification, repoPath);
      const executionDur = ((Date.now() - executionStart) / 1000).toFixed(1) + "s";

      if (execution.status !== "success") {
        timeline.push({
          stage: "EXECUTING",
          startTime: new Date(executionStart).toISOString(),
          finishTime: new Date().toISOString(),
          duration: executionDur,
          status: "failure",
        });
        report.execution = execution;
        report.currentStage = "FAILED";
        report.summary = `Failed at EXECUTING stage: ${execution.errors.join("; ")}`;
        report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
        return report;
      }

      timeline.push({
        stage: "EXECUTING",
        startTime: new Date(executionStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: executionDur,
        status: "success",
      });
      report.execution = execution;
    } catch (err: any) {
      const executionDur = ((Date.now() - executionStart) / 1000).toFixed(1) + "s";
      timeline.push({
        stage: "EXECUTING",
        startTime: new Date(executionStart).toISOString(),
        finishTime: new Date().toISOString(),
        duration: executionDur,
        status: "failure",
      });
      report.currentStage = "FAILED";
      report.summary = `Failed at EXECUTING stage: ${err.message || err}`;
      report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
      return report;
    }

    // COMPLETED SUCCESS
    report.status = "Completed";
    report.currentStage = "COMPLETED";
    report.summary = "Orchestrator successfully processed and executed user goal.";
    report.duration = ((Date.now() - totalStart) / 1000).toFixed(1) + "s";
    return report;
  }
}
