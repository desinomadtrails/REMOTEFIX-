import { AIProviderFactory } from "./aiFactory.js";
import { execSync } from "child_process";
import { WorkspaceContext, ImplementationPlan } from "@remotefix/types";

export class PlanningEngine {
  public static async generatePlan(
    context: WorkspaceContext,
    userRequest: string
  ): Promise<ImplementationPlan> {
    const prompt = `You are a Lead Software Engineer Planning Agent.
Given the workspace context and the user request, generate a structured implementation plan.

WORKSPACE CONTEXT:
- Type: ${context.workspaceType}
- Active Branch: ${context.repository.branch}
- Languages: ${context.repository.languages.join(", ")}
- Frameworks: ${context.repository.frameworks.join(", ")}
- Package Managers: ${context.repository.packageManagers.join(", ")}
- Tooling: ${context.tooling.join(", ")}
- Entry Points:
${context.entryPoints.map((f) => `  - ${f}`).join("\n")}
- Backend Components:
${context.backend.map((f) => `  - ${f}`).join("\n")}
- Frontend Components:
${context.frontend.map((f) => `  - ${f}`).join("\n")}
- Database Components:
${context.database.map((f) => `  - ${f}`).join("\n")}
- Shared Packages:
${context.sharedPackages.map((f) => `  - ${f}`).join("\n")}
- Routes:
${context.routes.map((f) => `  - ${f}`).join("\n")}
- Tests Folder:
${context.tests.map((f) => `  - ${f}`).join("\n")}
- Documentation:
${context.documentation.map((f) => `  - ${f}`).join("\n")}
- Config Files:
${context.configuration.map((f) => `  - ${f}`).join("\n")}

USER REQUEST:
"${userRequest}"

Generate a strict JSON response containing the implementation plan. Do not include markdown formatting like \`\`\`json or any other text before/after the JSON.

OUTPUT SCHEMA:
{
  "summary": "High level description of what needs to be done",
  "featureType": "feature | bug | refactor | chores",
  "complexity": "low | medium | high",
  "affectedAreas": ["frontend", "backend", "database", "sharedPackages", "tests", "docs"],
  "filesLikelyToChange": ["relative/paths/of/files/likely/to/change"],
  "implementationSteps": ["Step 1...", "Step 2..."],
  "dependencies": ["Any code or library dependencies needed"],
  "risks": ["Potential risks or breaking changes"],
  "validationPlan": ["How to verify the changes (e.g. commands, unit tests)"]
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

      return JSON.parse(cleanContent);
    } catch (err) {
      console.warn("[Planning Engine] AI completion failed or returned invalid JSON. Falling back to default plan structure...", err);
      // Fallback structured plan matching requirements
      return {
        summary: `Plan to implement: ${userRequest}`,
        featureType: "feature",
        complexity: "medium",
        affectedAreas: context.workspaceType === "monorepo" ? ["backend", "frontend"] : ["backend"],
        filesLikelyToChange: context.entryPoints.length > 0 ? [context.entryPoints[0]] : [],
        implementationSteps: [
          "Analyze the target entry points and configurations.",
          "Write the code modifications matching requirements.",
          "Verify implementation via linting and testing.",
        ],
        dependencies: [],
        risks: ["Workspace configuration mismatch"],
        validationPlan: ["Run automated test suites", "Execute typescript typecheck"],
      };
    }
  }
}
