# ADR-0004: Timeline & Steps Pattern for Entity Lifecycle State Management

**Status:** Accepted

## Context

Complex lifecycles (sessions, meetings) with scattered flags (`isLive`, `status`, `published`), duplicate phase logic across UI/API/jobs, and unclear valid transitions.

## Decision

Model evolution as **timeline** (phases: `pre-live`, `live`, `archive`, etc.) with explicit **steps** (units of work: `set-to-prelive`, `select-source`, `publish-media`, etc.).

- State is single `currentStep` reference, not multiple flags
- Each step has prerequisites and action handler
- Steps are registered in a step registry; Core defines logic, FRAME wires UI, PROVIDE wires APIs/jobs

Example: Session `archive` phase has steps: `select-source` → `edit-players` → `submit-encode` → `publish-media` → `publish-players` → `set-to-archive`.

## Consequences

- **Single source of truth** — One `currentStep` replaces multiple scattered flags
- **Explicit transitions** — Prerequisites and valid next-steps declarative
- **Testable, debuggable** — Step logic isolated, logs show clear progression
- **Resilient** — Jobs resume from current step on failure
- **Tradeoff** — Initial design cost; each step needs name + prerequisites + handler; UI becomes step-aware

**Alternatives:** Enum `status` (simpler, doesn't scale); event sourcing (overkill, audit-trail only); graph state machine (more powerful, more complex).

## Related

- [Patterns README](../patterns/README.md)
- [Session example](../patterns/timeline-steps/session/README.md)
- [Implementation guide](../patterns/timeline-steps/README.md)
