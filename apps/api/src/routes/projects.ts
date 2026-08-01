import { Hono } from "hono";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { projects } from "@remotefix/database";
import { RepositoryScanner } from "../services/ai/runtime/RepositoryScanner.js";
import { AppEnv } from "../middleware/auth.js";
import { PlanningEngine } from "../services/ai/PlanningEngine.js";
import { ReviewEngine } from "../services/ai/ReviewEngine.js";
import { ImplementationEngine } from "../services/ai/ImplementationEngine.js";
import { VerificationEngine } from "../services/ai/VerificationEngine.js";
import { ExecutionEngine } from "../services/ai/ExecutionEngine.js";
import { WorkspaceContext } from "@remotefix/types";

const projectsRouter = new Hono<AppEnv>();

// Input validation schema using Zod
const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project Name is required"),
  path: z.string().min(1, "Local Repository Path is required"),
  description: z.string().optional(),
});

// Dynamic metadata structure
interface ProjectMetadata {
  isGit: boolean;
  hasPackageJson: boolean;
  packageName?: string;
  packageVersion?: string;
  lastCommit?: {
    hash: string;
    author: string;
    date: string;
    message: string;
  };
  branch?: string;
  structure?: any;
}

interface ProjectData {
  id: string;
  name: string;
  path: string;
  description: string | null;
  createdAt: string;
  lastOpened: string | null;
  metadata?: ProjectMetadata;
}

// In-memory fallback for testing/local development when DB is unreachable
const memoryDb: ProjectData[] = [];

// Helper to gather repository metadata
function gatherMetadata(repoPath: string): ProjectMetadata {
  const isGit = fs.existsSync(path.join(repoPath, ".git"));
  const hasPackageJson = fs.existsSync(path.join(repoPath, "package.json"));
  let packageName: string | undefined;
  let packageVersion: string | undefined;

  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(repoPath, "package.json"), "utf8"));
      packageName = pkg.name;
      packageVersion = pkg.version;
    } catch {
      // Ignored: invalid package.json format will be handled in verification
    }
  }

  let lastCommit: any;
  let branch: string | undefined;

  if (isGit) {
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: repoPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      const commitHash = execSync("git rev-parse HEAD", {
        cwd: repoPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      const author = execSync('git log -1 --format="%an"', {
        cwd: repoPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      const date = execSync('git log -1 --format="%ad" --date=iso', {
        cwd: repoPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      const message = execSync('git log -1 --format="%s"', {
        cwd: repoPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      lastCommit = { hash: commitHash, author, date, message };
    } catch {
      // Git command failed, potentially empty repo
    }
  }

  // Scan project structure if it matches the workspace structure
  let structure: any;
  const packagesExist = fs.existsSync(path.join(repoPath, "packages"));
  const appsExist = fs.existsSync(path.join(repoPath, "apps"));
  if (packagesExist && appsExist) {
    const originalCwd = process.cwd();
    try {
      process.chdir(repoPath);
      structure = RepositoryScanner.scan();
    } catch {
      // Ignore scanning error
    } finally {
      process.chdir(originalCwd);
    }
  }

  return {
    isGit,
    hasPackageJson,
    packageName,
    packageVersion,
    lastCommit,
    branch,
    structure,
  };
}

// 1. CREATE PROJECT
projectsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validation = CreateProjectSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ success: false, error: validation.error.errors[0].message }, 400);
    }

    const { name, path: repoPath, description } = validation.data;
    const resolvedPath = path.resolve(repoPath);

    // Verify repository path exists and is a directory
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path does not exist or is not a directory." }, 400);
    }

    // Verify Git repository exists
    if (!fs.existsSync(path.join(resolvedPath, ".git"))) {
      return c.json({ success: false, error: "The path is not a valid Git repository." }, 400);
    }

    // Verify package.json if present
    const packageJsonPath = path.join(resolvedPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      } catch {
        return c.json({ success: false, error: "The package.json file is invalid." }, 400);
      }
    }

    const newProjectId = crypto.randomUUID();
    const newProject: ProjectData = {
      id: newProjectId,
      name,
      path: resolvedPath,
      description: description || null,
      createdAt: new Date().toISOString(),
      lastOpened: null,
    };

    let savedProject: ProjectData;

    try {
      const db = getDb(c.env.DATABASE_URL);
      
      // Check duplicate path
      const existing = await db.select().from(projects).where(eq(projects.path, resolvedPath));
      if (existing.length > 0) {
        return c.json({ success: false, error: "A project with this repository path is already registered." }, 400);
      }

      await db.insert(projects).values({
        id: newProject.id,
        name: newProject.name,
        path: newProject.path,
        description: newProject.description,
        createdAt: new Date(newProject.createdAt),
        lastOpened: null,
      });

      savedProject = newProject;
    } catch (dbErr) {
      // Fallback to in-memory store if DB is unreachable
      const duplicate = memoryDb.find((p) => p.path === resolvedPath);
      if (duplicate) {
        return c.json({ success: false, error: "A project with this repository path is already registered." }, 400);
      }
      memoryDb.push(newProject);
      savedProject = newProject;
    }

    // Add metadata for returning payload
    savedProject.metadata = gatherMetadata(resolvedPath);

    return c.json({ success: true, project: savedProject, message: "Project registered successfully." }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create project" }, 500);
  }
});

