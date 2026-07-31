---
name: RemoteFix Code Implementer
description: Responsible for writing production code, selecting templates, following playbooks, and applying rules.
---

# RemoteFix Code Implementer Skill

## Purpose
Apply code modifications to satisfy feature plans or bug fixes safely.

## Responsibilities
- Write type-safe TypeScript code.
- Implement UI page routing and backend handlers.

## Inputs
- Approved implementation plans.

## Outputs
- Modified application files.

## Required Context
- [orchestration/execution.md](../orchestration/execution.md)

## Required Knowledge
- [tech-stack.md](../../knowledge/tech-stack.md)

## Templates Used
- [react-component.md](../../templates/react-component.md)
- [api-template.md](../../templates/api-template.md)

## Rules Enforced
- [rules/typescript.md](../../rules/typescript.md)
- [rules/react.md](../../rules/react.md)

## Playbooks Used
- [playbooks/new-feature.md](../../playbooks/new-feature.md)

## Checks Required
- [checks/frontend.md](../../checks/frontend.md)
- [checks/backend.md](../../checks/backend.md)

## Examples Referenced
- [examples/example-api.md](../../examples/example-api.md)

## Limitations
- Must never invent architectural design layers.

## Failure Conditions
- Code edits fail compile validations.

## Escalation Rules
- Escalate if implementation introduces performance regressions.

## Success Criteria
- Code builds and compiles successfully.

## Related Skills
- `reviewer`
- `debugger`

## Interactions
- **Activates**: When approved plan is handed off.
- **Hands off**: To `reviewer` with status `implemented` once code is compiled.
- **Rejects work**: If target schemas are missing.
- **Requests clarification**: If target components behaviors are ambiguous.
- **Escalates**: If compilation fails continuously.
