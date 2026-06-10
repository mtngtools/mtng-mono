# `deploy-recipe-mock-data-1`

**Deployment recipe** that publishes **deterministic mock meeting JSON** from [`@mtngtools/develop-mock-data`](../../../packages/develop-mock-data/README.md) to **Amazon S3**, one **folder per named example recipe** in the mock-data package.

This README is the **canonical spec** for this recipe; it lives next to the package implementation (`package.json`, sources, and tests). [Implementation notes](#implementation-notes) describe how the package should be structured.

**Indexed from** [spec/deploy/README.md](../../../spec/deploy/README.md) (repo-wide deploy documentation).

## Role

| Item | Value |
| :--- | :--- |
| **Package name** | `@mtngtools/deploy-recipe-mock-data-1` |
| **Repo path** | `deploy/recipes/deploy-recipe-mock-data-1/` |
| **Consumes** | `@mtngtools/develop-mock-data` (recipes + materialization); `@mtngtools/provide-aws` (**`putStringToS3`**) for S3 uploads |
| **Does not** | Define new mock recipes; it **reuses** the catalog exposed by the library (`namedRecipes` / `listNamedRecipeIds()`). |

## Configuration (environment)

**Repo convention:** [spec/env/README.md](../../../spec/env/README.md) — Varlock strategy (target **`@mtngtools/env-*`** + **`workspace:*`**); **today** this recipe still **`@import`s** the **root aggregate** **`.env.schema`** and adds **`MOCK_DATA_*`** only. Set **`AWS_REGION`** (and optional **`AWS_*`**) in the repo root **`.env`** from **`env/<scope>/.env.example`** lines where applicable.

### Required (this package)

| Variable | Purpose |
| :--- | :--- |
| **`MOCK_DATA_S3_BUCKET_NAME`** | S3 bucket to write into. |
| **`MOCK_DATA_S3_BUCKET_KEY_PREFIX`** | Prefix for object keys (logical “folder” under the bucket). Trailing slash optional; implementation should normalize so keys are well-formed. |

Put these in **this directory’s** **`.env`** (gitignored) or alongside root vars in a single workflow—**`varlock.loadPath`** loads **mtng-mono root** **`.env`** first, then **this package’s** **`.env`**. See **[`.env.example`](./.env.example)** for this package.

### Optional shared **`AWS_*`** (repo root)

Declared in **[mtng-mono `/.env.schema`](../../../.env.schema)** (which imports **[`env/aws/.env.schema`](../../../env/aws/.env.schema)** and **[`env/base/.env.schema`](../../../env/base/.env.schema)**) and summarized in **[spec/env/README.md](../../../spec/env/README.md)**. **`@mtngtools/provide-aws`** depends on **`@aws-sdk/client-s3`** as a normal **Node** dependency (not bundled into **`dist`**) so the SDK’s **default credential chain** matches the **`aws` CLI** (`~/.aws`, SSO, profiles, **`AWS_*`** env vars). The deploy script still sets **`region`** from **`process.env.AWS_REGION`** / **`AWS_DEFAULT_REGION`** when present so behavior matches Varlock. Set **`AWS_REGION`** in the **root** **`.env`** for local runs. Do **not** commit secrets.

**Varlock:** **`import "varlock/auto-load"`** in **`src/deploy.ts`** (requires **Node ≥ 22**). Validate with **`pnpm run env:check`**. **`process.env`** after load is what **`loadDeployConfig`** and the AWS SDK read.

## Behavior

1. **Resolve the recipe catalog** from `@mtngtools/develop-mock-data` (e.g. `listNamedRecipeIds()` and `getNamedRecipe(id)` as today).
2. **For each** named recipe id:
   - **Materialize** mock meeting data with `createMockMeetingFromRecipe(recipe)` (same as library consumers and tests).
   - **Upload** JSON object(s) with **`putStringToS3`** from `@mtngtools/provide-aws` ([implementation](../../../packages/provide-aws/src/s3.ts)). Pass `Bucket`, `Key`, and **`Body`** as the UTF-8 JSON string for each object; use the env-derived bucket and keys under:

   `s3://{bucket}/{prefix}/{recipeId}/…`

   where `{recipeId}` is the catalog key (e.g. `1-day__1-room__recipeA__dayPlans`). Treat the provider’s result type (`returnResult` / `returnError` from `@mtngtools/core`) as **failure** if `putStringToS3` does not succeed.

3. **Object layout:**

   | Object key (suffix) | Contents |
   | :--- | :--- |
   | **`mock-meeting.json`** | JSON serialization of **`MockMeetingData`** returned by `createMockMeetingFromRecipe`. |
   | **`recipe.json`** | JSON serialization of the **`RecipeConfig`** used for that run (the resolved recipe object). |

   Exact pretty-printing vs compact JSON is an implementation detail; stable, deterministic output is preferred for diffs and caching.

4. **Idempotency:** Re-running the recipe overwrites objects at the same keys for the same inputs (same library version and catalog). Document any cache-busting or versioning strategy if added later.

5. **Failure handling:** If any upload fails, behavior (fail-fast vs best-effort) should be explicit in the implementation; default recommendation is **fail-fast** so operators do not assume a partial catalog is complete.

6. **Dry run:** When **`--dry-run`** is passed to the entry script, the recipe **must not** call **`putStringToS3`** or otherwise invoke the **S3 API**. It **should** still resolve the catalog, materialize each recipe (same as a real deploy), and print an **overview**: **`AWS_REGION`** from **`process.env`** (or an explicit unset placeholder), target bucket, normalized key prefix, recipe count, each **`s3://{bucket}/{prefix}/{recipeId}/…`** object URL for **`mock-meeting.json`** and **`recipe.json`**, UTF-8 **body sizes** for each would-be upload, and a short **total** object count / byte sum. Env vars (**`MOCK_DATA_*`**) are still required so the overview matches what a real run would use.

## Operator entrypoint

The recipe package should expose a **`deploy`** script (per [naming-and-orchestration.md](../../../spec/deploy/naming-and-orchestration.md)) that runs the publish step after env is set, e.g. from the monorepo root:

```bash
pnpm --filter @mtngtools/deploy-recipe-mock-data-1 run deploy
```

**Dry run (no S3 writes):**

```bash
pnpm --filter @mtngtools/deploy-recipe-mock-data-1 run deploy:dryrun
```

Equivalent: **`pnpm exec tsx src/deploy.ts --dry-run`** from this package directory.

## Dependencies

| Dependency | Notes |
| :--- | :--- |
| `@mtngtools/develop-mock-data` | `workspace:*` — recipes and materialization API (`listNamedRecipeIds`, `getNamedRecipe`, `createMockMeetingFromRecipe`). |
| `@mtngtools/provide-aws` | `workspace:*` — **`putStringToS3`** (`MTPutObjectCommandInput`); brings `@aws-sdk/client-s3` and **`@mtngtools/core`** (result shapes) transitively. |
| `varlock` | Loads and validates env from **`.env.schema`** + **`.env`** via **`varlock/auto-load`** in **`src/deploy.ts`**. |

**Before `deploy`:** Build workspace libs **`@mtngtools/develop-mock-data`** and **`@mtngtools/provide-aws`** (they publish **`dist/`**), e.g. `pnpm --filter @mtngtools/develop-mock-data --filter @mtngtools/provide-aws run build`. This package runs **`tsx src/deploy.ts`** (no local `tsc` emit).

Dev-only: **TypeScript**, **tsx**, **Vitest** (unit tests for helpers). **Runtime:** **Node ≥ 22** (required by Varlock’s JS integration).

## Implementation notes

- **Entrypoint:** The publish pipeline lives in **`src/deploy.ts`**; **`pnpm run deploy`** runs **`tsx src/deploy.ts`**; **`pnpm run deploy:dryrun`** runs **`tsx src/deploy.ts --dry-run`** (no separate compile step for this package). **`scripts.env:check`** runs **`varlock load`** (validate env from this package directory).
- **Varlock:** **`import "varlock/auto-load"`** must be the **first** import side effect so **`process.env`** is populated before **`loadDeployConfig()`**. **`package.json` → `varlock.loadPath`** is **`["../../../", "."]`** (legacy; target **`["."]`** + **`@mtngtools/env-*`** — [spec/env/README.md](../../../spec/env/README.md)).
- **Dry run:** Branch on **`process.argv.includes("--dry-run")`** in **`loadDeployConfig()`**. In dry-run mode, **skip** **`putStringToS3`** entirely; **do** materialize JSON locally. Shared helper **`putOrLogDryRun`** prints either **Would upload** or performs **`putStringToS3`** then **Uploaded** with the same URI/size line shape. **`logBucketAndKey`** is **`false`** on **`putStringToS3`** because the script logs URIs itself.
- **Config:** **`loadDeployConfig()`** reads **`MOCK_DATA_*`** only (not **`AWS_*`**—those are only for the SDK and logging). **Validate** both **`MOCK_DATA_*`** are non-empty after trim; **reject** prefix that is empty after **`normalizeKeyPrefix`**; **exit 1** on validation failure.
- **Object keys:** **`{normalizedPrefix}/{recipeId}/{filename}`** via **`normalizeKeyPrefix`** in **`prefix.ts`** (trim slashes, collapse **`//`**). Filenames: **`mock-meeting.json`**, **`recipe.json`**.
- **PutObject:** **`putStringToS3`** with **`ContentType`: `application/json`**; body is **`JSON.stringify(..., null, 2)`** plus a trailing newline.
- **Failure handling:** **Fail-fast** on **`putStringToS3`** **`.error`**; log **`recipeId`** context and **key**, **exit 1**.
- **Iteration order:** **`localeCompare`** on **`listNamedRecipeIds()`** for stable ordering.
- **JSON bytes:** **`JSON.stringify`** with two-space indent; UTF-8 sizes via **`TextEncoder`** for logging and totals.
- **Logging:** Same **inventory** header on every run (**dry run** first line clarifies no S3 uploads): **`AWS region:`** from **`process.env.AWS_REGION`** or **`(unset — SDK default chain)`**, bucket, key prefix, recipe count; then per **`recipeId`** two lines; footer **Would upload** or **Uploaded** totals. **No** **`--verbose`** flag.

## Testing (planned expansion)

**Unit tests (additional):** Grow coverage beyond **`normalizeKeyPrefix`** — e.g. **config** / env validation and failure paths, **object key** construction (`{prefix}/{recipeId}/{file}`), **`putStringToS3` mocked or injected** (two uploads per `recipeId`, correct `Bucket`/`Key`/`ContentType`, **fail-fast** after first simulated failure), and **missing-env** → non-zero exit without calling S3.

**End-to-end tests:** Add **e2e** runs that execute the full **`deploy`** pipeline against **real or emulated S3** — for example **LocalStack**, **MinIO**, or a **dedicated test bucket** in AWS with narrow IAM — and assert objects exist at expected keys, **`mock-meeting.json`** / **`recipe.json`** parse as JSON, and catalog coverage matches **`listNamedRecipeIds()`**.

## Related documentation

- [Environment / Varlock](../../../spec/env/README.md) — **`@mtngtools/env-*`**, **`loadPath`**, **`@import`** rules.
- [develop-mock-data specifications](../../../packages/develop-mock-data/spec/README.md) — recipe model and contracts.
- [`provide-aws` S3 helpers](../../../packages/provide-aws/src/s3.ts) — `putStringToS3` and types.
- [Varlock — JavaScript / Node.js](https://varlock.dev/integrations/javascript/) — `auto-load`, CLI (`varlock load`, `varlock run`).
- [Deployment naming and orchestration](../../../spec/deploy/naming-and-orchestration.md) — `deploy-recipe-*` role and pnpm conventions.
