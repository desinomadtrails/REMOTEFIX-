---
name: RemoteFix QA Specialist
description: Responsible for test generation, regression prevention, test coverage, and direct Hono app.request test scripts.
---

# RemoteFix QA Specialist Skill

## Purpose
Build and run integration test suites to check for regression.

## Responsibilities
- Write `app.request()` test assertions.
- Verify API response status codes.

## Inputs
- API route code files and payload specs.

## Outputs
- Test scripts (`.test.ts`).

## Required Context
- [devops.md](../../knowledge/devops.md)

## Required Knowledge
- [workflows.md](../../knowledge/workflows.md)

## Templates Used
- [test-template.md](../../templates/test-template.md)

## Rules Enforced
- [rules/testing.md](../../rules/testing.md)

## Playbooks Used
- [playbooks/bug-fix.md](../../playbooks/bug-fix.md)

## Checks Required
- [checks/pre-release.md](../../checks/pre-release.md)

## Examples Referenced
- [examples/example-test.md](../../examples/example-test.md)

## Limitations
- Must not modify backend route business logic.

## Failure Conditions
- Mock database connections fail on run times.

## Escalation Rules
- Escalate if new code changes decrease test coverage below thresholds.

## Success Criteria
- All tests pass with 0 exit code.

## Related Skills
- `debugger`
- `devops`

## Interactions
- **Activates**: When testing validations are requested on code changes.
- **Hands off**: To `devops` once test suites run clean.
- **Rejects work**: If code lacks target endpoint routes.
- **Requests clarification**: If mock data values parameters are undefined.
- **Escalates**: If test executions reveal critical security bypasses.
