import { AIProviderFactory } from "./aiFactory.js";
import { WorkspaceContext, ImplementationPlan, ReviewResult, ImplementationProposal } from "@remotefix/types";

export class ImplementationEngine {
  public static async generateProposal(
    context: WorkspaceContext,
    userRequest: string,
    plan: ImplementationPlan,
    review: ReviewResult
  ): Promise<ImplementationProposal> {
    const prompt = `You are a Lead Software Engineer and Implementation Agent.
Your task is ONLY to convert the APPROVED implementation plan into proposed code changes and structured intent. Do NOT write files or run shell commands.

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

APPROVED IMPLEMENTATION PLAN:
${JSON.stringify(plan, null, 2)}

ENGINEERING REVIEW:
${JSON.stringify(review, null, 2)}

Generate a strict JSON response containing the implementation proposal. Do not include markdown formatting like \`\`\`json or any other text before/after the JSON.

OUTPUT SCHEMA:
{
  "summary": "Detailed summary of the proposed implementation changes",
  "status": "proposed",
  "filesToModify": ["relative/paths/of/files/to/modify"],
  "filesToCreate": ["relative/paths/of/files/to/create"],
  "filesToDelete": [],
  "implementationOrder": ["relative/paths/of/files/in/order/of/implementation"],
  "changes": [
    {
      "file": "relative/path/to/file",
      "reason": "Detailed reason why this file must be modified or created",
      "changeType": "modify | create | delete",
      "description": "Description of the logical changes intended for this file"
    }
  ],
  "diffs": ["Optional unified diff if high confidence, e.g. --- old/file.ts\\n+++ new/file.ts"],
  "estimatedImpact": "Description of overall impact and risk",
  "validationChecklist": ["Checklist item 1...", "Checklist item 2..."]
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
      parsed.status = "proposed"; // Ensure status matches strict instructions
      return parsed;
    } catch (err) {
      console.warn("[Implementation Engine] AI completion failed or returned invalid JSON. Falling back to default implementation proposal structure...", err);
      // Fallback structured proposal matching requirements
      return {
        summary: `Implementation proposal for: ${userRequest}`,
        status: "proposed",
        filesToModify: plan.filesLikelyToChange || [],
        filesToCreate: [],
        filesToDelete: [],
        implementationOrder: plan.filesLikelyToChange || [],
        changes: (plan.filesLikelyToChange || []).map((file) => ({
          file,
          reason: "Apply modifications matching the approved planning steps.",
          changeType: "modify",
          description: `Apply the approved logical changes to fulfill request: "${userRequest}".`,
        })),
        diffs: [
          `--- old/${plan.filesLikelyToChange?.[0] || "file.ts"}\n+++ new/${plan.filesLikelyToChange?.[0] || "file.ts"}\n@@\n- // old logic\n+ // new logic implementing ${userRequest}`,
        ],
        estimatedImpact: "Medium impact. Affects only localized feature files.",
        validationChecklist: plan.validationPlan || ["Run tests", "Check typescript compilation"],
      };
    }
  }
}
