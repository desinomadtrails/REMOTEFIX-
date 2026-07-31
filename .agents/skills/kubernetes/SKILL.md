---
name: RemoteFix Kubernetes Configurations
description: Managing localized container manifests for mock services orchestration.
---

# RemoteFix Kubernetes Configurations Skill

## Purpose
Orchestrate mock service deployments in test clusters.

## Scope
K8s manifest specifications under `/k8s`.

## Responsibilities
- Declare scaling boundaries.

## Decision Rules
- **Rule**: Secure access variables via K8s Secret bindings.

## Best Practices
- Refer to [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md).

## Common Mistakes
- Hardcoding service URLs in ingress definitions.

## Completion Checklist
- `[ ]` Kubeconform checks pass.
