# RemoteFix

> The AI Software Engineering Platform that plans, reviews, verifies, and safely executes code changes.

RemoteFix is an autonomous, developer-first AI software engineering assistant designed to operate directly on codebases. Unlike traditional code-completion systems, RemoteFix coordinates a structured, multi-stage reasoning pipeline and runs code changes inside isolated sandboxes to guarantee compilation and unit test safety.

---

## 🚀 Project Status: v1.1.0 Release Candidate (v1.1.0-rc1)

RemoteFix is currently at **v1.1.0-rc1 (Release Candidate)** status following Phase 3.3 Production Hardening. Monorepo builds, typechecks, unit tests, Docker containerization, Azure deployment pipelines, and Playwright E2E verification pass 100% cleanly.

---

## Why RemoteFix?

### The Problem
Traditional AI coding assistants act as intelligent autocomplete engines or text generators. They frequently generate code that contains syntax errors, breaks typecheck constraints, violates project style rules, or introduces regressions. The burden is entirely on the developer to dry-run, compile, and debug the proposal.

### The RemoteFix Solution
RemoteFix separates **reasoning** from **execution**. It models software tasks as structural workflows and secures them with a dual-gate validation pipeline. No code proposal is ever applied directly to the main workspace until it has passed formal planning audits, code reviews, in-sandbox compilation tests, and unit verification runs.

### How It Differs
* **Structured Reasoning**: Rather than generating code in one shot, RemoteFix sequences work across decoupled AI engines (Planning -> Review -> Implementation -> Verification).
* **Guaranteed Safety**: Runs all compilation checks and tests inside temporary `git worktrees`.
* **Zero Dev Workspace Intrusion**: Reverts clean on failure, preventing workspace corruption or uncommitted work loss.

---

## Core Features

* **Project Registry**: Manage, scan, and track local workspace paths and system settings.
* **Repository Intelligence**: Extract active branch details, commit histories, and remote configurations.
* **Workspace Context**: Structural file tree indexer mapping directories, target packages, and entry points.
* **Planning Engine**: Evaluates developer goals and outputs structural file-change sequences.
* **Review Engine**: Audits proposed steps against custom style guidelines and LEAN CODE FIRST rules.
* **Implementation Engine**: Translates plans to standard unified patch diffs.
* **Verification Engine**: Double-checks proposed patches against plans and asserts verification parameters.
* **Safe Execution Engine**: Automatically configures isolated git workspaces, maps node_modules junctions, applies patches, and validates compilation/test suites.
* **Orchestrator Agent**: Manages the workflow state machine and logs timelines.

---

## Engineering Pipeline

RemoteFix runs every goal through a sequential 10-step pipeline:

```
  Developer Request
         │
         ▼
  Project Registry ─────────────► Scan & Retrieve Project Configuration
         │
         ▼
  Repository Intelligence ──────► Fetch Active Branch, Origin URL, and Commits
         │
         ▼
  Workspace Context ────────────► Generate File Tree & Entry Points Map
         │
         ▼
  Planning Engine ──────────────► Generate Step-by-Step Change Plan
         │
         ▼
  Review Engine ────────────────► Audit Plan Against Guidelines
         │
         ▼
  Implementation Engine ────────► Generate Unified Patch Diffs
         │
         ▼
  Verification Engine ──────────► Verify Diffs and Check Execution Gates
         │
         ▼
  Safe Execution Engine ────────► Create Worktree, Patch, Compile, & Run Tests
         │
         ▼
  Consolidated Report ──────────► Output Status, Timeline, and Diff Metrics
```

---

## Architecture Diagram

