# @mtngtools/develop-mock-data — Specifications

Package-level spec entry point for recipe-driven deterministic meeting mock data.

## Scope

- Build meetings from explicit recipes, not simple count-based generators.
- Support both first-class authoring styles:
  - declarative recipe objects,
  - fluent builder API that compiles to the same recipe model.
- Encode convention-center scheduling behavior:
  - unopposed plenary windows,
  - room lifecycle changes (split and merge),
  - per-day/per-room/per-room-group block control,
  - multi-venue support (on-site + off-site sponsored sessions).
- Allow targeted custom overrides for portions of generated sessions, presentations, and speakers.

## Specifications

- [`mock-data-contract.md`](./mock-data-contract.md): API and behavior contracts.
- [`recipe-model.md`](./recipe-model.md): recipe schema and rule model.
- [`recipe-examples.md`](./recipe-examples.md): canonical simple, medium, and convention recipes.
