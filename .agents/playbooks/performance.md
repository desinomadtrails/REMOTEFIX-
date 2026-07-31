# Playbook: Performance Tuning

## Goal
Optimize API latencies and client bundle sizes.

## Prerequisites
- Latency profiling data available.

## Steps
1. Optimize queries by adding indexes.
2. Add cached states to queries.
3. Review heavy libraries imports.

## Verification
- Measure route durations in Hono structured logs.

## Rollback
- Revert query changes if locks increase.

## Definition of Done
- Target latency requirements are met.
