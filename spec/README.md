# Specifications

This directory is the repo-level specification entry point. Detailed specs and architecture decisions live here and in each package’s `spec/` directory.

- **Environment (Varlock):** See [env/README.md](./env/README.md) for the **`env/`** fragment layout and [env/varlock-and-env.md](./env/varlock-and-env.md) for **`.env.schema`** aggregation, package **`@import`**, and **`loadPath`**.
- **Code organization**: See the [mtngTOOLS package directory](../package-directory.md) and [overview](../README.md) for layers (UTILS, CORE, FRAME, PROVIDE, COMPOSE, DEVELOP, DEPLOY, BUILD) and dependency rules.
- **Deployment**: See [deploy/](deploy/) for **`deploy-suite-*`**, **`deploy-recipe-*`**, naming, shared vs app slices, and pnpm script patterns.
- **Submodules**: See [SUBMODULES.md](../SUBMODULES.md) for submodules (e.g. `sub/hls`).
- **Application environment** (`core`): See [packages/core/spec/app-env.md](../packages/core/spec/app-env.md) for typed env used to name and orchestrate apps and resources (dev through prod).
- **Data Import**: See [data/session-data-import.md](./data/session-data-import.md) for requirements around mocking, importing, and transforming session and room data.
- New features should not be implemented until specifications are updated and approved.
