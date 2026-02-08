# AGENTS.md

## Package-specific agent guidance for `@mtngtools/frame-vue`

This file contains only package-specific guidance for automated agents working on the `@mtngtools/frame-vue` package. See below for additional guidance.

## Organization-specific guidance

Follow organization-level rules in `AGENTS_ORGANIZATION.md` found in [mtngtools/agents](https://github.com/mtngtools/agents). If this repository has not been provided in context, agent must either 1) pull directly from GitHub or 2) prompt user to provide context.

## Technology-stack-specific notes

This is a TypeScript + Vue package. Consult [stacks/AGENTS_STACK_TYPESCRIPT/README.md](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/README.md) and [vue.md](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/vue.md) in the `mtngtools/agents` repository.

## Repository-specific guidance

- Find `AGENTS_REPO.md` in the root of this project's repository for repository-level agent guidance.

## Package starting places

Consult [README.md](./README.md) and [package.json](./package.json) as best starting places.

## Package-specific rules

- This package is **FRAME**: Vue.js component and composable library. Can depend on UTILS and CORE.
- Use Vue Composition API only (no Options API).
- Use single-file components (SFCs) for components.
- Build outputs ESM only (no CJS) per stack guidance for Vue libraries.
- Intended for consumption via a Nuxt module; keep exports suitable for auto-import or direct import.

----

Keep this file short and focused — add only package-specific rules here.
