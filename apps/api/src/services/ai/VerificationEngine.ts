import { AIProviderFactory } from "./aiFactory.js";
import { WorkspaceContext, ImplementationPlan, ReviewResult, ImplementationProposal, VerificationResult } from "@remotefix/types";

export class VerificationEngine {
  public static async verifyProposal(
    context: WorkspaceContext,
    userRequest: string,
    plan: ImplementationPlan,
    review: ReviewResult,
    implementation: ImplementationProposal
  ): Promise<VerificationResult> {
    const startTime = Date.now();
    const prompt = `You are a Lead Quality Assurance and Security Verification Agent.
Your task is to verify the logical correctness, consistency, safety, and readiness of the proposed Implementation Proposal before it is executed. Do NOT run tests, write code, or execute Git commands.

WORKSPACE CONTEXT:
- Type: ${context.workspaceType}
- Active Branch: ${context.repository.branch}
- Languages: ${context.repository.languages.join(", ")}
- Frameworks: ${context.repository.frameworks.join(", ")}
- Tooling: ${context.tooling.join(", ")}
- Entry Points: ${context.entryPoints.join(", ")}
- Backend Components: ${context.backend.join(", ")}
- Frontend Components: ${context.frontend.join(", ")}
- Database Components: ${context.database.join(", ")}
- Shared Packages: ${context.sharedPackages.join(", ")}
- Routes: ${context.routes.join(", ")}
- Tests: ${context.tests.join(", ")}
- Config Files: ${context.configuration.join(", ")}

ORIGINAL USER REQUEST:
"${userRequest}"

PROPOSED IMPLEMENTATION PLAN:
${JSON.stringify(plan, null, 2)}

ENGINEERING REVIEW:
${JSON.stringify(review, null, 2)}

PROPOSED IMPLEMENTATION PROPOSAL:
${JSON.stringify(implementation, null, 2)}

Perform a thorough consistency check across Planning, Review, and Implementation:
1. Are the proposed changes aligned with the approved plan and review recommendation?
2. Are there missing implementations, unexpected file changes, or duplicate modifications?
3. Evaluate compliance with the LEAN CODE FIRST philosophy.

Generate a strict JSON response containing the verification result. Do not include markdown formatting like \`\`\`json or any other text before/after the JSON.

OUTPUT SCHEMA:
{
  "summary": "Detailed summary of consistency, safety and ready status",
  "passed": true | false,
  "assertionsCount": 5,
  "failures": ["Any critical failure reason or inconsistency issue"]
}`;

    try {
      const completion = await AIProviderFactory.executeWithFailover({
        prompt,
        temperature: 0.1,
      });

      const cleanContent = completion.content
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanContent);
      return {
        summary: parsed.summary || "Verification completed.",
        passed: !!parsed.passed,
        durationMs: Date.now() - startTime,
        assertionsCount: Number(parsed.assertionsCount) || 5,
        failures: Array.isArray(parsed.failures) ? parsed.failures : [],
        recommendation: parsed.recommendation || (parsed.passed ? "Proceed" : "Reject"),
      } as any;
    } catch (err) {
      console.warn("[Verification Engine] AI completion failed or returned invalid JSON. Falling back to default verification result...", err);
      
      const planFiles = new Set(plan.filesLikelyToChange || []);
      const proposalFiles = new Set([
        ...(implementation.filesToModify || []),
        ...(implementation.filesToCreate || []),
      ]);

      const failures: string[] = [];
      let assertionsCount = 3;

      for (const file of proposalFiles) {
        if (!planFiles.has(file)) {
          failures.push(`Unexpected file change: "${file}" was not in the approved plan.`);
        }
      }
      for (const file of planFiles) {
        if (!proposalFiles.has(file)) {
          failures.push(`Missing file change: "${file}" is required by the plan but missing from the proposal.`);
        }
      }

      const passed = failures.length === 0;

      return {
        summary: passed 
          ? "Verification passed. Proposal is consistent with the approved plan." 
          : "Verification failed. Proposal has file scope inconsistencies.",
        passed,
        durationMs: Date.now() - startTime,
        assertionsCount,
        failures,
        recommendation: passed ? "Proceed" : "Revise",
      } as any;
    }
  }
}
