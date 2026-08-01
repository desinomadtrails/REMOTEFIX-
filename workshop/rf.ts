#!/usr/bin/env tsx
import { handleStatus } from "./commands/status.js";
import { handleTest } from "./commands/test.js";
import { handleReview } from "./commands/review.js";
import { handlePlan } from "./commands/plan.js";
import { handleCommit } from "./commands/commit.js";

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
  help, -h, --help      Show this help info
`);
}

main().catch((error) => {
  console.error(`Execution error: ${error.message}`);
  process.exit(1);
});
