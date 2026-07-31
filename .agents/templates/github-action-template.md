# GitHub Action Template - RemoteFix

## Purpose
Automates code check pipelines and Azure Web Apps deployment.

## When to use
When setting up or updating CI/CD pipelines in `.github/workflows/`.

## Required inputs
- Triggers definition (e.g. push to main, pull request).
- Target runner setup (e.g. Node version, cash keys).

## Example
```yaml
name: CI check
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
```

## Common mistakes
- Bypassing the typecheck verification step.

## Checklist
- [ ] CI pipeline validates code builds.
