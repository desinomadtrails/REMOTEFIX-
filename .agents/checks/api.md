# API Gateway Quality Verification Checklist
- [ ] Routes prefix with `/api/`.
- [ ] Payload validators verify input formatting via Zod schema checks.
- [ ] Controller routes return success/data/message JSON formats.
- [ ] Error messages return clean summaries without stack traces.
- [ ] Tracing middlewares attach correlation IDs to headers.
