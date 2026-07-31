# AI Governance & Compliance Framework - RemoteFix

## Purpose
Directs AI coding assistants on privacy preservation and verification steps.

## Scope
Applies to all code generations, tool calls, and plan documentation.

## Overview
AI integrations must remain secure, avoiding key commits or PII logging.

## Standards
- AI agents must never log PII (emails, names) to structured telemetry.
- Generated scripts must run validation checks before completion.

## Examples
*Commit prefix standard:*
- Ensure AI commits are formatted as: `chore(ai): <description>`.

## Related Documents
- [security.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/security.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.agents/skills/remotefix-ai/SKILL.md`
