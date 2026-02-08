# Submodules

This directory holds **Git submodules**. The HLS repo (`sub/hls`) is included in the monorepo's pnpm workspace: its **packages** (`sub/hls/packages/*`) are workspace members and use the root lockfile. The hls repo must have `pnpm-workspace.yaml` and `pnpm-lock.yaml` removed for that to work. See [SUBMODULES.md](../SUBMODULES.md).

| Path | Description |
|------|-------------|
| `hls` | [mtngtools/hls](https://github.com/mtngtools/hls) — HLS utilities (packages + CLI). Run `git submodule add -b main https://github.com/mtngtools/hls.git sub/hls` from repo root if not yet added. |
