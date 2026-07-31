# ADR-0003: CDK Builder Lifecycle, Validation, and Failure Modes

**Status:** Accepted

## Context

Blueprint pattern ([[ADR-0002]]) requires clear lifecycle: when to validate? How to order instantiation? When do hooks run?

## Decision

**Pre-build validation (fail-fast):** Circular deps, undefined refs, missing environment dimensions, invalid props. Errors throw; recipes must fix before `.build()`.

**Build phase:** Instantiate in registration order, apply naming, wire relationships, run pre-build hooks, instantiate, run post-build hooks.

**Post-build:** Aspects, outputs, exports, custom hooks.

**Typed registry:** Resources keyed by name; `getResource<Type>(key)` ensures type safety and validates existence.

**Execution order:** Registration order is execution order — deterministic, no implicit topological sort.

**Hook contract:** Pre-build hooks validate only (no mutations); post-build hooks may mutate for tagging/aspects.

## Consequences

- **Fail-fast** — Circular deps caught pre-synthesis, not at deploy
- **Deterministic** — No surprises from reordering; easier debugging
- **Type-safe** — Typed registry prevents silent ref bugs
- **Tradeoff** — Recipes must register in dependency order (no auto topological sort); all resources instantiated (mitigated by recipe scoping)

**Alternatives:** Late validation (simpler, errors surface too late); auto topological sort (hides ordering, ambiguous on cycles); no validation (fails at scale).

## Related

- [[ADR-0002]] — Blueprint pattern overview
- [CDK Builder README](./cdk/README.md)
- [CDK Builder Considerations](./considerations.md) — Open questions
