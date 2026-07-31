# AGENTS_REPO.md

## Organization rules & skills

Follow [`AGENTS_ORGANIZATION.md`](https://github.com/mtngtools/agents/blob/main/AGENTS_ORGANIZATION.md) in [mtngtools/agents](https://github.com/mtngtools/agents).

- **Rules:** See [`rules/INDEX.md`](https://github.com/mtngtools/agents/blob/main/rules/INDEX.md) — auto-loaded (communication, tool-calling) vs. load-when-needed (git-and-github, agent-behavior)
- **Skills:** See [`skills/INDEX.md`](https://github.com/mtngtools/agents/blob/main/skills/INDEX.md) — all human-initiated (git workflow, Vue component building, content refinement)

Reference rules/skills by name (e.g., `/git-and-github`, `/commit-with-issue`). If not installed, pull from `mtngtools/agents`.

If agents repo not in context, pull from GitHub or ask user.

## Engineering skills infrastructure

Skills use:
- **Issue tracker:** GitHub Issues (conventions in `docs/agents/issue-tracker.md`)
- **Triage labels:** `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`
- **Domain docs:** `CONTEXT.md` + `spec/` folders + `spec/adr/` (see `docs/agents/domain.md`)

## Repo structure

- Multi-package monorepo: packages under `packages/*`, submodules under `sub/*`
- Look for `AGENTS.md` in each package for package-specific guidance
- HLS submodule: `sub/hls` (not a workspace package)
- TypeScript stack: see [`AGENTS_STACK_TYPESCRIPT`](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/README.md)
