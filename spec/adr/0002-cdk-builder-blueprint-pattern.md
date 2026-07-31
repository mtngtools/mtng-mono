# ADR-0002: CDK Builder Blueprint Pattern for Infrastructure Declaration

**Status:** Accepted

## Context

Eager CDK instantiation (`new s3.Bucket()` creates live constructs) fails at scale: naming depends on environment dimensions known only at deploy time, circular dependencies and invalid refs surface too late (synthesis/deploy), and each recipe replicate boilerplate.

## Decision

Blueprint pattern: register intent with `addXxxx()`, then instantiate all constructs in one `.build(scope)` call.

- **Intent registration** — `addXxxx()` records defs without creating CDK constructs
- **Typed registry** — Resources referenced by typed keys; late-bound name resolution at build time
- **Pre-build validation** — Circular deps, invalid refs caught before synthesis

## Consequences

- **Deterministic naming** — Environment dimensions available at build time
- **Fail-fast validation** — Errors caught in code review, not at deploy
- **Reusable recipes** — Same code, different `FullEnv` for dev/staging/prod
- **Tradeoff** — Two-phase setup adds mental overhead vs eager CDK

**Alternatives:** Eager CDK (simpler but scales poorly); config-driven YAML (type-unsafe); factory functions per recipe (still eager, no validation).

## Related

- [[ADR-0001]] — Recipe layout giving each its own CDK boundary
- [CDK Builder README](./cdk/README.md) — API details
- [ADR-0003](./0003-cdk-builder-lifecycle-validation-and-failure-modes.md) — Lifecycle & validation
