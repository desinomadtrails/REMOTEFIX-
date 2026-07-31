# AI_RULES.md
# RemoteFix Enterprise Platform Development Rules

Version: 1.0
Project: RemoteFix Enterprise Platform

---

# Mission

RemoteFix is an Enterprise IT Service Management (ITSM), Field Service Management (FSM),
Asset Management, Customer Support, and AI Operations platform.

All AI-generated code must preserve enterprise architecture, security,
maintainability, scalability, and backward compatibility.

Never sacrifice architecture for convenience.

---

# General Principles

Always

- Write production-ready code.
- Prefer readability over cleverness.
- Keep files focused.
- Keep functions small.
- Write modular components.
- Follow SOLID principles.
- Prefer composition over inheritance.
- Avoid duplicate logic.
- Avoid unnecessary abstractions.
- Minimize technical debt.

Never

- Break existing APIs.
- Remove working features.
- Introduce breaking schema changes.
- Hardcode secrets.
- Bypass security.
- Ignore type errors.
- Skip testing.

---

# Architecture

Maintain layered architecture.

UI

↓

API

↓

Controllers

↓

Services

↓

Repositories

↓

Database

Never allow

Controller → Database

or

UI → Database

All business logic belongs inside Services.

---

# AI Architecture

Always use

AIOrchestrator

Never call providers directly.

Allowed

Business Service

↓

AIOrchestrator

↓

Provider Factory

↓

Provider

Never

Business Service

↓

OpenAI

↓

TokenRouter

↓

Gemini

---

# Provider Agnostic Design

Never assume one AI provider.

All providers must implement common interfaces.

Support

- TokenRouter
- OpenAI
- Anthropic
- Gemini
- Azure OpenAI
- Ollama
- Mock Provider

Future providers must be plug-ins.

---

# AI Agent

AI must never execute business logic directly.

All actions must flow through

Tool Registry

↓

Permission Engine

↓

Business Services

↓

Repositories

↓

Database

---

# Tool Execution

Every tool requires

- Tool ID
- Description
- Input validation
- RBAC validation
- Tenant validation
- Audit logging
- Error handling

High-risk actions require explicit confirmation.

---

# Enterprise Memory

Memory types

- Session
- Conversation
- Customer
- Technician
- Asset
- Organization
- Tenant
- Workflow
- Knowledge

Always respect tenant isolation.

---

# RAG

Use

Context Builder

↓

Enterprise Memory

↓

Hybrid Retrieval

↓

AI Provider

Never answer from memory alone when organizational knowledge is available.

Return citations whenever retrieved knowledge is used.

---

# Multi-Tenant Rules

Every database query must respect

tenantId

Never leak data across tenants.

Never bypass tenant filtering.

---

# RBAC

Every protected action requires permission validation.

Roles include

- Super Admin
- Admin
- Manager
- Dispatcher
- Technician
- Customer

Never elevate privileges automatically.

---

# Security

Never

- Hardcode API keys
- Commit secrets
- Log credentials
- Log access tokens
- Expose stack traces
- Disable authentication

Read secrets only from environment variables.

---

# Database

Use additive migrations.

Never delete production columns.

Never rename production tables without migrations.

Prefer

New columns

over

Breaking changes.

---

# API Design

REST endpoints should

- Validate input
- Return consistent JSON
- Return appropriate HTTP status codes
- Include useful error messages
- Avoid leaking implementation details

Maintain backward compatibility.

---

# Coding Standards

TypeScript

- strict mode
- interfaces first
- avoid any
- explicit return types
- async/await
- meaningful variable names

Python

- type hints where practical
- modular functions
- no global mutable state
- descriptive names

---

# Error Handling

Never swallow exceptions.

Always

- log meaningful context
- return safe responses
- preserve auditability

---

# Logging

Use structured logging.

Never log

- passwords
- API keys
- JWTs
- secrets
- customer PII unless required and authorized

---

# Testing

Every feature must include tests.

Run before completion

npm run test

npm run typecheck

npm run build

No feature is complete until all pass.

---

# Performance

Prefer

- pagination
- lazy loading
- caching
- batching
- asynchronous processing

Avoid

- N+1 queries
- repeated database access
- blocking operations

---

# Observability

Track

- latency
- failures
- AI provider
- model
- token usage
- execution time
- audit events

---

# Git Workflow

Prefer feature branches.

Example

feature/phase-8-step-5

Commit messages

feat:

fix:

refactor:

docs:

test:

chore:

---

# File Organization

Keep related code together.

Avoid utility dumping.

Prefer

services/

repositories/

controllers/

models/

providers/

tools/

tests/

---

# Documentation

Every new module should include

- purpose
- architecture
- usage
- limitations

Complex systems should include architecture diagrams where practical.

---

# AI Prompting

When implementing a feature

1. Analyze existing architecture.
2. Reuse existing services.
3. Avoid duplicate implementations.
4. Preserve API compatibility.
5. Add tests.
6. Verify build.
7. Stop after the requested scope.

Do not implement future phases unless explicitly requested.

---

# Completion Checklist

Before declaring a task complete

- Existing APIs still work
- Tests pass
- Typecheck passes
- Build passes
- Documentation updated (if needed)
- No secrets added
- No RBAC regressions
- No tenant isolation regressions
- Audit logging preserved

Only then consider the implementation complete.