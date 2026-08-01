# RemoteFix Developer Workshop CLI (`rf`)

A lightweight developer assistant command interface that orchestrates Git and repository services while delegating task planning and code quality compliance reviews to the existing **RemoteFix AI Operating System v1.1.0**.

## Constraints & Philosophy

Following the **LEAN CODE FIRST** engineering philosophy, this CLI contains zero duplicate AI runtime, orchestration, routing, or validation logic. It is a thin adapter layer wrapping:
- The `AIEngine` and `ValidationManager` inside the `apps/api` runtime layer.
- Git commands.
- Repository stats through the existing `RepositoryScanner`.

The entire workshop codebase is kept under 300 lines of clean, simple TypeScript.

## Installation

To make the CLI executable directly as `rf` from any folder within the project, run:

```bash
# Register the bin command globally in your npm package registry
npm link
```

Alternatively, you can run the shortcut npm script:
```bash
npm run rf <command>
```

## Command Reference

```bash
# Get status of git and workspace statistics
rf status

# Run TypeScript compilation check and test suite validations
rf test

# Request AI OS to review a file for Lean Code compliance and standards
rf review <file-path>

# Request AI OS to generate an implementation plan for a task description
rf plan "<task>"

# Stage all changes and commit with the given message
rf commit "<message>"

# Push local commits to remote origin repository
rf push

# Pull latest updates from remote origin repository
rf pull

# Run system health diagnostics (Git, Node, npm, TS, SSH, and AI OS)
rf doctor

# Display project, Workshop, OS, Git, Node, and npm versions
rf info

# Display a compact Plain-text development dashboard suitable for SSH
rf dashboard

# Safely remove temporary development artifacts
rf clean

# Run git pull and npm install update sequence
rf update
```

## Mobile SSH Workflow

To run development tasks from your mobile device (e.g. via Termux, Prompt, or Blink Shell over SSH):

1. **Start the SSH Server** on the development workstation:
   - Ensure the SSH daemon is running (e.g., OpenSSH server).
2. **Connect from Mobile**:
   ```bash
   ssh developer@workstation-ip
   ```
3. **Execute Diagnosis & Tasks**:
   Use the `rf` command directly from your terminal session:
   ```bash
   # Run system checks first to make sure everything is in place
   rf doctor

   # Check repository status
   rf status

   # Pull latest, plan a task, and review edits
   rf pull
   rf plan "Fix mobile authentication middleware parameter"
   rf review apps/api/src/services/ai/runtime/ValidationManager.ts
   ```

## Architecture & Dependency Flow

```mermaid
graph TD
    CLI[rf CLI Entrypoint] --> Commands[Commands: status | test | review | plan | commit | push | pull | doctor]
    Commands --> Builtins[Node: child_process.execSync | fs | path]
    Commands --> OS[AI OS: RepositoryScanner | AIEngine]
```