// 2. LIST PROJECTS
projectsRouter.get("/", async (c) => {
  try {
    let list: ProjectData[] = [];

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects);
      list = rows.map((r) => ({
        id: r.id,
        name: r.name,
        path: r.path,
        description: r.description,
        createdAt: r.createdAt.toISOString(),
        lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
      }));
    } catch (dbErr) {
      // Fallback to memoryDb
      list = memoryDb;
    }

    // Return display details: Name, Repository Path, Last Opened
    const displayList = list.map((p) => ({
      id: p.id,
      name: p.name,
      path: p.path,
      lastOpened: p.lastOpened,
    }));

    return c.json({ success: true, projects: displayList });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to list projects" }, 500);
  }
});

// 3. OPEN PROJECT
projectsRouter.post("/:id/open", async (c) => {
  try {
    const id = c.req.param("id");
    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      // Fallback to memoryDb
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const resolvedPath = project.path;

    // Verify repository path exists and is a directory
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository exists
    if (!fs.existsSync(path.join(resolvedPath, ".git"))) {
      return c.json({ success: false, error: "The local repository is no longer a valid Git repository." }, 400);
    }

    // Verify package.json if present
    const packageJsonPath = path.join(resolvedPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      } catch {
        return c.json({ success: false, error: "The package.json file is invalid." }, 400);
      }
    }

    const now = new Date();
    project.lastOpened = now.toISOString();

    try {
      const db = getDb(c.env.DATABASE_URL);
      await db.update(projects).set({ lastOpened: now }).where(eq(projects.id, id));
    } catch (dbErr) {
      // Fallback: update memoryDb
      const idx = memoryDb.findIndex((p) => p.id === id);
      if (idx !== -1) {
        memoryDb[idx].lastOpened = now.toISOString();
      }
    }

    // Reuse RepositoryScanner and gather metadata
    project.metadata = gatherMetadata(resolvedPath);

    return c.json({ success: true, project, message: "Project opened successfully." });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to open project" }, 500);
  }
});

// 4. DELETE PROJECT
projectsRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let found = false;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        found = true;
        await db.delete(projects).where(eq(projects.id, id));
      }
    } catch (dbErr) {
      // Fallback: delete from memoryDb
      const idx = memoryDb.findIndex((p) => p.id === id);
      if (idx !== -1) {
        found = true;
        memoryDb.splice(idx, 1);
      }
    }

    if (!found) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    return c.json({ success: true, message: "Project registration deleted successfully." });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to delete project" }, 500);
  }
});

// Helper types and directory traverser for Repository Intelligence
interface RepositoryStats {
  totalFiles: number;
  sourceFiles: number;
  configFiles: number;
  docFiles: number;
  projectSize: number;
  technologies: Set<string>;
  frameworks: Set<string>;
  packageManagers: Set<string>;
  tooling: Set<string>;
}

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "venv",
  ".venv",
  "env",
  ".env",
  "dist",
  "build",
  "out",
  ".next",
  "bin",
  "obj",
  "target",
  "vendor",
]);

