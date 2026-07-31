# Framework Validator - RemoteFix

## Purpose
Maintains framework structural integrity by validating existence of all required subdirectories and core files.

## Scope
Applies to the entire `.agents/` workspace structure.

## Overview
Automates the structural verification of the RemoteFix AI Operating System.

## Standards
- Evaluates the existence of 9 subdirectories: `knowledge/`, `templates/`, `playbooks/`, `rules/`, `checks/`, `examples/`, `orchestration/`, `prompts/`, `skills/`.

## Examples
*Verification script check sequence:*
```python
dirs = ["knowledge", "templates", "playbooks", "rules", "checks", "examples", "orchestration", "prompts", "skills"]
assert all(os.path.exists(os.path.join(base, d)) for d in dirs)
```

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json` (root directory mappings)
