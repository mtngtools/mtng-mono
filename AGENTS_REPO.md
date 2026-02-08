# AGENTS_REPO.md

Follow organization-level rules in `AGENTS_ORGANIZATION.md` found in [mtngtools/agents](https://github.com/mtngtools/agents). If this repository has not been provided in context, agent must either 1) pull directly from GitHub or 2) prompt user to provide context.

- This is a **multi-package** monorepo. Packages live under `packages/*`; Git submodules live under `sub/*` (see [SUBMODULES.md](./SUBMODULES.md)).
- Look for `AGENTS.md` in each package for package-specific guidance.
- **HLS** is included as a Git submodule at `sub/hls` ([mtngtools/hls](https://github.com/mtngtools/hls)); it is not a workspace package.
- Technology stack: TypeScript. Consult [`stacks/AGENTS_STACK_TYPESCRIPT/README.md`](https://github.com/mtngtools/agents/blob/main/stacks/AGENTS_STACK_TYPESCRIPT/README.md) in the agents repo for tooling and verification steps.
