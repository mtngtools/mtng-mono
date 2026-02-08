# AGENTS.md

## Package-specific agent guidance for `@mtngtools/utils-core`

This file contains only package-specific guidance for automated agents working on the `@mtngtools/utils-core` package. See below for additional guidance.

## Organization-specific guidance

Follow organization-level rules in `AGENTS_ORGANIZATION.md` found in [mtngtools/agents](https://github.com/mtngtools/agents). If this repository has not been provided in context, agent must either 1) pull directly from GitHub or 2) prompt user to provide context.

## Technology-stack-specific notes

This is a TypeScript package. Consult [stacks/AGENTS_STACK_TYPESCRIPT/README.md](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/README.md) found in `mtngtools/agents` repository.

## Repository-specific guidance

- Find `AGENTS_REPO.md` in the root of this project's repository for repository-level agent guidance.

## Package starting places

Consult [README.md](./README.md) and [package.json](./package.json) as best starting places.

## Package-specific rules

- This package is **UTILS**: domain-agnostic; keep external dependencies to types/interfaces only.
- Prefer small, pure functions and minimal surface area.

----

Keep this file short and focused — add only package-specific rules here.
