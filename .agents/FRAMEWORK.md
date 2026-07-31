# RemoteFix AI Operating System Framework

## Architecture Overview
The RemoteFix AI OS is a self-validating multi-agent orchestration framework designed to align code generation models with monorepo constraints.

## Directory Map
- `knowledge/`: Single source of truth.
- `templates/`: Production-ready boilerplates.
- `playbooks/`: Repeatable developer workflows.
- `rules/`: Concise enforceable standards.
- `checks/`: Actionable verification lists.
- `examples/`: Codebase-specific references.
- `orchestration/`: Workflow execution logic.
- `skills/`: AI agent capabilities.
- `validation/`: Compliance checking suite.

## Dependency Graph
See [FRAMEWORK_DEPENDENCY_GRAPH.md](file:///e:/SURAJ/REMOTEFIX-/.agents/FRAMEWORK_DEPENDENCY_GRAPH.md).

## Lifecycle
1. **Intake**: Classify task.
2. **Plan**: Write plan and obtain user approval.
3. **Execute**: Edit files.
4. **Verify**: Run validations.

## Upgrade Process
Upgrades require incrementing `VERSION`, updating `CHANGELOG.md`, and running `RELEASE_CHECKLIST.md`.

## Contribution Guide
To contribute a new skill, create a compliant `SKILL.md` under `skills/` containing the mandatory 16 sections.
