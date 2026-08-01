# Lean Code First Enforceable Standards
- Prefer existing project code before creating new code.
- Prefer language/framework features before custom implementations.
- Prefer mature libraries before reinventing functionality.
- Delete duplicate code whenever possible.
- Merge duplicate logic.
- Avoid unnecessary wrappers.
- Avoid pass-through classes.
- Avoid abstractions created "for future use".
- Every new file must justify its existence.
- Smaller codebases are preferred.

## Mandatory Implementation Questions
Before completion, the AI must answer:
- Can existing code solve this?
- Can this be simplified?
- Can files be removed?
- Can dependencies be reduced?
- Can custom code be replaced?
- Can functions be merged?
- Is this abstraction necessary?

## Every Wrapper Must Justify Its Existence
A wrapper is technical debt unless it provides measurable engineering value. Never create wrapper classes, services, adapters, managers, helpers, utilities, or abstractions simply to hide an existing API.

Before introducing any wrapper class, service, manager, helper, adapter, facade, repository, provider, utility, or abstraction, you must answer these mandatory questions:
1. What existing API is being wrapped?
2. Why can't the existing API be called directly?
3. What measurable engineering value does this wrapper add?
4. Which approved wrapper category does it belong to? (Validation, Security, Authentication, Authorization, Logging, Metrics, Tracing, Retry, Caching, Rate Limiting, Error Translation, Vendor Abstraction, Protocol Adaptation, Backward Compatibility, Dependency Inversion for Testing)
5. What additional behavior does it provide?
6. How many independent modules are expected to reuse it?
7. Can this wrapper be replaced with a direct function call?

If none of the approved categories apply, the wrapper must not be created. Forwarding calls or renaming an API without adding behavior is prohibited.

Examples:
- **GOOD**: Command -> AIEngine.plan() (Direct call)
- **BAD**: Command -> AIService -> AIEngine.plan() (Unjustified wrapper)
- **GOOD**: Command -> execSync("git status") (Direct call)
- **BAD**: Command -> GitService -> execSync("git status") (Unjustified wrapper)
- **GOOD**: Command -> ValidationAdapter (adds validation/logging/retry behavior)
