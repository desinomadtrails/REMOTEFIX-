// RemoteFix AI Runtime - Task Router Module
export type TaskCategory = "Bug" | "Feature" | "Refactor" | "API" | "Database" | "Frontend" | "Backend" | "Security" | "Testing" | "Deployment" | "Documentation" | "Optimization";

export interface RoutedTask {
  category: TaskCategory;
  priority: "low" | "medium" | "high";
  requiredSkills: string[];
  requiredTemplates: string[];
  requiredPlaybooks: string[];
}

export class TaskRouter {
  route(input: string): RoutedTask {
    const query = input.toLowerCase();

    if (query.includes("bug") || query.includes("error") || query.includes("fail")) {
      return {
        category: "Bug",
        priority: "high",
        requiredSkills: ["debugging", "testing"],
        requiredTemplates: ["test-template.md"],
        requiredPlaybooks: ["bug-fix.md"],
      };
    }

    if (query.includes("database") || query.includes("schema") || query.includes("migration")) {
      return {
        category: "Database",
        priority: "medium",
        requiredSkills: ["database", "architect"],
        requiredTemplates: ["schema-template.md", "migration-template.md"],
        requiredPlaybooks: ["database-change.md"],
      };
    }

    if (query.includes("api") || query.includes("route") || query.includes("hono")) {
      return {
        category: "API",
        priority: "medium",
        requiredSkills: ["api", "backend"],
        requiredTemplates: ["api-template.md", "controller-template.md"],
        requiredPlaybooks: ["new-api.md"],
      };
    }

    // Default to Feature
    return {
      category: "Feature",
      priority: "medium",
      requiredSkills: ["implementer", "reviewer"],
      requiredTemplates: ["react-component.md"],
      requiredPlaybooks: ["new-feature.md"],
    };
  }
}
