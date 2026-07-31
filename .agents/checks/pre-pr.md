# Pre-PR Verification Checklist
- [ ] Changes are isolated inside a dedicated feature branch.
- [ ] Branch is rebased against the latest `main` branch.
- [ ] Monorepo compiles successfully: `npm run build`.
- [ ] Automated test suite runs and passes: `npm run test`.
- [ ] No database schemas modifications are committed without generated migration scripts.
