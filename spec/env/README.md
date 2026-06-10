# Environment (`spec/env`)

**[Varlock](https://varlock.dev/)** + **`@mtngtools/core`** **`FullEnv`**. **`spec/`** is contributor docs only—published **`@mtngtools/*`** **`README`** + **`exports`** are what downstream apps use.

---

## NPM vs monorepo

| Audience | Use |
| :--- | :--- |
| Consumers | **`@mtngtools/core`** (**`FullEnv`**, **`resolveEnv`**); **`@mtngtools/env-*`** for **`.env.schema`** / **`.env.example`**. **`dependencies`** / **`workspace:*`** — never **`spec/`** or **`file:`** into **`mtng-mono`**. |
| Contributors | This file + **`packages/*/spec`**; recipes live under **`deploy/recipes/`**. |

---

## Varlock strategy

1. **Schemas ship in packages** — e.g. **`@mtngtools/env-base`**, **`@mtngtools/env-aws`** (illustrative). **`package.json` → `files`** includes **`.env.schema`** + **`.env.example`**.
2. **`workspace:*` (monorepo)** — Recipes/libraries declare **`"@mtngtools/env-base": "workspace:*"`** so **`pnpm install`** matches **`npm`** **`node_modules`** layout for **`@mtngtools/*`**.
3. **Forbidden** in hand-maintained **`.env.schema`** / Varlock config: **`@import(../../../.env.schema)`**, **`@import`** into repo **`env/`**, **`loadPath`** walking **`../`** to mtng-mono root **`.env`**. **Exception:** repo **automation only** (`require.resolve`, **`fs`**, release flatten scripts)—not normal **`varlock load`**.
4. **`loadPath`** — default **`["."]`** only: **`.env`** beside that package’s **`.env.schema`** (run **`pnpm exec varlock load`** from **recipe `cwd`**; **`pnpm --filter`** keeps **`cwd`** on the package).

**Compose schemas:**

- **Default (expected implementation)** — **CI/automation** resolves **`@mtngtools/env-*`** schema files (e.g. **`require.resolve`**) and **writes one flattened `.env.schema`** next to the recipe (and publishes it). **No `@import`** of **`./node_modules/...`**. Same tarball works in monorepo and **`npm`** installs; avoids **`pnpm`** hoisting issues.

- **Alternative (only when Default is impractical)** — **`@import(./node_modules/@mtngtools/env-base/.env.schema)`** **only when Default is impractical** (e.g. no flatten step in place yet, short-lived local experimentation). **`@import`** lines stay in the Varlock **`header`** (before **`---`**); recipe-only keys follow **`---`**. Do **not** rely on this for published **`deploy-recipe-*`** packages—use **Default**.

```json
{
  "dependencies": {
    "@mtngtools/env-base": "workspace:*",
    "@mtngtools/env-aws": "workspace:*",
    "@mtngtools/core": "workspace:*"
  },
  "varlock": { "loadPath": ["."] }
}
```

**TS entry:** **`import "varlock/auto-load"`** first; then **`process.env`** + **`resolveEnv`** from **`@mtngtools/core`**.

**Avoid:** **`../../../`** schema/import, **`loadPath: ["../../../", "."]`**, Varlock **`@import`** sources rooted at hand-maintained **`env/`** — migrate to **`@mtngtools/env-*`** (root **`env/`** only via automation mirrors).

---

## Illustrative layout

```
packages/env-base/          ← .env.schema, .env.example, package.json (files field)
deploy/recipes/my-recipe/    ← depends workspace:* on env-*; flattened .env.schema (Default); .env gitignored
```

Third-party: same **`dependencies`** with semver instead of **`workspace:*`**; recipe **`README`** explains **`deploy/`** folder + **`loadPath: ["."]`**.

---

## Legacy **`env/`** at repo root

**`env/base`**, **`env/aws`**, root **`.env.schema`** may remain **during migration** or as **generated** output only—not Varlock **`@import`** targets from recipes long-term.

---

## Roadmap

Typed loaders (**`@mtngtools/*`**) map validated env → **`FullEnv`**; **`deploy-aws-cdk-builder`** / **defaults** use **`workspace:*`**/semver only.

**Backlog:** **`MTNG_*` → `FullEnv`** tables on **`core`** / **`env-*`** **`README`**; secrets prefix-only in schema ([CDK secrets](../deploy/builder/cdk/secrets/README.md)); **`varlock load`** in CI; [CDK env backlog](../deploy/builder/cdk/env-and-varlock.md).

---

## Links

- [Varlock imports](https://varlock.dev/guides/import/) · [CLI](https://varlock.dev/reference/cli-commands/)
- [`app-env`](../../packages/core/spec/app-env.md)
- [Deploy README](../deploy/README.md) · [CDK builder env](../deploy/builder/cdk/README.md#environment-and-naming-contract)
