# RemoteFix Developer Workshop CLI (`rf`)

A lightweight developer assistant command interface that orchestrates Git and repository services while delegating task planning and code quality compliance reviews to the existing **RemoteFix AI Operating System v1.1.0**.

## Constraints & Philosophy

Following the **LEAN CODE FIRST** engineering philosophy, this CLI contains zero duplicate AI runtime, orchestration, routing, or validation logic. It is a thin adapter layer wrapping:
- The `AIEngine` and `ValidationManager` inside the `apps/api` runtime layer.
- Git commands through the `GitService`.
- Repository stats through the `ProjectService` reusing the existing `RepositoryScanner`.

The entire workshop codebase is kept under 500 lines of clean, simple TypeScript.

## Usage

Run the CLI using `npx tsx`:

```bash
# Get status of git and workspace statistics
npx tsx workshop/rf.ts status

# Run TypeScript compilation check and test suite validations
npx tsx workshop/rf.ts test

# Request AI OS to review a file for Lean Code compliance and standards
npx tsx workshop/rf.ts review <file-path>

# Request AI OS to generate an implementation plan for a task description
npx tsx workshop/rf.ts plan "Implement sample feature"

# Stage all changes and commit with the given message
npx tsx workshop/rf.ts commit "feat: conventional commit message"
```

## Architecture & Dependency Flow

```mermaid
graph TD
    CLI[rf CLI Entrypoint] --> Commands[Commands: status | test | review | plan | commit]
    Commands --> Git[GitService]
    Commands --> Project[ProjectService]
    Commands --> AI[AIService]
    Project --> Scanner[RepositoryScanner (apps/api)]
    AI --> Engine[AIEngine (apps/api)]
    Engine --> Validator[ValidationManager (apps/api)]
```
