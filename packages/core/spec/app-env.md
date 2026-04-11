# Application environment (`app-env`)

Source: [`../src/app-env.ts`](../src/app-env.ts).

## Purpose

The application environment model is **central to mtngTOOLS**: it is the shared vocabulary for **naming** and **orchestrating** applications and cloud resources across the whole lifecycle—**local development**, **pre-production** (QA, review, staging-like environments), and **production**.

`FullEnv` and `StorageEnv` are **inputs** to pure **naming functions** (elsewhere in `core`, FRAME, or deploy packages) that produce:

- DNS hostnames and URL paths  
- S3 bucket names, key prefixes, or parameter paths  
- Other stable resource identifiers derived from the same dimensions  

Keeping dimensions explicit and typed avoids ad hoc string concatenation and keeps **compose apps**, **deployment recipes**, and **runtime config** aligned.

## Operational environment (`opEnv`)

**Operation environment** describes *where* in the delivery lifecycle a deployment runs. Canonical string constants:

| Constant | Typical use |
| :--- | :--- |
| `OP_ENV_DEV` (`dev`) | Local or shared dev; fast iteration. |
| `OP_ENV_QA` (`qa`) | Automated test environments, integration QA. |
| `OP_ENV_REVIEW` (`review`) | Human review, UAT, stakeholder demos. |
| `OP_ENV_PROD` (`prod`) | Customer-facing production. |

The type also allows **`string`** so additional labels (e.g. per-branch sandboxes) remain representable without changing `core` for every new label.

`genOpEnvHelpers` and the spread from `resolveEnv` expose predicates such as `isDev`, `isProd`, `isNotProd` for branching in naming or feature flags.

## Organization (`orgDir`)

**`orgDir`** is a stable, org-scoped segment (e.g. tenant or customer key) used in **global** names: buckets, domains, or parameter namespaces. It is intentionally **not** the same as a meeting id; many resources are org-wide.

## Solution domain (`solutionDomain`)

Aligns with product **solution domains** in the platform overview (Watch, Produce, Interact, etc.). Constants:

- `SOLUTION_DOMAIN_DEFAULT`, `SOLUTION_DOMAIN_WATCH`, `SOLUTION_DOMAIN_PRODUCE`, `SOLUTION_DOMAIN_INTERACT`

`default` means “unspecialized” or “single combined surface” until a product line needs a distinct slice.

## Application role (`applRole`) and variant (`applVariant`)

- **`applRole`** identifies the **audience or surface** of the deployed app: attend, admin, public, integ, or `default` when the deployment is not split along those lines.  
- **`applVariant`** distinguishes multiple deployments of the **same role** within a solution domain (e.g. primary vs alternate line-of-business). `APPL_VARIANT_PRIMARY` is the default when omitted.

Together with `solutionDomain`, these pick **which** application instance a name belongs to.

## Base, full, and resolved environment

- **`BaseEnv`**: `orgDir`, `opEnv`, optional `uniqueSuffix` (disambiguate colliding stacks in the same org/op pair).  
- **`FullEnv`**: `BaseEnv` plus optional `solutionDomain`, `applRole`, `applVariant`. Partial inputs are allowed at the edge (config files, env).  
- **`resolveEnv`** fills defaults: `solutionDomain → default`, `applVariant → primary`, `applRole → default`, and returns **`envOnly`** (the normalized object) plus flags like `isSolutionDefault`, `isApplRoleDefault`, and op-env helpers.

**`ResolvedEnv`** is the type after resolution: `solutionDomain`, `applVariant`, and `applRole` are required.

## Storage environment (`StorageEnv`)

Some resources are **scoped by storage purpose** (static assets, durable state, uploads, streams, etc.). **`storageRole`** uses constants such as `STORAGE_APP_STATIC`, `STORAGE_STATE`, `STORAGE_DATA`, …, with `STORAGE_DEFAULT` when unspecified.

**`resolveStorageEnv`** builds on **`resolveEnv`**: it resolves base/full env first, then sets `storageRole` (default `STORAGE_DEFAULT`) and exposes **`envOnly`** including `storageRole` for naming.

Use **`StorageEnv`** when generating **bucket names**, **prefixes**, or **lifecycle rules** that differ by role; use **`FullEnv`** alone when storage role is irrelevant.

## Naming functions (contract)

Naming should be **deterministic** and **pure**: given a `ResolvedEnv` or `ResolvedStorageEnv`, functions return strings (hostnames, bucket segments, ARNs fragments, etc.). Recommended practices:

1. **Single pipeline**: read resolved `envOnly` (and any meeting-scoped ids from other types) in one place per resource family.  
2. **No hidden globals**: pass env explicitly into builders used by Nuxt, Nitro, CDK, and tests.  
3. **Stable ordering**: document segment order in each naming module (e.g. `orgDir` before `opEnv` before role).

Concrete implementations live outside this file (e.g. `deploy-*` packages, FRAME helpers); **`app-env`** only defines the **dimensions** and **resolution** rules.

## Lifecycle: development → pre-production → production

The same **shape** of env applies everywhere; only **`opEnv`** (and sometimes `orgDir` or `uniqueSuffix`) typically changes between stages:

| Stage | Typical `opEnv` | Typical naming effect |
| :--- | :--- | :--- |
| Development | `dev` | Non-prod hostnames, isolated buckets or prefixes. |
| QA / automation | `qa` | Repeatable integration targets. |
| Review / UAT | `review` | Stakeholder-facing but not prod SLAs. |
| Production | `prod` | End-user-facing DNS and durable resources. |

Pre-production environments reuse **production-like** `solutionDomain` / `applRole` / `applVariant` values so recipes and tests prove the same naming paths before `prod`.

## Recipes vs deployment-time variables

**Deployment recipes** (see repo [spec/deploy](../../../spec/deploy/naming-and-orchestration.md)) and **application recipes** can **fix** the dimensions that define *what* is being deployed:

- `solutionDomain`, `applRole`, `applVariant`, and often `storageRole` can be **hardcoded** in source for a given reference app or CDK stack.  
- **`orgDir`** and **`opEnv`** (and optionally **`uniqueSuffix`**) should usually come from **CI/CD or runtime environment variables** at deploy time, so the **same artifact** promotes across stages by changing only those values.

That split gives:

- **Stable identity** of the app *kind* (attend vs admin, watch vs default).  
- **Flexible placement** per org and stage without forked codebases.

Example (illustrative):

```ts
// Hardcoded in a compose or deploy recipe for "attend / watch / primary"
const partial: FullEnv = {
  orgDir: process.env.MTNG_ORG_DIR!,       // from deploy
  opEnv: process.env.MTNG_OP_ENV!,        // dev | qa | review | prod
  solutionDomain: SOLUTION_DOMAIN_WATCH,
  applRole: ROLE_NAME_ATTEND,
  applVariant: APPL_VARIANT_PRIMARY,
};

const env = resolveEnv(partial);
// pass `env` / `env.envOnly` into naming helpers for domains and buckets
```

## Related documentation

- [GLOSSARY.md](../../../GLOSSARY.md) — short definitions for `orgDir`, `opEnv`, roles (cross-check with this spec; **`app-env` types are authoritative** for constants).  
- [spec/deploy](../../../spec/deploy/) — deployment package naming and suites.  
- [README.md](../../../README.md) — solution domains and product surfaces (conceptual alignment with `solutionDomain`).

## Change process

Updates to constants or defaults in `app-env.ts` affect naming across the monorepo. Prefer **additive** constants and **backward-compatible** defaults; document breaking changes in package changelog or migration notes when renames are unavoidable.
