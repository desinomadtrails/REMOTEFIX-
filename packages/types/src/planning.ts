export interface WorkspaceContext {
  workspaceType: "monorepo" | "single";
  entryPoints: string[];
  backend: string[];
  frontend: string[];
  database: string[];
  sharedPackages: string[];
  routes: string[];
  tests: string[];
  documentation: string[];
  configuration: string[];
  tooling: string[];
  repository: {
    branch: string;
    frameworks: string[];
    languages: string[];
    packageManagers: string[];
  };
}

export interface ImplementationPlan {
  summary: string;
  featureType: string;
  complexity: string;
  affectedAreas: string[];
  filesLikelyToChange: string[];
  implementationSteps: string[];
  dependencies: string[];
  risks: string[];
  validationPlan: string[];
}
