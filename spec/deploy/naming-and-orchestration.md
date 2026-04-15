# Deployment naming and orchestration

This document records **repo-level** choices for mtngTOOLS **DEPLOY** packages: what we call things, how **suites** relate to **recipes**, and how to wire **pnpm** so slices deploy independently or as a group.

## Repository layout

Physical paths in **mtng-mono** (package **names** stay `@mtngtools/deploy-…`; paths are separate):

| Kind | Prefix | Directory |
| :--- | :--- | :--- |
| Libraries | **`deploy-*`** | **`packages/`** (e.g. `packages/deploy-aws-cdk/`) |
| Recipes | **`deploy-recipe-*`** | **`deploy/recipes/`** (e.g. `deploy/recipes/deploy-recipe-aws-nuxt-ref-1a-attend/`) |
| Suites | **`deploy-suite-*`** | **`deploy/suites/`** (e.g. `deploy/suites/deploy-suite-aws-nuxt-ref-1a/`) |

**`COMPOSE`** apps stay under **`apps/`**; **`deploy/recipes`** and **`deploy/suites`** hold only deploy orchestration packages, not application source trees.

## Three package kinds

| Prefix | Role |
| :--- | :--- |
| **`deploy-*`** | Reusable deployment **libraries** (e.g. TypeScript CDK constructs, shared L2/L3 patterns). Import from recipes; not a full “deploy this product” entrypoint by itself. |
| **`deploy-recipe-*`** | **Deployment recipe**—one **slice** of infrastructure: either **shared** resources used by several apps, or **one app surface** (attend, admin, integ). Owns CDK app/stack boundaries for that slice. |
| **`deploy-suite-*`** | **Deployment suite**—**orchestrates** multiple `deploy-recipe-*` packages. Usually **scripts + workspace deps + docs**; may optionally host a thin CDK entry that imports stacks from recipes. **No** slice suffix on the suite name. |

Suites exist so operators can run **one** entrypoint (`deploy:all`) while CI can still target **one recipe** (e.g. admin only) without redeploying attendee-facing stacks.

## Naming: suites vs recipes

- **`deploy-suite-<pattern>`** — umbrella for a family of recipes. Example: `deploy-suite-aws-nuxt-ref-1a` orchestrates the Nuxt ref `1a` recipes plus any shared recipes they depend on.
- **`deploy-recipe-<pattern>-<slice>`** — one slice. The **pattern** describes the **deployment stack** (cloud, runtime, major services), not a single COMPOSE package name. **`ref-1a`** (or similar) ties a batch of recipes to the same reference generation.

**Shared infrastructure** that is **not** specific to Nuxt (e.g. S3 buckets reused by Nuxt SSR, static sites, or other app types) should use a **recipe name that reflects that generality**, not the `aws-nuxt-ref-1a` prefix shared by the Nuxt app recipes.

## Reference recipe examples (initial set)

These names are **examples** for planning and documentation; packages may appear in the monorepo as they are implemented.

### Shared buckets (broader than Nuxt)

| Package | Purpose |
| :--- | :--- |
| **`deploy-recipe-aws-shared-bucket-only-ref-1a`** | Shared **bucket-oriented** infrastructure for reference **`1a`**. Intended for resources that **multiple app types** can use (not only Nuxt SSR). Nuxt attend/admin/integ recipes may **depend on** outputs from this recipe (SSM, ARNs, etc.) without implying that buckets are Nuxt-only. |

Use a **distinct** pattern segment (`aws-shared-bucket-only-…`) so the name does not promise “Nuxt” when the same buckets might serve other stacks.

### Nuxt app slices (common prefix)

These share the same **pattern prefix** so they group cleanly in the repo and in `pnpm --filter` globs:

| Package | Purpose |
| :--- | :--- |
| **`deploy-recipe-aws-nuxt-ref-1a-attend`** | App-dedicated (and any attend-only shared) resources for the attendee-facing Nuxt surface. |
| **`deploy-recipe-aws-nuxt-ref-1a-admin`** | Same for admin. |
| **`deploy-recipe-aws-nuxt-ref-1a-integ`** | Same for integration (APIs, webhooks, batch, etc.—whatever “integ” means for this ref). |

Together, **`deploy-recipe-aws-nuxt-ref-1a-*`** denotes “**AWS + Nuxt + ref 1a**” slices. They may all consume **`deploy-recipe-aws-shared-bucket-only-ref-1a`** without that shared recipe being renamed to `aws-nuxt-*`.

## Suite package: example

A suite **`deploy-suite-aws-nuxt-ref-1a`** (name aligns with the Nuxt ref batch; adjust if you prefer `deploy-suite-aws-ref-1a` to stress shared + Nuxt apps) would:

- Depend on the four recipe packages as **workspace** dependencies (optional but useful for tooling).
- Expose **pnpm scripts** that delegate to each recipe’s `deploy` script with a clear order (shared buckets before app stacks, unless your CDK design says otherwise).

## pnpm: workspace deps on the suite

In **`deploy/suites/deploy-suite-aws-nuxt-ref-1a/package.json`** (illustrative):

```json
{
  "name": "@mtngtools/deploy-suite-aws-nuxt-ref-1a",
  "private": true,
  "dependencies": {
    "@mtngtools/deploy-recipe-aws-shared-bucket-only-ref-1a": "workspace:*",
    "@mtngtools/deploy-recipe-aws-nuxt-ref-1a-attend": "workspace:*",
    "@mtngtools/deploy-recipe-aws-nuxt-ref-1a-admin": "workspace:*",
    "@mtngtools/deploy-recipe-aws-nuxt-ref-1a-integ": "workspace:*"
  }
}
```

## pnpm: scripts on the suite

Each **recipe** package should own the real **`cdk deploy …`** (or wrapper) in its own **`scripts.deploy`**. The **suite** forwards with **`pnpm --filter`** so operators run one place from the monorepo root.

Example **`scripts`** on the suite:

```json
{
  "scripts": {
    "deploy:shared-buckets": "pnpm --filter @mtngtools/deploy-recipe-aws-shared-bucket-only-ref-1a run deploy",
    "deploy:attend": "pnpm --filter @mtngtools/deploy-recipe-aws-nuxt-ref-1a-attend run deploy",
    "deploy:admin": "pnpm --filter @mtngtools/deploy-recipe-aws-nuxt-ref-1a-admin run deploy",
    "deploy:integ": "pnpm --filter @mtngtools/deploy-recipe-aws-nuxt-ref-1a-integ run deploy",
    "deploy:apps": "pnpm run deploy:attend && pnpm run deploy:admin && pnpm run deploy:integ",
    "deploy:all": "pnpm run deploy:shared-buckets && pnpm run deploy:apps"
  }
}
```

Adjust **order** (`deploy:apps` parallel vs sequential) based on CloudFormation constraints and whether apps depend on each other.

**From the repository root** (after workspace names match):

```bash
pnpm --filter @mtngtools/deploy-suite-aws-nuxt-ref-1a run deploy:all
pnpm --filter @mtngtools/deploy-suite-aws-nuxt-ref-1a run deploy:admin
```

## Independent deploys

- **Suite scripts** are convenience; **filtering a single recipe** remains the way to ship **one** surface (e.g. admin) without running the full suite.
- **Shared** recipe changes remain **higher blast radius**; document them as platform changes even when app recipes stay untouched.

## Related docs

- [README.md](../../README.md) — **Code Organization**, DEPLOY layer.
- [package-directory.md](../../package-directory.md) — DEPLOY tables and links here.
