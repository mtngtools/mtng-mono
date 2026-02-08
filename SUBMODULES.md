# Submodules

This monorepo uses Git submodules for external repositories that stay on their own release cycle.

| Path      | Remote                          | Branch |
|-----------|----------------------------------|--------|
| `sub/hls` | https://github.com/mtngtools/hls | main   |

## Cloning with submodules

```bash
git clone --recurse-submodules <mtng-mono-repo-url>
# or, after a plain clone:
git submodule update --init --recursive
```

## Updating a submodule

```bash
cd sub/hls
git fetch origin
git checkout main
git pull origin main
cd ../..
git add sub/hls
git commit -m "chore: update hls submodule"
```

## HLS as a workspace member

The HLS packages (`sub/hls/packages/*`) are included in this repo's pnpm workspace so they share the root lockfile and Turbo pipeline. For that to work, **the hls repo must not define its own workspace or lockfile** when used as a submodule:

- In the **hls** repo (or in `sub/hls` after cloning): remove `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- Keep `sub/hls/package.json` (root scripts) if you want to run commands from inside `sub/hls`; the mono root's `pnpm install` and Turbo will treat only `sub/hls/packages/*` as workspace packages.

After that, from mtng-mono root, `pnpm install` installs deps for all packages (including hls), and `pnpm run build` / `pnpm run test` etc. run across the hls packages too.

## Adding a new submodule

Document the path, remote, and branch here, then run:

```bash
git submodule add -b <branch> <remote-url> <path>
```
