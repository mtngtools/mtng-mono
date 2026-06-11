# Recipe Spec: `LambdaAndS3BackedDistribution`

Defines requirements for a distribution recipe backed by:

- static assets in S3 (readonly origin)
- server origin from Lambda
- optional custom domain using certificate reference

## Scope

- Required and optional recipe options
- Typed refs shape exposed by `refs(recipeKey)`
- Resource registration order and key conventions
- Preferred CDK-native constructor-prop composition for distribution wiring
- Supplemental relationship methods (for example, `grantRead`) where needed
- **Standard SSM secrets wiring** for the server Lambda (see below)

## Secrets (standard behavior)

This recipe MUST integrate [SSM Parameter Store secrets](../../secrets/README.md) for the **server Lambda** (`refs(recipeKey).serverFunction`) **by default**:

1. **Deploy-time prefix**: The recipe resolves a parameter path prefix from the deploy environment (for example reading **`MTNG_SSM_SECRETS_PREFIX`** or a recipe option that forwards the same value). The prefix identifies where all secrets for **this** app slice live under Parameter Store.
2. **Lambda environment**: Through **`createFunctionProps`** defaults (or equivalent recipe-internal composition), the server Lambda receives **`MTNG_SECRETS_PREFIX`** (or a documented override name) set to that resolved prefix so runtime code can load secrets without embedding paths.
3. **IAM**: After registering the server function, the recipe MUST call **`grantSsmSecretsPrefixAccess`** with **`access: 'read'`** for that function and the **same** normalized prefix, unless recipe options explicitly disable or replace this behavior.

**Overrides**: Recipes may expose options such as `secrets: false` or `secrets: { prefix: string, envVarName?: string }`. Per-resource **`functionProps`** overrides MUST preserve compatibility with Parameter Store patterns or the recipe MUST document that those overrides void the standard secrets invariant.

**Admin stacks**: Admin-oriented recipes that reuse this composition may attach **`grantSsmSecretsPrefixAccess`** with **`access: 'read-write'`** only where needed, on **`/${orgDir}/${opEnv}/…`** or **`/${orgDir}/…`** per recipe configuration—not org-wide by default. Narrow **read-only** prefixes SHOULD still be used for ordinary runtime Lambdas where possible. See [secrets: Admin vs app stacks](../../secrets/README.md#admin-vs-app-stacks).
