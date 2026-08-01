import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";
import * as fs from "fs";
import * as path from "path";

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
    if (routes.length === 0 || !routes.some((r: string) => r.startsWith("apps/api/src/routes/"))) {
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

  await assert("Planning Engine (/api/projects/:id/plan)", async () => {
    const res = await app.request(`/api/projects/${testProjectId}/plan?prompt=Add+project+settings+page+to+frontend`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    
    const data = await res.json();
    if (!data.success || !data.plan) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { summary, featureType, complexity, affectedAreas, filesLikelyToChange, implementationSteps, dependencies, risks, validationPlan } = data.plan;

    // Validate existence of all 9 required keys
    if (summary === undefined) throw new Error("Expected summary key");
    if (featureType === undefined) throw new Error("Expected featureType key");
    if (complexity === undefined) throw new Error("Expected complexity key");
    if (affectedAreas === undefined || !Array.isArray(affectedAreas)) throw new Error("Expected affectedAreas array key");
    if (filesLikelyToChange === undefined || !Array.isArray(filesLikelyToChange)) throw new Error("Expected filesLikelyToChange array key");
    if (implementationSteps === undefined || !Array.isArray(implementationSteps)) throw new Error("Expected implementationSteps array key");
    if (dependencies === undefined || !Array.isArray(dependencies)) throw new Error("Expected dependencies array key");
    if (risks === undefined || !Array.isArray(risks)) throw new Error("Expected risks array key");
    if (validationPlan === undefined || !Array.isArray(validationPlan)) throw new Error("Expected validationPlan array key");
  });

  await assert("Review Engine (/api/projects/:id/review)", async () => {
    const sampleRequest = "Add project settings page to frontend";
    const samplePlan = {
      summary: "Add a project settings panel",
      featureType: "feature",
      complexity: "medium",
      affectedAreas: ["frontend"],
      filesLikelyToChange: ["apps/web/src/pages/settings.tsx"],
      implementationSteps: ["Create settings UI", "Register settings route"],
      dependencies: [],
      risks: [],
      validationPlan: ["Verify page rendering"]
    };

    const res = await app.request(`/api/projects/${testProjectId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: sampleRequest, plan: samplePlan }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    
    const data = await res.json();
    if (!data.success || !data.review) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { overallAssessment, approved, confidence, leanCompliance, architectureReview, affectedAreasReview, missingFiles, unnecessaryFiles, riskAssessment, alternativeApproaches, verificationChecklist, recommendation } = data.review;

    // Validate existence of all 12 required review keys
    if (overallAssessment === undefined) throw new Error("Expected overallAssessment key");
    if (approved === undefined || typeof approved !== "boolean") throw new Error("Expected approved boolean key");
    if (confidence === undefined) throw new Error("Expected confidence key");
    if (leanCompliance === undefined) throw new Error("Expected leanCompliance key");
    if (architectureReview === undefined) throw new Error("Expected architectureReview key");
    if (affectedAreasReview === undefined || !Array.isArray(affectedAreasReview)) throw new Error("Expected affectedAreasReview array key");
    if (missingFiles === undefined || !Array.isArray(missingFiles)) throw new Error("Expected missingFiles array key");
    if (unnecessaryFiles === undefined || !Array.isArray(unnecessaryFiles)) throw new Error("Expected unnecessaryFiles array key");
    if (riskAssessment === undefined || !Array.isArray(riskAssessment)) throw new Error("Expected riskAssessment array key");
    if (alternativeApproaches === undefined || !Array.isArray(alternativeApproaches)) throw new Error("Expected alternativeApproaches array key");
    if (verificationChecklist === undefined || !Array.isArray(verificationChecklist)) throw new Error("Expected verificationChecklist array key");
    if (recommendation === undefined) throw new Error("Expected recommendation key");
  });

  await assert("Implementation Engine - Reject when not approved (/api/projects/:id/implement)", async () => {
    const sampleRequest = "Add project settings page to frontend";
    const samplePlan = {
      summary: "Add a project settings panel",
      featureType: "feature",
      complexity: "medium",
      affectedAreas: ["frontend"],
      filesLikelyToChange: ["apps/web/src/pages/settings.tsx"],
      implementationSteps: ["Create settings UI", "Register settings route"],
      dependencies: [],
      risks: [],
      validationPlan: ["Verify page rendering"]
    };
    const rejectedReview = {
      recommendation: "Reject",
      approved: false
    };

    const res = await app.request(`/api/projects/${testProjectId}/implement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: sampleRequest, plan: samplePlan, review: rejectedReview }),
    });

    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    if (data.success) throw new Error("Expected failure for rejected review");
  });

  await assert("Implementation Engine - Accept when approved (/api/projects/:id/implement)", async () => {
    const sampleRequest = "Add project settings page to frontend";
    const samplePlan = {
      summary: "Add a project settings panel",
      featureType: "feature",
      complexity: "medium",
      affectedAreas: ["frontend"],
      filesLikelyToChange: ["apps/web/src/pages/settings.tsx"],
      implementationSteps: ["Create settings UI", "Register settings route"],
      dependencies: [],
      risks: [],
      validationPlan: ["Verify page rendering"]
    };
    const approvedReview = {
      recommendation: "Approve",
      approved: true
    };

    const res = await app.request(`/api/projects/${testProjectId}/implement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: sampleRequest, plan: samplePlan, review: approvedReview }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    
    const data = await res.json();
    if (!data.success || !data.proposal) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { summary, status, filesToModify, filesToCreate, filesToDelete, implementationOrder, changes, diffs, estimatedImpact, validationChecklist } = data.proposal;

    // Validate existence of all required proposal keys
    if (summary === undefined) throw new Error("Expected summary key");
    if (status !== "proposed") throw new Error(`Expected status to be proposed, got ${status}`);
    if (filesToModify === undefined || !Array.isArray(filesToModify)) throw new Error("Expected filesToModify array key");
    if (filesToCreate === undefined || !Array.isArray(filesToCreate)) throw new Error("Expected filesToCreate array key");
    if (filesToDelete === undefined || !Array.isArray(filesToDelete)) throw new Error("Expected filesToDelete array key");
    if (implementationOrder === undefined || !Array.isArray(implementationOrder)) throw new Error("Expected implementationOrder array key");
    if (changes === undefined || !Array.isArray(changes)) throw new Error("Expected changes array key");
    if (diffs === undefined || !Array.isArray(diffs)) throw new Error("Expected diffs array key");
    if (estimatedImpact === undefined) throw new Error("Expected estimatedImpact key");
    if (validationChecklist === undefined || !Array.isArray(validationChecklist)) throw new Error("Expected validationChecklist array key");

    // Validate change list properties
    if (changes.length > 0) {
      const change = changes[0];
      if (change.file === undefined) throw new Error("Expected change.file key");
      if (change.reason === undefined) throw new Error("Expected change.reason key");
      if (change.changeType === undefined) throw new Error("Expected change.changeType key");
      if (change.description === undefined) throw new Error("Expected change.description key");
    }
  });

  await assert("Verification Engine - Reject inconsistent proposal (/api/projects/:id/verify)", async () => {
    const sampleRequest = "Add project settings page to frontend";
    const samplePlan = {
      summary: "Add a project settings panel",
      featureType: "feature",
      complexity: "medium",
      affectedAreas: ["frontend"],
      filesLikelyToChange: ["apps/web/src/pages/settings.tsx"],
      implementationSteps: ["Create settings UI", "Register settings route"],
      dependencies: [],
      risks: [],
      validationPlan: ["Verify page rendering"]
    };
    const approvedReview = {
      recommendation: "Approve",
      approved: true,
      overallAssessment: "Good plan",
      confidence: "High",
      leanCompliance: "Clean",
      architectureReview: "Clean",
      affectedAreasReview: [],
      missingFiles: [],
      unnecessaryFiles: [],
      riskAssessment: [],
      alternativeApproaches: [],
      verificationChecklist: [],
    };
    const inconsistentProposal = {
      summary: "Add settings panel",
      status: "proposed",
      filesToModify: ["apps/api/src/routes/projects.ts"],
      filesToCreate: [],
      filesToDelete: [],
      implementationOrder: ["apps/api/src/routes/projects.ts"],
      changes: [{
        file: "apps/api/src/routes/projects.ts",
        reason: "Inconsistent change",
        changeType: "modify",
        description: "Modifying wrong file"
      }],
      diffs: [],
      estimatedImpact: "Low",
      validationChecklist: []
    };

    const res = await app.request(`/api/projects/${testProjectId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request: sampleRequest,
        plan: samplePlan,
        review: approvedReview,
        implementation: inconsistentProposal
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.verification) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { passed, recommendation, failures } = data.verification;
    if (passed) throw new Error("Expected verification to fail for inconsistent proposal");
    if (recommendation === "Proceed") throw new Error("Expected recommendation to be Revise or Reject");
    if (failures.length === 0) throw new Error("Expected failures explanation list");
  });

  await assert("Verification Engine - Accept consistent proposal (/api/projects/:id/verify)", async () => {
    const sampleRequest = "Add project settings page to frontend";
    const samplePlan = {
      summary: "Add a project settings panel",
      featureType: "feature",
      complexity: "medium",
      affectedAreas: ["frontend"],
      filesLikelyToChange: ["apps/web/src/pages/settings.tsx"],
      implementationSteps: ["Create settings UI", "Register settings route"],
      dependencies: [],
      risks: [],
      validationPlan: ["Verify page rendering"]
    };
    const approvedReview = {
      recommendation: "Approve",
      approved: true,
      overallAssessment: "Good plan",
      confidence: "High",
      leanCompliance: "Clean",
      architectureReview: "Clean",
      affectedAreasReview: [],
      missingFiles: [],
      unnecessaryFiles: [],
      riskAssessment: [],
      alternativeApproaches: [],
      verificationChecklist: [],
    };
    const consistentProposal = {
      summary: "Add settings panel",
      status: "proposed",
      filesToModify: ["apps/web/src/pages/settings.tsx"],
      filesToCreate: [],
      filesToDelete: [],
      implementationOrder: ["apps/web/src/pages/settings.tsx"],
      changes: [{
        file: "apps/web/src/pages/settings.tsx",
        reason: "Matches plan",
        changeType: "modify",
        description: "Modifying settings UI"
      }],
      diffs: [],
      estimatedImpact: "Low",
      validationChecklist: []
    };

    const res = await app.request(`/api/projects/${testProjectId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request: sampleRequest,
        plan: samplePlan,
        review: approvedReview,
        implementation: consistentProposal
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.verification) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    const { summary, passed, durationMs, assertionsCount, failures } = data.verification;

    if (summary === undefined) throw new Error("Expected summary key");
    if (passed !== true) throw new Error("Expected passed to be true for consistent proposal");
    if (durationMs === undefined) throw new Error("Expected durationMs key");
    if (assertionsCount === undefined) throw new Error("Expected assertionsCount key");
    if (failures === undefined || !Array.isArray(failures) || failures.length > 0) throw new Error("Expected empty failures array");
  });

  await assert("Execution Engine - Reject when verification recommendation is not Proceed (/api/projects/:id/execute)", async () => {
    const sampleRequest = "Add project settings page to frontend";
    const samplePlan = {
      summary: "Add a project settings panel",
      featureType: "feature",
      complexity: "medium",
      affectedAreas: ["frontend"],
      filesLikelyToChange: ["apps/web/src/pages/settings.tsx"],
      implementationSteps: ["Create settings UI", "Register settings route"],
      dependencies: [],
      risks: [],
      validationPlan: ["Verify page rendering"]
    };
    const approvedReview = {
      recommendation: "Approve",
      approved: true,
      overallAssessment: "Good plan",
      confidence: "High",
      leanCompliance: "Clean",
      architectureReview: "Clean",
      affectedAreasReview: [],
      missingFiles: [],
      unnecessaryFiles: [],
      riskAssessment: [],
      alternativeApproaches: [],
      verificationChecklist: [],
    };
    const consistentProposal = {
      summary: "Add settings panel",
      status: "proposed",
      filesToModify: ["apps/web/src/pages/settings.tsx"],
      filesToCreate: [],
      filesToDelete: [],
      implementationOrder: ["apps/web/src/pages/settings.tsx"],
      changes: [{
        file: "apps/web/src/pages/settings.tsx",
        reason: "Matches plan",
        changeType: "modify",
        description: "Modifying settings UI"
      }],
      diffs: [],
      estimatedImpact: "Low",
      validationChecklist: []
    };
    const failedVerification = {
      summary: "Verification failed due to manual cancellation",
      passed: false,
      verified: false,
      durationMs: 45,
      assertionsCount: 2,
      failures: ["Manual rejection"],
      recommendation: "Reject"
    };

    const res = await app.request(`/api/projects/${testProjectId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request: sampleRequest,
        plan: samplePlan,
        review: approvedReview,
        implementation: consistentProposal,
        verification: failedVerification
      }),
    });

    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await assert("Execution Engine - Accept and isolate workspace (/api/projects/:id/execute)", async () => {
    const sampleRequest = "Modify mock file";
    const samplePlan = {
      summary: "Change mock file",
      featureType: "refactor",
      complexity: "low",
      affectedAreas: ["tests"],
      filesLikelyToChange: ["tests/mock_exec_temp.txt"],
      implementationSteps: ["Modify file"],
      dependencies: [],
      risks: [],
      validationPlan: []
    };
    const approvedReview = {
      recommendation: "Approve",
      approved: true,
      overallAssessment: "Good plan",
      confidence: "High",
      leanCompliance: "Clean",
      architectureReview: "Clean",
      affectedAreasReview: [],
      missingFiles: [],
      unnecessaryFiles: [],
      riskAssessment: [],
      alternativeApproaches: [],
      verificationChecklist: [],
    };
    const consistentProposal = {
      summary: "Modify mock file content",
      status: "proposed",
      filesToModify: ["tests/mock_exec_temp.txt"],
      filesToCreate: [],
      filesToDelete: [],
      implementationOrder: ["tests/mock_exec_temp.txt"],
      changes: [{
        file: "tests/mock_exec_temp.txt",
        reason: "Test",
        changeType: "modify",
        description: "Test execution"
      }],
      diffs: [
        "--- old/tests/mock_exec_temp.txt\n+++ new/tests/mock_exec_temp.txt\n@@\n- initial content\n+ modified content"
      ],
      estimatedImpact: "Low",
      validationChecklist: []
    };
    const passedVerification = {
      summary: "Passed",
      passed: true,
      verified: true,
      durationMs: 120,
      assertionsCount: 5,
      failures: [],
      recommendation: "Proceed"
    };

    const mockFilePath = path.join(process.cwd(), "tests", "mock_exec_temp.txt");
    fs.writeFileSync(mockFilePath, "initial content\n", "utf8");

    try {
      const res = await app.request(`/api/projects/${testProjectId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: sampleRequest,
          plan: samplePlan,
          review: approvedReview,
          implementation: consistentProposal,
          verification: passedVerification
        }),
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.report) {
        throw new Error(`Invalid response: ${JSON.stringify(data)}`);
      }

      const { status, workspace, patchesApplied, filesModified, typecheck, tests } = data.report;
      if (status !== "success") throw new Error(`Expected report status success, got ${status}`);
      if (!workspace.startsWith("feature/remotefix-execution-")) throw new Error(`Expected workspace branch name, got ${workspace}`);
      if (patchesApplied !== 1) throw new Error(`Expected 1 patch applied, got ${patchesApplied}`);
      if (!filesModified.includes("tests/mock_exec_temp.txt")) throw new Error("Expected tests/mock_exec_temp.txt in filesModified");
      if (typecheck !== "PASS") throw new Error("Expected typecheck to be PASS");
      if (tests !== "PASS") throw new Error("Expected tests to be PASS");
    } finally {
      if (fs.existsSync(mockFilePath)) {
        fs.unlinkSync(mockFilePath);
      }
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
