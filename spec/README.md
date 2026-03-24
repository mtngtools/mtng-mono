# Specifications

This directory is the repo-level specification entry point. Detailed specs and architecture decisions live here and in each package’s `spec/` directory.

- **Code organization**: See the [mtngTOOLS package directory](../package-directory.md) and [overview](../README.md) for layers (UTILS, CORE, FRAME, PROVIDE, COMPOSE, DEVELOP) and dependency rules.
- **Submodules**: See [SUBMODULES.md](../SUBMODULES.md) for submodules (e.g. `sub/hls`).
- **Data Import**: See [data/session-data-import.md](./data/session-data-import.md) for requirements around mocking, importing, and transforming session and room data.
- New features should not be implemented until specifications are updated and approved.
