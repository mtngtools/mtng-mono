# AGENTS.md

## Package-specific agent guidance for `@mtngtools/frame-nuxt`

This file contains only package-specific guidance for automated agents working on the `@mtngtools/frame-nuxt` package. See below for additional guidance.

## Organization-specific guidance

Follow organization-level rules in `AGENTS_ORGANIZATION.md` found in [mtngtools/agents](https://github.com/mtngtools/agents). If this repository has not been provided in context, agent must either 1) pull directly from GitHub or 2) prompt user to provide context.

## Technology-stack-specific notes

This is a TypeScript + Nuxt package. Consult [stacks/AGENTS_STACK_TYPESCRIPT/README.md](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/README.md) and [nuxt.md](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/nuxt.md) in the `mtngtools/agents` repository.

## Repository-specific guidance

- Find `AGENTS_REPO.md` in the root of this project's repository for repository-level agent guidance.

## Package starting places

Consult [README.md](./README.md) and [package.json](./package.json) as best starting places.

## Package-specific rules

- This package is **FRAME**: Nuxt module and layer library. Can depend on UTILS, CORE, and other FRAME packages (e.g. frame-vue).
- **Modules** live under `src/modules/`; each module is built to `dist/modules/<name>.js`. Add new modules by adding a new entry in `vite.config.ts` and an export in `package.json` under `exports["./modules/<name>"]`.
- **Layers** live under `layers/<name>/` with a `nuxt.config.ts` each. Layers are shipped as source (no build). Add new layers by adding a directory and document in README.
- Do not add a default package export; consumers use subpaths (`@mtngtools/frame-nuxt/modules/frame-vue` and `@mtngtools/frame-nuxt/layers/base`).

----

Keep this file short and focused — add only package-specific rules here.
