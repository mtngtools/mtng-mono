# PRODUCE (.NET) — landing note

Pointer only. The **Produce** domain's .NET surface lives in
[mtng-dotnet-mono](https://github.com/mtngtools/mtng-dotnet-mono); **that repo's `spec/` is the
source of truth** ([ADR-0006](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0006-spec-placement-and-docs.md)).
This note exists so the .NET home is findable from mtng-mono — it deliberately duplicates no
content.

- **Registry** — one row per unit in [`package-directory.md`](../../package-directory.md) under
  **PRODUCE (.NET)**: 1-liner + repo link + status.
- **Canonical spec** — co-located per-assembly at `src/stable/<Category>/<Assembly>/spec/` in
  mtng-dotnet-mono, authored spec-first.
- **Layers** — the closed set from
  [ADR-0003](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0003-package-and-namespace-naming.md)
  (`MtngTools.<Layer>.<Area>…`): `Core`, `Frame`, `Provide`, `Compose`, `App`, `Utils`,
  `Develop`, `Deploy` — mtngTOOLS' layer vocabulary mapped to .NET namespaces.

The row's status + 1-liner are the only fields allowed to drift, updated at each status
transition (a step on mtng-dotnet-mono's stable-promotion checklist). No automated cross-repo
currency gate today.
