# ADR-0005: Shared Types Should Be Portable to C#/.NET

**Status:** Accepted

## Context

mtngTOOLS is a TypeScript repo, but some components ship in **.NET (C#)** — e.g. an in-room speaker timer whose config the TS side authors. They meet through data (DB / JSON), so type *design*, not runtime interop, is the risk.

## Decision

Design **boundary-crossing data-model types** (not TS-internal ones) so a C# implementation can reconstruct them idiomatically. A consideration, not a gate. No C# is built here.

Avoid on these types: magic-number sentinels (`-1`/`-2` in one field), `[key: string]: unknown` bags, and untagged unions. Prefer explicit enums and a real `kind` discriminator — those map cleanly to C# records/enums.

## Consequences

Cheaper future port; explicit shapes that also read better in TS. Existing types (e.g. `minutes`' sentinels) need not change until next touched.

## Related

- [`presentation-timing/README.md`](../../packages/core/src/data/spec/presentation-timing/README.md) — the worked example.
- [Spec README](../README.md)