function traverseDirectory(dir: string, stats: RepositoryStats) {
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (IGNORED_DIRS.has(file)) continue;
      traverseDirectory(fullPath, stats);
    } else if (stat.isFile()) {
      stats.totalFiles++;
      stats.projectSize += stat.size;

      const ext = path.extname(file).toLowerCase();
      const filename = file.toLowerCase();

      // Technology detection by marker files
      if (filename === "package.json") {
        stats.technologies.add("Node.js");
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const pkg = JSON.parse(content);
          const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          
          if (deps["react"]) stats.frameworks.add("React");
          if (deps["next"]) stats.frameworks.add("Next.js");
          if (deps["vue"]) stats.frameworks.add("Vue");
          if (deps["@angular/core"]) stats.frameworks.add("Angular");
          if (deps["express"]) stats.frameworks.add("Express");
          if (deps["@nestjs/core"]) stats.frameworks.add("NestJS");
          if (deps["hono"]) stats.frameworks.add("Hono");

          if (deps["typescript"]) stats.tooling.add("TypeScript");
          if (deps["eslint"]) stats.tooling.add("ESLint");
          if (deps["prettier"]) stats.tooling.add("Prettier");
          if (deps["turbo"]) stats.tooling.add("Turborepo");
          if (deps["nx"]) stats.tooling.add("Nx");
        } catch {}
      }
      if (filename === "requirements.txt" || filename === "pyproject.toml" || filename === "pipfile") {
        stats.technologies.add("Python");
        try {
          const content = fs.readFileSync(fullPath, "utf8").toLowerCase();
          if (content.includes("fastapi")) stats.frameworks.add("FastAPI");
          if (content.includes("flask")) stats.frameworks.add("Flask");
          if (content.includes("django")) stats.frameworks.add("Django");
        } catch {}
      }
      if (filename === "go.mod") {
        stats.technologies.add("Go");
      }
      if (filename === "cargo.toml") {
        stats.technologies.add("Rust");
      }
      if (filename === "pom.xml" || filename === "build.gradle") {
        stats.technologies.add("Java");
      }
      if (ext === ".csproj" || filename === "sln") {
        stats.technologies.add(".NET");
      }
      if (filename === "composer.json") {
        stats.technologies.add("PHP");
      }

      // Package manager detection
      if (filename === "package-lock.json") stats.packageManagers.add("npm");
      if (filename === "pnpm-lock.yaml") stats.packageManagers.add("pnpm");
      if (filename === "yarn.lock") stats.packageManagers.add("yarn");
      if (filename === "bun.lockb" || filename === "bun.lock") stats.packageManagers.add("bun");
      if (filename === "poetry.lock") stats.packageManagers.add("poetry");
      if (filename === "cargo.lock") stats.packageManagers.add("cargo");
      if (filename === "go.sum") stats.packageManagers.add("go");
      if (filename === "requirements.txt" || filename === "pipfile") {
        stats.packageManagers.add("pip");
      }

      // Tooling detection from file names
      if (filename === "tsconfig.json") stats.tooling.add("TypeScript");
      if (filename === "dockerfile" || filename === "docker-compose.yml") stats.tooling.add("Docker");
      if (filename === "turbo.json") stats.tooling.add("Turborepo");
      if (filename === "nx.json") stats.tooling.add("Nx");
      if (filename === "eslint.config.js" || filename === "eslint.config.mjs" || filename === "eslint.config.ts" || filename.startsWith(".eslintrc")) stats.tooling.add("ESLint");
      if (filename === "prettier.config.js" || filename.startsWith(".prettierrc")) stats.tooling.add("Prettier");

      // Source files
      const sourceExtensions = new Set([
        ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".cs", ".php",
        ".cpp", ".c", ".h", ".m", ".swift", ".kt", ".rb", ".pl", ".sh"
      ]);
      if (sourceExtensions.has(ext)) {
        stats.sourceFiles++;
      }

      // Configuration files
      const configExtensions = new Set([
        ".json", ".yaml", ".yml", ".toml", ".xml", ".ini", ".conf", ".config"
      ]);
      if (configExtensions.has(ext) || filename === "dockerfile" || filename === "docker-compose.yml" || filename.startsWith(".env") || filename === ".gitignore") {
        stats.configFiles++;
      }

      // Documentation files
      const docExtensions = new Set([
        ".md", ".txt", ".pdf", ".html", ".rst", ".adoc"
      ]);
      if (docExtensions.has(ext)) {
        if (filename !== "requirements.txt") {
          stats.docFiles++;
        }
      }
    }
  }
}

