# Skill Validator - RemoteFix

## Purpose
Enforces the mandatory 16-section structure on all active skills.

## Scope
Applies to all files under `.agents/skills/*/SKILL.md`.

## Overview
Ensures all AI skills declare inputs, outputs, rules enforced, and escalation paths.

## Standards
- Skills must contain every required section header.
- No section is allowed to contain generic placeholder text.

## Examples
*Headers checklist:*
- `## Purpose`, `## Responsibilities`, `## Inputs`, `## Outputs`, `## Escalation Rules`.

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`verify_core_skills.py` (validation runner)
