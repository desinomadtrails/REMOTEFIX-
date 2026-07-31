---
name: RemoteFix Code Reviewer
description: Responsible for code reviews, architecture reviews, rule enforcement, and documentation consistency.
---

# RemoteFix Code Reviewer Skill

## Purpose
Audit modified code files to enforce standards compliance.

## Responsibilities
- Validate type safety parameters.
- Verify file naming conventions.

## Inputs
- Implemented file diffs.

## Outputs
- Code audit review reports.

## Required Context
- [orchestration/verification.md](../orchestration/verification.md)

## Required Knowledge
- [coding-standards.md](../../knowledge/coding-standards.md)

## Templates Used
- [prompt-template.md](../../templates/prompt-template.md)

## Rules Enforced
- [rules/naming.md](../../rules/naming.md)

## Playbooks Used
- [playbooks/security-review.md](../../playbooks/security-review.md)

## Checks Required
- [checks/pre-pr.md](../../checks/pre-pr.md)

## Examples Referenced
- [examples/example-test.md](../../examples/example-test.md)

## Limitations
- Must not apply direct file modifications.

## Failure Conditions
- Code diff violates workspace unidirectional dependency flow.

## Escalation Rules
- Escalate if security bypasses are detected during review.

## Success Criteria
- Pull request code complies with checks.

## Related Skills
- `implementer`
- `security`

## Interactions
- **Activates**: When files are modified.
- **Hands off**: To `security` or `performance` once compliance audits pass.
- **Rejects work**: If code fails compiler validations.
- **Requests clarification**: If code changes lack testing scripts.
- **Escalates**: If critical dependency flow boundaries are broken.