```
                      +-----------------------------+
                      |      Developer Prompt       |
                      +--------------+--------------+
                                     |
                                     v
                      +--------------+--------------+
                      |      Orchestrator Agent     |
                      +--------------+--------------+
                                     |
    +--------------------------------+--------------------------------+
    |                                |                                |
    v                                v                                v
+---+-------------------+   +--------+----------+   +-----------------+---+
|  Planning Engine      |   |   Review Engine   |   | Implementation Eng  |
|                       |   |                   |   |                     |
|  - Workspace Scans    |   |  - Rule Audits    |   |  - Diffs & Patches  |
|  - Step Sequences     |   |  - Lean Analysis  |   |  - Code Generation  |
+---+-------------------+   +--------+----------+   +-----------------+---+
    |                                |                                |
    +--------------------------------+--------------------------------+
                                     |
                                     v
                      +--------------+--------------+
                      |     Verification Engine     |
                      |                             |
                      |   - Double-Gate Security    |
                      |   - Recommendation Check    |
                      +--------------+--------------+
                                     |
                                     v
                      +--------------+--------------+
                      |    Safe Execution Engine    |
                      |                             |
                      |   - Git Worktree Sandbox    |
                      |   - Symlink Junctions       |
                      |   - Compilation & Tests     |
                      +-----------------------------+
```

---

## Technology Stack

* **Backend**: Node.js, Hono HTTP Server, Wrangler, TypeScript
* **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, React Query (TanStack)
* **Database**: SQLite (local) via Drizzle ORM
* **AI reasoning**: TokenRouter, Gemini API, Claude API, OpenAI API
* **Git Tools**: Local Git command wrapper & Git Worktree manager

---

## Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Git](https://git-scm.com/) installed and configured on your path

### 1. Clone the repository
```bash
git clone https://github.com/desinomadtrails/REMOTEFIX-.git
cd REMOTEFIX-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create an `.env` file in the root directory (or in `apps/api/`):
```env
PORT=8787
DATABASE_URL=sqlite.db
# Primary AI Provider configuration
GEMINI_API_KEY=your_gemini_api_key_here
# Optional backup providers
CLAUDE_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Seed the Database
```bash
npm run seed --workspace=apps/api
```

### 5. Run the dev server
```bash
npm run dev
```
Open your browser to `http://localhost:5173` to access the developer dashboard.

### 6. Production Docker Deployment
To build and run the multi-stage production container (following the Docker Compose Specification):
```bash
# Validate compose spec
docker compose config

# Build and start production container
docker compose up -d --build
```

Health Endpoints:
* Liveness probe: `GET /health/liveness` (HTTP 200)
* Gateway health: `GET /health` (HTTP 200)
* API health: `GET /api/health` (HTTP 200)

For complete architecture, Liveness vs Readiness specifications, environment variable documentation, and troubleshooting (including Windows PowerShell PSReadLine details), see [DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md).

---

## Example Workflow

1. **Submit Goal**: Enter a request in the Console (e.g. *"Change tests/mock_exec_temp.txt assertion text to Success"*).
2. **Review & Draft**: RemoteFix creates the change steps, reviews them, and prepares a patch.
3. **Sandbox Test**: RemoteFix spins up an isolated worktree branch, patches the target file, and runs typechecks/tests.
4. **Completed**: If passes, returns the report with modified files and timeline metric.

---

## Safety Guidelines

RemoteFix is designed for enterprise workspace safety:
* **No Destructive Commands**: The execution pipeline is prohibited from running destructive git actions like `git reset --hard` or `git clean -fd` in the user's workspace folder.
* **Double-Gate Gatekeeper**: Execution only begins if `VerificationResult.verified == true` and `VerificationResult.recommendation == "Proceed"`.
* **Clean Abort**: If a run fails compilation or testing, the sandboxed worktree is safely deleted, keeping your main directory untracked files and working branches untouched.

---

## Roadmap

* **v1.0.x (Current)**: Local monorepo CLI, REST endpoints, and Web MVP console.
* **v1.1**: GitHub OAuth, team authentication, execution history logs, and Slack/Discord webhooks.
* **v1.2**: Background scheduler, parallel job runner, and custom project templates.
* **v2.0**: Cloud hosting, isolated containers, and plugin marketplace.

---

## Contributing

We welcome pull requests! To contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/cool-new-feature`.
3. Commit changes: `git commit -m "feat(cool): add support for cool stuff"`.
4. Push to the branch: `git push origin feature/cool-new-feature`.
5. Submit a Pull Request.

---

## License

RemoteFix is distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

> Think. Review. Verify. Execute.
