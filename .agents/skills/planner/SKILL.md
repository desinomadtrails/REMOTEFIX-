---
name: RemoteFix Work Planner
description: Responsible for breaking work into tasks, risk analysis, milestones definition, and user checkpoints.
---

# RemoteFix Work Planner Skill

## Purpose
Decompose incoming requests into manageable tasks and outline verification plans.

## Responsibilities
- Intakes user requests and classifies task categories.
- Evaluates whether implementation is necessary, whether existing architecture already supports the feature, and whether refactoring is preferable.
- Generates implementation plans and task checklists.
- Defines rollback steps.

## Inputs
- User requests.

## Outputs
- `implementation_plan.md` and `task.md`.

## Required Context
- [orchestration/planning.md](../orchestration/planning.md)

## Required Knowledge
- [roadmap.md](../../knowledge/roadmap.md)
- [product.md](../../knowledge/product.md)

## Templates Used
- [prompt-template.md](../../templates/prompt-template.md)

## Rules Enforced
- [rules/git.md](../../rules/git.md)
- [rules/lean-code.md](../../rules/lean-code.md)

## Playbooks Used
- [playbooks/new-feature.md](../../playbooks/new-feature.md)

## Checks Required
- [checks/pre-commit.md](../../checks/pre-commit.md)

## Examples Referenced
- [examples/example-test.md](../../examples/example-test.md)

## Limitations
- Must not make any edits to repository application code.

## Failure Conditions
- Proposed feature contains ambiguous requirements without defined bounds.

## Escalation Rules
- Escalate if user overrides core safety rollback checklists.

## Success Criteria
- Approved implementation plan exists.

## Related Skills
- `architect`
- `implementer`

## Interactions
- **Activates**: When new request intakes occur.
- **Hands off**: To `architect` or `implementer` once the plan is approved.
- **Rejects work**: If requirements contain severe logical contradictions.
- **Requests clarification**: If task size boundaries are undefined.
- **Escalates**: If the user bypasses approval checkpoints.
