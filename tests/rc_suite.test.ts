import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runRcTestSuite() {
  console.log("==================================================");
  console.log("  REMOTEFIX RELEASE CANDIDATE (RC) TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Sign a test JWT token for protected route testing
  const jwtSecret = process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
  const testToken = await signJWT(
    { sub: "test-user-id", email: "admin@remotefix.com", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 },
    jwtSecret
  );

  async function assert(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAILED: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health Checks & Probes
  await assert("Health check endpoint (/health)", async () => {
    const res = await app.request("/health");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== "healthy") throw new Error("Health status not healthy");
  });

  await assert("Liveness probe (/health/liveness)", async () => {
    const res = await app.request("/health/liveness");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== "alive") throw new Error("Liveness status not alive");
  });

  // 2. Prometheus Metrics
  await assert("Prometheus metrics exporter (/metrics)", async () => {
    const res = await app.request("/metrics");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes("remotefix_active_organizations")) throw new Error("Missing organization metric");
  });

  // 3. API Documentation
  await assert("OpenAPI 3.1 Specification (/api/docs/openapi.json)", async () => {
    const res = await app.request("/api/docs/openapi.json");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.openapi !== "3.1.0") throw new Error("OpenAPI version mismatch");
  });

  // 4. SAML SSO Metadata
  await assert("SAML 2.0 SP Metadata XML (/api/auth/sso/metadata)", async () => {
    const res = await app.request("/api/auth/sso/metadata");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const xml = await res.text();
    if (!xml.includes("<EntityDescriptor")) throw new Error("Invalid SAML XML payload");
  });

  // 5. Feature Flags Evaluation
  await assert("Public Feature Flags Evaluation (/api/flags/eval)", async () => {
    const res = await app.request("/api/flags/eval");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.success !== true) throw new Error("Flags eval returned unsuccessful");
  });

  // 6. AI Triage Engine (Authenticated)
  await assert("AI Ticket Triage & NLP Classification (/api/ai/triage)", async () => {
    const res = await app.request("/api/ai/triage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`,
      },
      body: JSON.stringify({ subject: "Blue screen of death on boot", description: "SYSTEM_SERVICE_EXCEPTION error code 0x0000003B" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.triage || !data.triage.category) throw new Error("Triage category missing");
  });

  // 7. AI Incident Diagnosis Engine (Authenticated)
  await assert("AI Incident Diagnosis Script (/api/ai/diagnose)", async () => {
    const res = await app.request("/api/ai/diagnose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`,
      },
      body: JSON.stringify({ subject: "Printer spooler stuck", description: "Documents queued but not printing", deviceType: "Windows 11 PC" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.diagnosis || !data.diagnosis.recommendedSteps) throw new Error("Diagnostic recommendedSteps missing");
  });

  // 8. Project Management API Tests
  let testProjectId = "";
  await assert("Create Project (/api/projects)", async () => {
    const res = await app.request("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "RemoteFix Test Project",
        path: process.cwd(),
        description: "Test description for RemoteFix workspace",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.project || !data.project.id) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }
    testProjectId = data.project.id;
    if (data.project.metadata.isGit !== true) throw new Error("Expected project to be identified as Git");
    if (data.project.metadata.hasPackageJson !== true) throw new Error("Expected project to have package.json");
    if (data.project.metadata.structure === undefined) throw new Error("Expected RepositoryScanner structure scan to run on match");
  });

  await assert("List Projects (/api/projects)", async () => {
    const res = await app.request("/api/projects");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.projects)) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }
    const found = data.projects.find((p: any) => p.id === testProjectId);
    if (!found) throw new Error("Test project not found in list");
    if (found.name !== "RemoteFix Test Project") throw new Error("Project name mismatch in list");
  });

  await assert("Open Project (/api/projects/:id/open)", async () => {
    const res = await app.request(`/api/projects/${testProjectId}/open`, {
      method: "POST",
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.project || !data.project.lastOpened) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }
    if (data.project.metadata.isGit !== true) throw new Error("Expected opened project metadata to verify git");
  });

  await assert("Repository Intelligence (/api/projects/:id/repository)", async () => {
    const res = await app.request(`/api/projects/${testProjectId}/repository`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    
    const data = await res.json();
    if (!data.success || !data.repository) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { summary, technologies, frameworks, packageManagers, statistics, structureSummary } = data.repository;
    
    // 1. Summary checks
    if (!summary.name || !summary.path || !summary.currentBranch || !summary.gitStatus || !summary.lastCommit) {
      throw new Error(`Missing summary details: ${JSON.stringify(summary)}`);
    }

    // 2. Technology detection checks
    if (!technologies.includes("Node.js")) {
      throw new Error("Expected Node.js technology to be detected");
    }

    // 3. Framework detection checks
    if (!frameworks.includes("Hono") && !frameworks.includes("React")) {
      throw new Error(`Expected Hono or React framework to be detected. Found: ${JSON.stringify(frameworks)}`);
    }

    // 4. Package manager detection checks
    if (!packageManagers.includes("npm")) {
      throw new Error("Expected npm package manager to be detected");
    }

    // 5. Statistics checks
    if (statistics.totalFiles === 0 || statistics.sourceFiles === 0 || statistics.configFiles === 0 || statistics.projectSize === 0) {
      throw new Error(`Invalid statistics: ${JSON.stringify(statistics)}`);
    }

    // 6. Structure summary checks
    if (!structureSummary.directories.includes("apps/") || !structureSummary.directories.includes("packages/")) {
      throw new Error(`Missing expected root directories: ${JSON.stringify(structureSummary.directories)}`);
    }
    if (!structureSummary.configFiles.includes("package.json") || !structureSummary.configFiles.includes("tsconfig.json")) {
      throw new Error(`Missing expected config files: ${JSON.stringify(structureSummary.configFiles)}`);
    }
    if (!structureSummary.tooling.includes("TypeScript")) {
      throw new Error(`Expected TypeScript tooling to be detected. Found: ${JSON.stringify(structureSummary.tooling)}`);
    }
  });

  await assert("Workspace Context Engine (/api/projects/:id/context)", async () => {
    const res = await app.request(`/api/projects/${testProjectId}/context`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    
    const data = await res.json();
    if (!data.success || !data.context) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { workspaceType, entryPoints, backend, frontend, database, sharedPackages, routes, tests, documentation, configuration, tooling, repository } = data.context;

    // 1. Workspace detection check
    if (workspaceType !== "monorepo") throw new Error(`Expected workspaceType to be monorepo, got ${workspaceType}`);

    // 2. Entry point detection check
    if (!entryPoints.includes("apps/api/src/server.ts") && !entryPoints.includes("apps/web/src/main.tsx")) {
      throw new Error(`Missing expected entry points. Found: ${JSON.stringify(entryPoints)}`);
    }

    // 3. Component classification checks
    if (!backend.includes("apps/api")) throw new Error("Expected apps/api in backend");
    if (!frontend.includes("apps/web") || !frontend.includes("apps/admin")) throw new Error("Expected apps/web/admin in frontend");
    if (!database.includes("packages/database")) throw new Error("Expected packages/database in database");
    if (!sharedPackages.includes("packages/utils") || !sharedPackages.includes("packages/types")) throw new Error("Expected shared packages");

    // 4. Scanned Routes check
    if (routes.length === 0 || !routes.some(r => r.startsWith("apps/api/src/routes/"))) {
      throw new Error(`Missing scanned routes in context. Found: ${JSON.stringify(routes)}`);
    }

    // 5. Tests & documentation checks
    if (!tests.includes("tests")) throw new Error("Expected tests folder");
    if (!documentation.includes("docs")) throw new Error("Expected docs folder");

    // 6. Important configuration files checks
    if (!configuration.includes("package.json") || !configuration.includes("tsconfig.json")) {
      throw new Error("Missing package.json/tsconfig.json in configuration");
    }

    // 7. Tooling & repository metadata checks
    if (!tooling.includes("TypeScript") || !tooling.includes("Docker")) {
      throw new Error(`Missing expected tooling. Found: ${JSON.stringify(tooling)}`);
    }
    if (!repository.languages.includes("Node.js") || !repository.packageManagers.includes("npm")) {
      throw new Error(`Invalid repository metadata: ${JSON.stringify(repository)}`);
    }
  });

  await assert("Delete Project (/api/projects/:id)", async () => {
    const res = await app.request(`/api/projects/${testProjectId}`, {
      method: "DELETE",
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Failed to delete project registration");

    // Double check it's gone from list
    const listRes = await app.request("/api/projects");
    const listData = await listRes.json();
    const found = listData.projects.find((p: any) => p.id === testProjectId);
    if (found) throw new Error("Project still exists in list after deletion");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRcTestSuite().catch((err) => {
  console.error("RC Test Suite Execution Failed:", err);
  process.exit(1);
});
