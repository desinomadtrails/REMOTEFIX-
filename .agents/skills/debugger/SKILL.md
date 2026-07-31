---
name: RemoteFix Debugger
description: Responsible for root cause analysis, stack traces, runtime debugging, and build failures.
---

# RemoteFix Debugger Skill

## Purpose
Diagnose exceptions and apply targeted bug fixes.

## Responsibilities
- Parse telemetry logs using correlation IDs.
- Patch failing code paths.

## Inputs
- Compilation error logs or crash stack traces.

## Outputs
- Localized code patches.

## Required Context
- [orchestration/failure-recovery.md](../orchestration/failure-recovery.md)

## Required Knowledge
- [logging.md](../../knowledge/logging.md)

## Templates Used
- [controller-template.md](../../templates/controller-template.md)

## Rules Enforced
- [rules/testing.md](../../rules/testing.md)

## Playbooks Used
- [playbooks/bug-fix.md](../../playbooks/bug-fix.md)

## Checks Required
- [checks/backend.md](../../checks/backend.md)

## Examples Referenced
- [examples/example-test.md](../../examples/example-test.md)

## Limitations
- Must restrict modifications to the scope of the target bug fix.

## Failure Conditions
- Bug cannot be reproduced locally.

## Escalation Rules
- Escalate if error originates from Azure SQL port lockups.

## Success Criteria
- Test cases pass and liveness probe returns normal.

## Related Skills
- `implementer`
- `testing`

## Interactions
- **Activates**: When compilation, test, or runtime failures occur.
- **Hands off**: To `reviewer` with status `implemented` once fix passes checks.
- **Rejects work**: If log context is missing.
- **Requests clarification**: If reproduction steps are ambiguous.
- **Escalates**: If connection timeouts lock database sessions.
