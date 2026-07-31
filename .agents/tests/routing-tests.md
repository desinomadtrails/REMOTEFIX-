# Routing Engine Verification Tests - RemoteFix

## Purpose
Verify that every task category maps to a valid playbook, template, rules, checks, and skills.

## Input
Path: `.agents/orchestration/task-routing.md`

## Expected Result
Routing mapping table successfully resolves all 13 categories.

## Failure Mode
A category points to a missing template or contains empty fields.
