# mtngTOOLS Monorepo

Shared packages for the mtngTOOLS suite (medical conference video platforms). This repo contains **UTILS**, **CORE**, **FRAME**, and **PROVIDE** packages, plus a **sub** folder for Git submodules (e.g. the HLS repo). See the [code organization overview](../overview/code-organization.md) for layers and dependency rules.

## Layout

- **`packages/*`** — Publishable libraries (e.g. utils-core).
- **`sub/*`** — Git submodules (e.g. [mtngtools/hls](https://github.com/mtngtools/hls) at `sub/hls` — HLS packages + CLI). See [SUBMODULES.md](./SUBMODULES.md) and [sub/README.md](./sub/README.md).

## Packages

| Package | Description |
| :--- | :--- |
| `@mtngtools/utils-core` | Core utility functions shared across packages. |

## Submodules

- **HLS** — [mtngtools/hls](https://github.com/mtngtools/hls) at `sub/hls`. Clone with `--recurse-submodules` or run `git submodule update --init --recursive`. See [SUBMODULES.md](./SUBMODULES.md).

## Getting started

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
```

## Development

- **Package manager**: [pnpm](https://pnpm.io) (workspaces)
- **Build / tasks**: [Turbo](https://turbo.build)
- **Releases**: [Changesets](https://github.com/changesets/changesets) (add a changeset with `pnpm changeset` for versioned changes)

## Specifications

See [spec/README.md](./spec/README.md) and per-package `spec/` directories.

## Agent guidance

Repository-level agent guidance: [AGENTS_REPO.md](./AGENTS_REPO.md). Organization-level and stack guidance: [mtngtools/agents](https://github.com/mtngtools/agents).
