# Specifications

Repo-level spec entry point. Package `spec/` dirs hold app-specific detail. Specification may live at the packages level, but when implementation spans many packages, the high-level spec lives here.

## Cross-cutting concerns

- **auth** — identity, sessions, access control, auth-related APIs
- **data** — schemas, import/transform, fixtures, storage boundaries
- **deploy** — recipes, naming, orchestration, shared vs app slices
- **env** — Varlock, `.env` fragments, secrets, load paths, drives [core:app-env](../packages/core/spec/app-env.md) to name and 
orchestrate apps and resources (dev through prod)
- **style** — UI/branding tokens, code and component conventions
- **cross-language portability** — shared, boundary-crossing data-model types should be designed to port to C#/.NET; see [ADR-0005](./adr/0005-cross-language-compatibility.md)

## Patterns

Reusable approaches to common problems: [patterns/README.md](./patterns/README.md) (starts with [timeline & steps](./patterns/timeline-steps/README.md)).

## Framework

Where FRAME code is split across Vue, Nuxt, and Nitro surfaces—with standards for for each: [framework/README.md](./framework/README.md).

## Code organization

See the [mtngTOOLS package directory](../package-directory.md) and [overview](../README.md) for layers (UTILS, CORE, FRAME, 
PROVIDE, COMPOSE, DEVELOP, DEPLOY, BUILD) and dependency rules.

- **PRODUCE (.NET)**: the Produce domain's .NET surface lives in [mtng-dotnet-mono](https://github.com/mtngtools/mtng-dotnet-mono) 
(source of truth); this repo carries only a thin index — see [produce/README.md](./produce/README.md) and the PRODUCE (.NET) 
section of [package-directory.md](../package-directory.md).

- **Data Import**: See [data/session-data-import.md](./data/session-data-import.md) for requirements around mocking, importing, and transforming 
session and room data.
- **Meeting**: See [data/meeting/README.md](./data/meeting/README.md) for open questions/gaps in the `Meeting` entity type.

See also: [mtngTOOLS package directory](../package-directory.md), [repo overview](../README.md), [SUBMODULES](../SUBMODULES.md).
