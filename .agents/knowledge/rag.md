# Retrieval-Augmented Generation (RAG) Strategy - RemoteFix

## Purpose
Provides guidelines for locating context, schemas, and specifications to ground code generation.

## Scope
Knowledge base and repository indexing.

## Overview
RAG uses codebase files to ground generations, preventing hallucinations.

## Standards
- Read the relevant `knowledge/` documents before writing code.
- Prioritize current active files over stale snippets.

## Examples
*grounding references block:*
`[schema/index.ts](file:///packages/database/database/schema/index.ts)`

## Related Documents
- [decisions.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/decisions.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.agents/skills/rag/SKILL.md`
