#!/usr/bin/env tsx
import { handleStatus } from "./commands/status.js";
import { handleTest } from "./commands/test.js";
import { handleReview } from "./commands/review.js";
import { handlePlan } from "./commands/plan.js";
import { handleCommit } from "./commands/commit.js";
import { handlePush } from "./commands/push.js";
import { handlePull } from "./commands/pull.js";
import { handleDoctor } from "./commands/doctor.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case "status":
      await handleStatus();
      break;
    case "test":
      await handleTest();
      break;
    case "review":
      await handleReview(args[1]);
      break;
    case "plan":
      await handlePlan(args.slice(1).join(" "));
      break;
    case "commit":
      await handleCommit(args.slice(1).join(" "));
      break;
    case "push":
      await handlePush();
      break;
    case "pull":
      await handlePull();
      break;
    case "doctor":
      await handleDoctor();
      break;
    case "help":
    case "-h":
    case "--help":
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
RemoteFix Developer Workshop CLI (rf) - v0.1.0

Usage:
  rf <command> [arguments]

Commands:
  status                Show git status, branch, and project statistics
  test                  Run typecheck compilation and API test suite
  review <file>         Run AI OS code and lean-code compliance review
  plan "<task>"         Generate implementation plan via the AI OS
  commit "<msg>"        Stage all changes and commit with conventional message
  push                  Push local commits to remote origin repository
  pull                  Pull latest updates from remote origin repository
  doctor                Run diagnostics for Git, Node, npm, TS, SSH, and AI OS
  help, -h, --help      Show this help info
`);
}

main().catch((error: unknown) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`Execution error: ${msg}`);
  process.exit(1);
});