// 5. GET REPOSITORY INTELLIGENCE
projectsRouter.get("/:id/repository", async (c) => {
  try {
    const id = c.req.param("id");
    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // 1. Repository Summary
    const repoName = path.basename(repoPath);
    let currentBranch = "main";
    let defaultBranch = "main";
    let gitStatusStr = "";
    let lastCommit: any = null;
    let remoteUrl = "";

    try {
      currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {}

    try {
      const output = execSync("git rev-parse --abbrev-ref origin/HEAD", { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (output && !output.includes("fatal") && output.startsWith("origin/")) {
        defaultBranch = output.replace("origin/", "");
      }
    } catch {
      try {
        const output = execSync("git symbolic-ref refs/remotes/origin/HEAD", { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        defaultBranch = path.basename(output);
      } catch {}
    }

    try {
      gitStatusStr = execSync("git status", { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {}

    try {
      const hash = execSync("git rev-parse HEAD", { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      const author = execSync('git log -1 --format="%an"', { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      const date = execSync('git log -1 --format="%ad" --date=iso', { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      const message = execSync('git log -1 --format="%s"', { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      lastCommit = { hash, author, date, message };
    } catch {}

    try {
      remoteUrl = execSync("git config --get remote.origin.url", { cwd: repoPath, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {}

    // Initialize statistics object
    const stats: RepositoryStats = {
      totalFiles: 0,
      sourceFiles: 0,
      configFiles: 0,
      docFiles: 0,
      projectSize: 0,
      technologies: new Set<string>(),
      frameworks: new Set<string>(),
      packageManagers: new Set<string>(),
      tooling: new Set<string>(),
    };

    // Perform recursive filesystem traversal
    traverseDirectory(repoPath, stats);

    // Clean up pip package manager if poetry.lock was found
    if (stats.packageManagers.has("poetry")) {
      stats.packageManagers.delete("pip");
    }

    // 2. High-level Architecture / Structure Summary
    const directories: string[] = [];
    const configFiles: string[] = [];
    
    // Check root directory contents
    let rootContents: string[] = [];
    try {
      rootContents = fs.readdirSync(repoPath);
    } catch {}

    const commonDirs = ["apps", "packages", "docs", "tests", "scripts", "src", "lib", "bin", "config", "public"];
    const commonConfigs = [
      "package.json", "tsconfig.json", "Dockerfile", "docker-compose.yml",
      "turbo.json", "nx.json", "eslint.config.js", "eslint.config.mjs",
      "eslint.config.ts", "composer.json", "go.mod", "Cargo.toml",
      "pyproject.toml"
    ];

    for (const item of rootContents) {
      const fullPath = path.join(repoPath, item);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (commonDirs.includes(item)) {
          directories.push(`${item}/`);
        }
      } else if (stat.isFile()) {
        if (commonConfigs.includes(item) || item.startsWith(".env")) {
          configFiles.push(item);
        }
      }
    }

    // Check .github/workflows
    const workflowsPath = path.join(repoPath, ".github", "workflows");
    if (fs.existsSync(workflowsPath) && fs.statSync(workflowsPath).isDirectory()) {
      try {
        const workflowFiles = fs.readdirSync(workflowsPath).filter(f => f.endsWith(".yml") || f.endsWith(".yaml"));
        if (workflowFiles.length > 0) {
          configFiles.push(".github/workflows");
          stats.tooling.add("GitHub Actions");
        }
      } catch {}
    }

    // Reuse RepositoryScanner if applicable
    let detailedStructure: any = undefined;
    const packagesExist = fs.existsSync(path.join(repoPath, "packages"));
    const appsExist = fs.existsSync(path.join(repoPath, "apps"));
    if (packagesExist && appsExist) {
      const originalCwd = process.cwd();
      try {
        process.chdir(repoPath);
        detailedStructure = RepositoryScanner.scan();
      } catch {
      } finally {
        process.chdir(originalCwd);
      }
    }

    return c.json({
      success: true,
      repository: {
        summary: {
          name: repoName,
          path: repoPath,
          defaultBranch,
          currentBranch,
          gitStatus: gitStatusStr,
          lastCommit,
          remoteUrl,
        },
        technologies: Array.from(stats.technologies),
        frameworks: Array.from(stats.frameworks),
        packageManagers: Array.from(stats.packageManagers),
        statistics: {
          totalFiles: stats.totalFiles,
          sourceFiles: stats.sourceFiles,
          configFiles: stats.configFiles,
          docFiles: stats.docFiles,
          projectSize: stats.projectSize,
        },
        structureSummary: {
          directories,
          configFiles,
          tooling: Array.from(stats.tooling),
        },
        structure: detailedStructure,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to analyze repository" }, 500);
  }
});

// Single-traversal workspace context scanner
function scanWorkspace(repoPath: string): WorkspaceContext {
  const context: WorkspaceContext = {
    workspaceType: "single",
    entryPoints: [],
    backend: [],
    frontend: [],
    database: [],
    sharedPackages: [],
    routes: [],
    tests: [],
    documentation: [],
    configuration: [],
    tooling: [],
    repository: {
      branch: "main",
      frameworks: [],
      languages: [],
      packageManagers: [],
    },
  };

  const detectedLanguages = new Set<string>();
  const detectedFrameworks = new Set<string>();
  const detectedPackageManagers = new Set<string>();
  const detectedTooling = new Set<string>();

  // Determine workspace type
  const packagesExist = fs.existsSync(path.join(repoPath, "packages"));
  const appsExist = fs.existsSync(path.join(repoPath, "apps"));
  if (packagesExist && appsExist) {
    context.workspaceType = "monorepo";
  }

  // Get current git branch
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: repoPath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    context.repository.branch = branch;
  } catch {}

  const IGNORED_DIRS = new Set([
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "env",
    ".env",
    "dist",
    "build",
    "out",
    ".next",
    "bin",
    "obj",
    "target",
    "vendor",
  ]);

  const configFilesList = new Set([
    "package.json",
    "tsconfig.json",
    "dockerfile",
    "docker-compose.yml",
    "readme.md",
    ".env.example",
    "turbo.json",
    "nx.json",
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.ts",
    "prettier.config.js",
    "composer.json",
    "go.mod",
    "cargo.toml",
    "pyproject.toml",
    "requirements.txt"
  ]);

  const entryPointFiles = new Set([
    "index.ts",
    "server.ts",
    "app.ts",
    "main.tsx",
    "index.tsx",
    "main.py",
    "app.py",
    "manage.py"
  ]);

  function traverse(currentDir: string) {
    let files: string[] = [];
    try {
      files = fs.readdirSync(currentDir);
    } catch {
      return;
    }

    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const relPath = path.relative(repoPath, fullPath).replace(/\\/g, "/");
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (IGNORED_DIRS.has(file)) continue;

        const lowFile = file.toLowerCase();

        // 1. Semantic directory classification
        if (lowFile === "tests" || lowFile === "test" || lowFile === "__tests__") {
          context.tests.push(relPath);
        } else if (lowFile === "docs" || lowFile === "documentation" || lowFile === "wiki") {
          context.documentation.push(relPath);
        } else if (lowFile === "routes" || lowFile === "controllers") {
          context.routes.push(relPath);
        }

        // Subdirectories checks for monorepo components
        if (context.workspaceType === "monorepo") {
          const parentDir = path.basename(currentDir);
          if (parentDir === "apps") {
            if (lowFile === "api" || lowFile === "backend") {
              context.backend.push(relPath);
            } else if (lowFile === "web" || lowFile === "admin" || lowFile === "mobile" || lowFile === "frontend" || lowFile === "client") {
              context.frontend.push(relPath);
            } else {
              const hasReact = fs.existsSync(path.join(fullPath, "node_modules", "react")) || 
                               fs.existsSync(path.join(fullPath, "src", "main.tsx")) || 
                               fs.existsSync(path.join(fullPath, "src", "index.tsx"));
              if (hasReact) {
                context.frontend.push(relPath);
              } else {
                context.backend.push(relPath);
              }
            }
          } else if (parentDir === "packages") {
            if (lowFile === "database" || lowFile === "db") {
              context.database.push(relPath);
            } else {
              context.sharedPackages.push(relPath);
            }
          }
        }

        traverse(fullPath);
      } else if (stat.isFile()) {
        const lowFile = file.toLowerCase();
        const ext = path.extname(file).toLowerCase();

        // 2. Entry point detection
        if (entryPointFiles.has(lowFile)) {
          context.entryPoints.push(relPath);
        }

        // 3. Important file detection
        if (configFilesList.has(lowFile) || lowFile.startsWith(".env") || lowFile.startsWith(".eslintrc") || lowFile.startsWith(".prettierrc")) {
          context.configuration.push(relPath);
        }

        // 4. Technology / Language detection
        if (lowFile === "package.json") {
          detectedLanguages.add("Node.js");
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const pkg = JSON.parse(content);
            const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            
            if (deps["react"]) detectedFrameworks.add("React");
            if (deps["next"]) detectedFrameworks.add("Next.js");
            if (deps["vue"]) detectedFrameworks.add("Vue");
            if (deps["@angular/core"]) detectedFrameworks.add("Angular");
            if (deps["express"]) detectedFrameworks.add("Express");
            if (deps["@nestjs/core"]) detectedFrameworks.add("NestJS");
            if (deps["hono"]) detectedFrameworks.add("Hono");

            if (deps["typescript"]) detectedTooling.add("TypeScript");
            if (deps["eslint"]) detectedTooling.add("ESLint");
            if (deps["prettier"]) detectedTooling.add("Prettier");
            if (deps["turbo"]) detectedTooling.add("Turborepo");
            if (deps["nx"]) detectedTooling.add("Nx");
          } catch {}
        }
        if (lowFile === "requirements.txt" || lowFile === "pyproject.toml" || lowFile === "pipfile") {
          detectedLanguages.add("Python");
          try {
            const content = fs.readFileSync(fullPath, "utf8").toLowerCase();
            if (content.includes("fastapi")) detectedFrameworks.add("FastAPI");
            if (content.includes("flask")) detectedFrameworks.add("Flask");
            if (content.includes("django")) detectedFrameworks.add("Django");
          } catch {}
        }
        if (lowFile === "go.mod") {
          detectedLanguages.add("Go");
        }
        if (lowFile === "cargo.toml") {
          detectedLanguages.add("Rust");
        }
        if (lowFile === "pom.xml" || lowFile === "build.gradle") {
          detectedLanguages.add("Java");
        }
        if (ext === ".csproj" || lowFile === "sln") {
          detectedLanguages.add(".NET");
        }
        if (lowFile === "composer.json") {
          detectedLanguages.add("PHP");
        }

        // 5. Package manager detection
        if (lowFile === "package-lock.json") detectedPackageManagers.add("npm");
        if (lowFile === "pnpm-lock.yaml") detectedPackageManagers.add("pnpm");
        if (lowFile === "yarn.lock") detectedPackageManagers.add("yarn");
        if (lowFile === "bun.lockb" || lowFile === "bun.lock") detectedPackageManagers.add("bun");
        if (lowFile === "poetry.lock") detectedPackageManagers.add("poetry");
        if (lowFile === "cargo.lock") detectedPackageManagers.add("cargo");
        if (lowFile === "go.sum") detectedPackageManagers.add("go");
        if (lowFile === "requirements.txt" || lowFile === "pipfile") {
          detectedPackageManagers.add("pip");
        }

        // 6. Tooling detection
        if (lowFile === "tsconfig.json") detectedTooling.add("TypeScript");
        if (lowFile === "dockerfile" || lowFile === "docker-compose.yml") detectedTooling.add("Docker");
        if (lowFile === "turbo.json") detectedTooling.add("Turborepo");
        if (lowFile === "nx.json") detectedTooling.add("Nx");
        if (lowFile === "eslint.config.js" || lowFile === "eslint.config.mjs" || lowFile === "eslint.config.ts" || lowFile.startsWith(".eslintrc")) detectedTooling.add("ESLint");
        if (lowFile === "prettier.config.js" || lowFile.startsWith(".prettierrc")) detectedTooling.add("Prettier");
      }
    }
  }

  traverse(repoPath);

  // Check for .github/workflows directory at root
  const workflowsPath = path.join(repoPath, ".github", "workflows");
  if (fs.existsSync(workflowsPath) && fs.statSync(workflowsPath).isDirectory()) {
    try {
      const workflowFiles = fs.readdirSync(workflowsPath).filter(f => f.endsWith(".yml") || f.endsWith(".yaml"));
      if (workflowFiles.length > 0) {
        context.configuration.push(".github/workflows");
        detectedTooling.add("GitHub Actions");
      }
    } catch {}
  }

  // Single project default mapping
  if (context.workspaceType === "single") {
    const hasBackend = detectedLanguages.has("Go") || detectedLanguages.has("Rust") || detectedLanguages.has("PHP") || detectedLanguages.has("Java") || detectedLanguages.has(".NET") || detectedFrameworks.has("Express") || detectedFrameworks.has("Hono") || detectedFrameworks.has("FastAPI") || detectedFrameworks.has("Flask") || detectedFrameworks.has("Django");
    const hasFrontend = detectedFrameworks.has("React") || detectedFrameworks.has("Next.js") || detectedFrameworks.has("Vue") || detectedFrameworks.has("Angular");
    
    if (hasBackend) context.backend.push(".");
    if (hasFrontend || (!hasBackend && context.entryPoints.length > 0)) context.frontend.push(".");
  }

  // Clean up pip package manager if poetry.lock was found
  if (detectedPackageManagers.has("poetry")) {
    detectedPackageManagers.delete("pip");
  }

  // Populate repository context metadata
  context.repository.languages = Array.from(detectedLanguages);
  context.repository.frameworks = Array.from(detectedFrameworks);
  context.repository.packageManagers = Array.from(detectedPackageManagers);
  context.tooling = Array.from(detectedTooling);

  // Reuse RepositoryScanner if applicable to gather precise route paths
  if (context.workspaceType === "monorepo") {
    const originalCwd = process.cwd();
    try {
      process.chdir(repoPath);
      const scannerResult = RepositoryScanner.scan();
      if (scannerResult.routes && scannerResult.routes.length > 0) {
        const apiRoutesPath = "apps/api/src/routes";
        for (const r of scannerResult.routes) {
          context.routes.push(`${apiRoutesPath}/${r}`);
        }
      }
    } catch {
    } finally {
      process.chdir(originalCwd);
    }
  }

  // Clean up and sort files/directories arrays for stable responses
  context.entryPoints.sort();
  context.backend.sort();
  context.frontend.sort();
  context.database.sort();
  context.sharedPackages.sort();
  context.routes.sort();
  context.tests.sort();
  context.documentation.sort();
  context.configuration.sort();
  context.tooling.sort();
  context.repository.languages.sort();
  context.repository.frameworks.sort();
  context.repository.packageManagers.sort();

  return context;
}

// 6. GET WORKSPACE CONTEXT ENGINE
projectsRouter.get("/:id/context", async (c) => {
  try {
    const id = c.req.param("id");
    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // Perform single-pass workspace scan
    const workspaceContext = scanWorkspace(repoPath);

    return c.json({
      success: true,
      context: workspaceContext,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to analyze workspace context" }, 500);
  }
});

// 7. GET PLANNING ENGINE PLAN
projectsRouter.get("/:id/plan", async (c) => {
  try {
    const id = c.req.param("id");
    const promptText = c.req.query("prompt") || c.req.query("request") || c.req.query("query") || "";

    if (!promptText) {
      return c.json({ success: false, error: "User request prompt is required." }, 400);
    }

    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // Load workspace context (does one traversal scan)
    const workspaceContext = scanWorkspace(repoPath);

    // Invoke Planning Engine to generate the implementation plan
    const plan = await PlanningEngine.generatePlan(workspaceContext, promptText);

    return c.json({
      success: true,
      plan,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate planning engine plan" }, 500);
  }
});

// 8. POST REVIEW ENGINE PLAN
projectsRouter.post("/:id/review", async (c) => {
  try {
    const id = c.req.param("id");
    const { request, plan } = await c.req.json();

    if (!request || !plan) {
      return c.json({ success: false, error: "Original request and plan are required in request body." }, 400);
    }

    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // Load workspace context (does one traversal scan)
    const workspaceContext = scanWorkspace(repoPath);

    // Invoke Review Engine to evaluate the proposed plan
    const review = await ReviewEngine.reviewPlan(workspaceContext, request, plan);

    return c.json({
      success: true,
      review,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate plan review" }, 500);
  }
});

// 9. POST IMPLEMENT ENGINE PROPOSAL
projectsRouter.post("/:id/implement", async (c) => {
  try {
    const id = c.req.param("id");
    const { request, plan, review } = await c.req.json();

    if (!request || !plan || !review) {
      return c.json({ success: false, error: "Original request, plan, and review are required in request body." }, 400);
    }

    // Validate Review Approval
    if (review.recommendation !== "Approve") {
      return c.json({ success: false, error: "Implementation requires an approved review recommendation." }, 400);
    }

    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // Load workspace context (does one traversal scan)
    const workspaceContext = scanWorkspace(repoPath);

    // Invoke Implementation Engine to generate the implementation proposal
    const proposal = await ImplementationEngine.generateProposal(workspaceContext, request, plan, review);

    return c.json({
      success: true,
      proposal,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate implementation proposal" }, 500);
  }
});

// 10. POST VERIFY PROPOSAL
projectsRouter.post("/:id/verify", async (c) => {
  try {
    const id = c.req.param("id");
    const { request, plan, review, implementation } = await c.req.json();

    if (!request || !plan || !review || !implementation) {
      return c.json({ success: false, error: "Original request, plan, review, and implementation proposal are required in request body." }, 400);
    }

    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // Load workspace context (does one traversal scan)
    const workspaceContext = scanWorkspace(repoPath);

    // Invoke Verification Engine to evaluate proposal consistency
    const verification = await VerificationEngine.verifyProposal(workspaceContext, request, plan, review, implementation);

    return c.json({
      success: true,
      verification,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to verify proposal" }, 500);
  }
});

// 11. POST EXECUTE PROPOSAL
projectsRouter.post("/:id/execute", async (c) => {
  try {
    const id = c.req.param("id");
    const { request, plan, review, implementation, verification } = await c.req.json();

    if (!request || !plan || !review || !implementation || !verification) {
      return c.json({ success: false, error: "Original request, plan, review, implementation proposal, and verification result are required in request body." }, 400);
    }

    // Validate that verification is passed/verified and recommendation is Proceed
    const isVerified = verification.verified === true || verification.passed === true;
    const isProceed = verification.recommendation === "Proceed";
    if (!isVerified || !isProceed) {
      return c.json({ success: false, error: "Execution blocked: VerificationResult must be verified and recommendation must be Proceed." }, 400);
    }

    let project: ProjectData | undefined;

    try {
      const db = getDb(c.env.DATABASE_URL);
      const rows = await db.select().from(projects).where(eq(projects.id, id));
      if (rows.length > 0) {
        const r = rows[0];
        project = {
          id: r.id,
          name: r.name,
          path: r.path,
          description: r.description,
          createdAt: r.createdAt.toISOString(),
          lastOpened: r.lastOpened ? r.lastOpened.toISOString() : null,
        };
      }
    } catch (dbErr) {
      project = memoryDb.find((p) => p.id === id);
    }

    if (!project) {
      return c.json({ success: false, error: "Project not found." }, 404);
    }

    const repoPath = project.path;

    // Verify path exists and is a directory
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
      return c.json({ success: false, error: "The local repository path no longer exists on disk." }, 400);
    }

    // Verify Git repository
    const isGit = fs.existsSync(path.join(repoPath, ".git"));
    if (!isGit) {
      return c.json({ success: false, error: "The local repository is not a valid Git repository." }, 400);
    }

    // Load workspace context (does one traversal scan)
    const workspaceContext = scanWorkspace(repoPath);

    // Invoke Safe Execution Engine
    const report = await ExecutionEngine.executeProposal(
      workspaceContext,
      request,
      plan,
      review,
      implementation,
      verification,
      repoPath
    );

    return c.json({
      success: report.status === "success",
      report,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to execute proposal" }, 500);
  }
});

export { projectsRouter };
