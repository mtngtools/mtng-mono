# Environment variables and Varlock (mtng-mono)

This is the **repo-level** convention for loading and validating configuration with **[Varlock](https://varlock.dev/)** across **mtng-mono** packages. Read this before adding package-local **`.env.schema`** files or new shared variables.

**Requirements index:** [spec/env/README.md](./README.md) — how this doc relates to the **`env/`** fragment folder.

## Goals

- **Single aggregate** at the **mtng-mono repository root**: one **`.env.schema`** that **`@import`s** scoped schemas from **`env/<scope>/.env.schema`** (e.g. **`./env/base/.env.schema`**, **`./env/aws/.env.schema`**). Paths must be **relative** with a **`./` or `../` prefix** so Varlock resolves them. Add new scopes as **`env/<provider>/.env.schema`** + **`env/<provider>/.env.example`** instead of growing unrelated files at repo root.
- **Fragment examples** live next to each fragment under **`env/`** — not a large monolithic **`.env.example`** at root. Root **`.env.example`** only points operators at **`env/*.env.example`**.
- **Compose** package-specific requirements (e.g. **`MOCK_DATA_*`** on a deploy recipe) in that package’s **`.env.schema`** by **importing** the **root aggregate** (which already includes **`base`** + **`aws`**), without duplicating shared keys.
- Keep **Varlock** as the single mechanism for schema + merge rules; application code continues to read **`process.env`** after **`import "varlock/auto-load"`** (or runs under **`varlock run`**).

## Repo root files (mtng-mono/)

| File | Role |
| :--- | :--- |
| **[`.env.schema`](../../.env.schema)** | **Only** aggregate: header decorators, **`@import(./env/base/.env.schema)`**, **`@import(./env/aws/.env.schema)`**, **`---`**. No duplicate keys here. |
| **[`.env.example`](../../.env.example)** | Pointer only: merge lines from **`env/<scope>/.env.example`** into gitignored **`.env`**. |
| **`env/`** | Scoped fragments: **`env/base/`** (**`MTNG_*`**), **`env/aws/`** (**`AWS_*`**). See [spec/env/README.md](./README.md). |
| **`.env`** | Local values (gitignored). One file at root merging fragment examples + overrides. |

## Package-level composition

Packages that need shared keys plus their own:

1. **Import** the **root aggregate** with **`@import()`** in the **header** of the package **`.env.schema`**. The path is **relative to that schema file** (not to `cwd`). Example from **`deploy/recipes/deploy-recipe-mock-data-1/.env.schema`**:

   ```text
   # @defaultRequired=true
   # @defaultSensitive=false
   # Import shared repo aggregate (base + aws + future env/* scopes). Path → mtng-mono root.
   # @import(../../../.env.schema)
   # ---
   MOCK_DATA_S3_BUCKET_NAME=
   MOCK_DATA_S3_BUCKET_KEY_PREFIX=
   ```

   **Header rules (Varlock):** Root decorators for the **importing** file must live in the **header** (comment block **before** the first **`---`** and first config item). **`@import`** belongs in that same header. Do **not** put **`@defaultRequired`** / **`@defaultSensitive`** on lines **between** **`---`** and package keys only — Varlock treats those as invalid on items. Package-specific items follow **`---`**.

2. Set **`package.json` → `"varlock": { "loadPath": ["../../../", "."] }`** (adjust **`../../../`** to the **mtng-mono root** from that package directory) so Varlock loads **both**:
   - **Root** **`.env`** (shared keys from **`env/`** aggregate), and  
   - **Package** **`.env`** (package-only keys like **`MOCK_DATA_*`**).

   Order matters: **later** paths in **`loadPath`** win on conflicts; keep **`.`** last so package values override root when the same key appears in both (discouraged—use distinct key prefixes per concern).

3. Run **`pnpm exec varlock load`** from the **package directory** (or **`pnpm run env:check`** when that script delegates to `varlock load`) to validate before **`deploy`**.

## pnpm and working directory

**`pnpm run`** scripts for a package **run with `cwd` = that package’s directory** (e.g. `deploy/recipes/deploy-recipe-mock-data-1/`), including when invoked from the monorepo root with **`pnpm --filter @mtngtools/… run …`**. Varlock’s **`package.json` → `varlock`** block is read **from the current working directory** (the package directory), so **`loadPath`** segments like **`../../../`** resolve to **mtng-mono** root from that package.

## Entry script order (TypeScript)

When using **`import "varlock/auto-load"`** as the **first** statement in an entry file (e.g. **`src/deploy.ts`**):

1. Varlock runs (CLI + merge into **`process.env`**).
2. The rest of the module loads; **`loadDeployConfig()`** (or equivalent) reads **`process.env`** after validation.

Do not read **`MOCK_DATA_*`** or **`AWS_*`** before **`auto-load`** if those values come only from Varlock-resolved files.

## Precedence (mental model)

- **Schema:** Root aggregate + package items are merged; **`env/`** fragments are pulled in only via the root **`.env.schema`** imports.
- **Values:** With **`loadPath`**, Varlock discovers **`.env`** files under each listed path; **package** **`.env`** typically supplies recipe-specific keys, **root** **`.env`** supplies shared keys so operators merge fragment examples **once**.

## Related

- [spec/env/README.md](./README.md) — **`env/`** directory vs **`spec/env`** (this doc).
- [Varlock — imports](https://varlock.dev/guides/import/)
- [Varlock — CLI](https://varlock.dev/reference/cli-commands/) (`varlock load`, `varlock run`)
- [JavaScript `varlock/auto-load`](https://varlock.dev/integrations/javascript/) (Node ≥ 22)
- Deploy recipe example: [`deploy/recipes/deploy-recipe-mock-data-1/README.md`](../../deploy/recipes/deploy-recipe-mock-data-1/README.md)
