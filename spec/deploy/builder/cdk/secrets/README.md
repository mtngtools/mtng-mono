# Secrets: SSM Parameter Store

Normative conventions for **application secrets** consumed by standard **app** stacks (for example, SSR Lambdas in [`LambdaAndS3BackedDistribution`](../recipes/lambda-and-s3-backed-distribution/README.md)). Aligns with [`FullEnv`](../../../../packages/core/spec/app-env.md) dimensions (`orgDir`, `opEnv`, `solutionDomain`, `applRole`, …) for path hierarchy; exact path templates live in **`deploy-aws-cdk-defaults`** naming helpers—not duplicated here.

## Storage

Default implementation assumes: 

- **Service**: AWS Systems Manager **Parameter Store**.
- **Secret parameters**: Values are stored as **SecureString** parameters (not plain `String`), unless a recipe explicitly documents a non-secret parameter under the same prefix tree.
- **Authoritative paths**: Human operators and automation **create and rotate** parameter values **outside** the CDK app (console, CLI, separate admin tooling). CDK grants IAM and passes **prefix** metadata so runtime code can read (and, where allowed, write) the correct subtree—it does **not** embed secret values in templates.

## Prefix contract

- **Single prefix per app slice**: All secrets an app stack needs MUST live under one **parameter path prefix** for that deployment (for example everything for “watch / attend” for a given **`orgDir`** and **`opEnv`** under one subtree). Nested keys under that prefix are application-defined (`…/database/url`, `…/api/client-secret`, etc.).
- **`orgDir` before `opEnv` in the path**: Resolved prefixes SHOULD place **`orgDir` at the outermost path segment** (after any global root convention), then **`opEnv`**, then surface-specific segments (`solutionDomain`, `applRole`, …). Example shape (illustrative only): **`/${orgDir}/${opEnv}/watch/attend/…`** — not **`/${opEnv}/${orgDir}/…`**.

  **Why**: The same logical keys usually exist **once per operational environment** for a tenant. That implies **duplication** of secret trees across `opEnv` (`dev`, `qa`, team-specific **`test`**, `review`, `prod`, …). The builder does **not** copy secret values; promotion typically uses automation **outside** deploy recipes—CI/CD jobs, operators, or dedicated tooling whose IAM is **explicitly** scoped (often **`read-write`** on **`/${orgDir}/`** for **same-account**, non-prod promotion). Putting **`orgDir` highest** keeps each **`opEnv`** as a **sibling** under the same tenant (**`/${orgDir}/dev/…`**, **`/${orgDir}/qa/…`**, **`/${orgDir}/review/…`**, …) so that tooling can copy within one org **and account** without crossing **`orgDir`** boundaries. **Admin stacks** do **not** inherit org-wide **`/${orgDir}/`** write scope by default ([Admin vs app stacks](#admin-vs-app-stacks)).

- **`prod` vs non-prod AWS accounts**: **`prod`** Parameter Store secrets are **not** expected to live in the **same AWS account** as non-production `opEnv` secrets. Spanning **`opEnv`** boundaries—especially **anything involving `prod`**—therefore usually cannot rely on a single automated subtree copy under a shared org prefix; **human-in-the-loop** handling is likely (approvals, governed provisioning or rotation in the prod account, cross-account runbooks, or equivalent). The builder grants IAM only for each stack’s resolved prefix **in its deployment account**; it does **not** model cross-account secret migration.

- **External origin**: The **prefix string** is supplied by the **deploy-time environment** (or equivalent config loader)—for example CI/CD or shell exports consumed when synth/deploy runs—not hardcoded secret material. Illustrative env var name: `MTNG_SSM_SECRETS_PREFIX`. Recipes may read that variable and pass the value into builder options; the defaults package documents the canonical variable names it expects.
- **Normalization**: Builder or defaults MUST normalize prefix shape once (leading `/`, no accidental double slashes, trailing slash policy) so IAM ARNs and runtime `GetParametersByPath` agree. Exact normalization rules belong next to the IAM helper implementation.

## Lambda runtime visibility

- **Standard env var**: Default **`createFunctionProps`** (and any stack-level opt-in that applies to all Lambdas in an app stack) SHOULD inject a Lambda **environment** variable holding the **resolved prefix string**, so application code knows where to resolve secrets without hardcoding paths. Illustrative name: **`MTNG_SECRETS_PREFIX`**. Callers may override the env var name through documented optional inputs when a runtime framework already reserves a specific name.
- **No plaintext secrets in env**: Only the **prefix** (and optional non-secret identifiers) appear in Lambda environment tables. Actual secret values MUST NOT be passed through `addEnvironment` or `FunctionProps.environment`.

## IAM: prefix-scoped access

- **Read-only (standard app Lambdas)**: Grant least-privilege Parameter Store **read** APIs scoped **only** to parameters under that prefix (`GetParameter`, `GetParameters`, `GetParametersByPath` as appropriate). Narrow **resource** patterns to `arn:aws:ssm:${region}:${account}:parameter/<normalized-prefix>*` (exact ARN grammar alongside implementation).
- **SecureString and KMS**: SecureString parameters may require **`kms:Decrypt`** (and related) on the key backing those parameters when not using default AWS-only encryption; defaults MUST document which KMS grants are included for standard vs customer-managed keys.
- **Relationship**: Use [`grantSsmSecretsPrefixAccess`](../relationships/grant-ssm-secrets-prefix/README.md) so grants stay consistent across recipes.

## Admin vs app stacks

- **Typical app stacks** (attend, integration API, etc.): Each receives **read-only** IAM on a **narrow** prefix—for example scoped by **`/${orgDir}/${opEnv}/`** plus dimensions that identify that surface (`solutionDomain`, `applRole`, …). Illustrative layout (conceptual, not prescriptive path grammar):

  - Watch-facing attend app: read-only under **`/${orgDir}/${opEnv}/watch/…`** (or equivalent segment order produced by naming helpers).
  - Integration API app: read-only under **`/${orgDir}/${opEnv}/integ/…`** (or equivalent `applRole` segment).

- **Admin stacks**: Admin Lambdas that **write** Parameter Store values MUST receive **`grantSsmSecretsPrefixAccess`** with **`access: 'read-write'`** on a prefix chosen **explicitly** by the recipe—there is **no default** that widens IAM to all of **`/${orgDir}/`** across every **`opEnv`**.

  Allowed **`read-write`** scopes for admin writers are exactly these shapes (normalized the same way as app prefixes):

  - **`/${orgDir}/${opEnv}/…`** — manage secrets under **one operational environment** for that org (all child apps under that `opEnv` tree, but **not** sibling envs such as `dev` vs `qa`).
  - **`/${orgDir}/…`** — manage secrets under **the whole org prefix**, including every **`/${orgDir}/${opEnv}/…`** branch; use **only** when the recipe intentionally grants cross-**`opEnv`** write (for example a dedicated org-wide secret-admin role).

  Admin stacks still use **narrow read-only** prefixes for ordinary runtime Lambdas where possible (same pattern as app stacks under **`/${orgDir}/${opEnv}/admin/…`** or equivalent). **Separation of duties**: Prefer distinct principals for “runtime read” vs “secret write” within the same stack when both exist.

## Builder and defaults package responsibilities

- **`deploy-aws-cdk-builder`**: Declares hooks/options types for secrets prefix propagation and registers relationship kinds; does not hardcode path strings.
- **`deploy-aws-cdk-defaults`**: Implements `createFunctionProps` segments that merge **`MTNG_SECRETS_PREFIX`** (or configured name), implements `grantSsmSecretsPrefixAccess`, and implements pure **`resolveSsmSecretsPrefix(env, …)`**-style helpers from [`FullEnv`](../../../../packages/core/spec/app-env.md) slices plus deploy-time inputs. **Admin** IAM MUST remain **opt-in**: recipes choose **`read-write`** on **`/${orgDir}/${opEnv}/…`** or **`/${orgDir}/…`** only—never assume org-wide **`/${orgDir}/`** for admin stacks by default.

## Recipes

- **[`LambdaAndS3BackedDistribution`](../recipes/lambda-and-s3-backed-distribution/README.md)**: MUST apply the standard secrets wiring for the **server Lambda** by default (prefix env via defaults + read-only prefix grant), unless the recipe options explicitly disable or replace it. Overrides to `functionProps` or IAM MUST remain compatible with Parameter Store patterns or the recipe doc MUST warn that custom overrides void this invariant.

## Related

- [Function resource](../resources/function/README.md) — `addFunction` / `createFunctionProps`
- [Relationship: `grantSsmSecretsPrefixAccess`](../relationships/grant-ssm-secrets-prefix/README.md)
- [`app-env.md`](../../../../packages/core/spec/app-env.md) — env dimensions for hierarchical prefixes
