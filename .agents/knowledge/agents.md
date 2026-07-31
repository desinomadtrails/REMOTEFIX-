# Subagent Lifecycle Management - RemoteFix

## Purpose
Defines constraints, scopes, and communication protocols for subagents.

## Scope
Workspace subagent runs.

## Overview
Subagents execute specific tasks under defined directory boundaries.

## Standards
- Limit file access to the specific component directories assigned to the subagent.
- Verify subagent outputs before merging changes.

## Examples
*Directory restriction command parameter:*
`restrictTo: "apps/api/src/services"`

## Related Documents
- [workflows.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/workflows.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.agents/skills/agents/SKILL.md`
