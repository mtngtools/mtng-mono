# Architectural Decision Records (ADR)

Architectural decisions that shaped mtngTOOLS infrastructure, data model, and deployment strategy. Each ADR documents a decision's context, trade-offs considered, and consequences.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-deploy-recipe-suite-naming-and-layout.md) | Deploy Recipe, Suite, and Library Naming and Layout | Accepted |
| [0002](./0002-cdk-builder-blueprint-pattern.md) | CDK Builder Blueprint Pattern for Infrastructure Declaration | Accepted |
| [0003](./0003-cdk-builder-lifecycle-validation-and-failure-modes.md) | CDK Builder Lifecycle, Validation, and Failure Modes | Accepted |
| [0004](./0004-timeline-steps-pattern-for-entity-lifecycle.md) | Timeline & Steps Pattern for Entity Lifecycle State Management | Accepted |
| [0005](./0005-cross-language-compatibility.md) | Shared Types Should Be Portable to C#/.NET | Accepted |

## How to Read These

Each ADR follows the same structure:
- **Context** — The problem or tension that prompted the decision
- **Decision** — What was chosen and why
- **Consequences** — Benefits and tradeoffs
- **Alternatives Considered** — Other options that were evaluated
- **Related Decisions** — Links to other ADRs and detailed specs

Start with [0001](#) if you're new to mtngTOOLS deployment; [0002](#) and [0003](#) are prerequisites for understanding the CDK builder; [0004](#) applies to state management across all entity types.

## Recording New Decisions

When the team resolves an architectural decision:
1. Create a new ADR with the next number (0005, 0006, …)
2. Use the same structure (Context, Decision, Consequences, Alternatives)
3. Link related ADRs with `[[ADR-NNNN]]` syntax
4. Update this README

**When to write an ADR:**
- Hard to reverse (significant cost to undo)
- Surprising without context (future reader will ask "why this way?")
- Result of a real trade-off (genuine alternatives were considered)

**When to skip:** Simple implementation details, one-off fixes, or self-evident choices.
