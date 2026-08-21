# PRODUCE (.NET) — landing note

Pointer only. The **Produce** domain's .NET surface lives in
[mtng-dotnet-mono](https://github.com/mtngtools/mtng-dotnet-mono); **that repo's `spec/` is the
source of truth** ([ADR-0006](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0006-spec-placement-and-docs.md)).
This note exists so the .NET home is findable from mtng-mono — it deliberately duplicates no
content.

- **Registry** — one row per unit in [`package-directory.md`](../../package-directory.md) under
  **PRODUCE (.NET)**: 1-liner + repo link + status.
- **Canonical spec** — per-assembly at `src/spec/<Layer>/<FullAssemblyName>/` in
  mtng-dotnet-mono, authored spec-first. *(Not under `src/stable/…/spec/` — that was the
  pre-amendment home; a package may exist as spec-only before any code, so the spec cannot live
  under `stable/`. See ADR-0006's amendment.)*
- **Layers** — the closed set from
  [ADR-0003](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0003-package-and-namespace-naming.md),
  amended by [ADR-0014](https://github.com/mtngtools/mtng-dotnet-mono/blob/main/spec/adr/0014-appcore-layer-and-app-family-layering.md)
  (`MtngTools.<Layer>.<Area>…`): `Core`, `Frame`, `Provide`, `Compose`, `App`, `AppCore`,
  `Utils`, `Develop`, `Deploy` — mtngTOOLS' layer vocabulary mapped to .NET namespaces.

The row's status + 1-liner are the only fields allowed to drift, updated at each status
transition (a step on mtng-dotnet-mono's stable-promotion checklist). No automated cross-repo
currency gate today.
