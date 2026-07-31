---
name: RemoteFix Backend Specialist
description: Responsible for Hono APIs, middleware setups, payload validation, error handling, and logging.
---

# RemoteFix Backend Specialist Skill

## Purpose
Implement Hono API router routes and error handlers.

## Responsibilities
- Define Hono routes with body validations.
- Integrate logging and security middlewares.

## Inputs
- Endpoint routing requirements.

## Outputs
- Backend files (`.ts`).

## Required Context
- [adr/0004-api-design.md](../../knowledge/adr/0004-api-design.md)

## Required Knowledge
- [api-guidelines.md](../../knowledge/api-guidelines.md)

## Templates Used
- [api-template.md](../../templates/api-template.md)
- [controller-template.md](../../templates/controller-template.md)

## Rules Enforced
- [rules/api.md](../../rules/api.md)
- [rules/typescript.md](../../rules/typescript.md)

## Playbooks Used
- [playbooks/new-api.md](../../playbooks/new-api.md)

## Checks Required
- [checks/backend.md](../../checks/backend.md)

## Examples Referenced
- [examples/example-api.md](../../examples/example-api.md)

## Limitations
- Must not write CSS styles or client components.

## Failure Conditions
- Route validator bypasses payload schemas checking.

## Escalation Rules
- Escalate if error captures expose raw database stack traces.

## Success Criteria
- Route returns standard success/data/message payloads format.

## Related Skills
- `database`
- `security`

## Interactions
- **Activates**: When REST route endpoints or middlewares modification are requested.
- **Hands off**: To `reviewer` with status `implemented` once endpoints pass compile check.
- **Rejects work**: If payload validators are omitted.
- **Requests clarification**: If return data fields mapping is ambiguous.
- **Escalates**: If unhandled router exceptions crash worker runtimes.
