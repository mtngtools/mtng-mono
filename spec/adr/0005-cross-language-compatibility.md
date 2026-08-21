# ADR-0005: Shared Types Should Be Portable to C#/.NET

**Status:** Accepted

## Context

mtngTOOLS is a TypeScript repo, but some components ship in **.NET (C#)** — e.g. an in-room speaker timer whose config the TS side authors. They meet through data (DB / JSON), so type *design*, not runtime interop, is the risk.

## Decision

Design **boundary-crossing data-model types** (not TS-internal ones) so a C# implementation can reconstruct them idiomatically. A consideration, not a gate. No C# is built here.

Avoid on these types: magic-number sentinels (`-1`/`-2` in one field), `[key: string]: unknown` bags, and untagged unions. Prefer explicit enums and a real `kind` discriminator — those map cleanly to C# records/enums.

## Consequences

Cheaper future port; explicit shapes that also read better in TS. Existing types (e.g. `minutes`' sentinels) need not change until next touched.

**`minutes` — deferral resolved (2026-08-20).** Building the C# resolver touched it. The sentinels **stay on the wire** (a deliberate DB-friendly authoring encoding), and each language decodes at the boundary into an explicit union — `PhaseMinutes` in TS, its C# counterpart downstream — so no magic number reaches either language's logic. See mtng-dotnet-mono [ADR-0012](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0012-cross-language-timing-resolver.md).

## Related

- [`presentation-timing/README.md`](../../packages/core/src/data/spec/presentation-timing/README.md) — the worked example.
- mtng-dotnet-mono [ADR-0012](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0012-cross-language-timing-resolver.md) — how the ported resolver is held in parity (conformance corpus, not codegen). This ADR says *design so it can port*; that one says *how the port stays in step*.
- [Spec README](../README.md)
