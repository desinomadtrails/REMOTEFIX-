# Model Context Protocol (MCP) Standards - RemoteFix

## Purpose
Defines rules for using workspace developer tools.

## Scope
Applies to filesystem, git, and browser automation tool calls.

## Overview
MCP tools provide filesystem operations, browser testing, and git automation.

## Standards
- Use `list_dir` to inspect layouts, and `grep_search` to find code structures.
- Use Playwright tools to test UI rendering.

## Examples
*Using Playwright tool call:*
`browser_navigate(url)`

## Related Documents
- [workflows.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/workflows.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`mcp_config.json` (MCP server registry)
