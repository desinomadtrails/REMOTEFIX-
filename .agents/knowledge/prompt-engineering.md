# Prompt Engineering Standards - RemoteFix

## Purpose
Standardizes prompt definitions and role instructions.

## Scope
Applies to system files inside `prompts/`.

## Overview
Proper prompt patterns establish roles, define context, and use XML wrapping for constraints.

## Standards
- Include clear role definitions (e.g. Architect, Implementer).
- Format instructions using XML wrapper tags.

## Examples
*XML wrapping structure:*
```xml
<context>
RemoteFix Hono stack parameters
</context>
```

## Related Documents
- [agents.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/agents.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.agents/prompts/`
