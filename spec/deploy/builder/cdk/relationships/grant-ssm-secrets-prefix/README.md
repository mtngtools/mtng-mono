# Relationship Spec: `grantSsmSecretsPrefixAccess`

Grants an IAM principal associated with a **function** (or future function-like targets) **scoped** AWS Systems Manager Parameter Store access under a single **path prefix**, aligned with [secrets conventions](../../secrets/README.md).

## Method signature

```ts
grantSsmSecretsPrefixAccess<
  TargetKey extends string,
>(
  targetFunctionKey: ResourceRef<"function", TargetKey> | TargetKey,
  options: GrantSsmSecretsPrefixAccessOptions,
): this;
```

## Options

```ts
type SsmSecretsAccess = "read" | "read-write";

type GrantSsmSecretsPrefixAccessOptions = {
  /** Normalized Parameter Store path prefix; must match MTNG_SECRETS_PREFIX (or configured env var) when both are set. */
  prefix: string;
  access: SsmSecretsAccess;
};
```

- **`read`**: Parameter Store read APIs only, IAM resources limited to parameters under `prefix` (see [secrets README](../../secrets/README.md)).
- **`read-write`**: Adds create/update/delete (and any KMS encrypt) permissions required for SecureString maintenance under `prefix`, still scoped to that subtree—used for **admin** roles when the recipe explicitly grants write on **`/${orgDir}/${opEnv}/…`** or **`/${orgDir}/…`**, or for other automation principals—not as an implicit default for admin stacks.

## Behavior

- Applies grants on the **execution role** (or equivalent) of the resolved Lambda construct for `targetFunctionKey`.
- **Validation**: Fail at build/validation time if `prefix` is empty or cannot be normalized consistently with IAM patterns.
- **KMS**: When SecureStrings use customer-managed keys, the relationship extension attaches the minimal **`kms:Decrypt`** / **`kms:Encrypt`** (or documented subset) needed for operations implied by `access`.

## Scope

- Supported target kinds start with **`function`**; other compute kinds may be specified later with the same options shape.

## Related

- [Secrets (SSM Parameter Store)](../../secrets/README.md)
