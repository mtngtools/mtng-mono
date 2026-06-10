# Resource Spec: Function (`addFunction`)

Defines requirements for registering and building Lambda function resources with `addFunction`.

## Method signature

```ts
addFunction<Key extends string>(
  resourceKey: Key,
  options?: AddFunctionOptions<Key>,
): this;
```

## Typing

```ts
type FunctionRef<Key extends string = string> = ResourceRef<"function", Key>;

type AddFunctionOptions<Key extends string = string> = {
  props?:
    | Partial<FunctionProps>
    | ((ctx: ResourcePropsContext, ref: FunctionRef<Key>) => Partial<FunctionProps>);
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

- `resourceKey` identifies the function in registry/discovery and naming.
- `props` may be static or computed from context and refs.
- Function resources must remain compatible with relationship methods such as `grantRead`, `grantWrite`, `addEnvironment`, and `allowInvoke`.

## Default props factory typing

```ts
createFunctionProps<Key extends string>(
  input: CreateResourcePropsInput<"function", Key>,
): Partial<FunctionProps>;
```

`createFunctionProps` is specified in this file and implemented in the defaults package.

## Secrets prefix (SSM Parameter Store)

When an app stack uses [Parameter Store secrets](../../secrets/README.md), default **`createFunctionProps`** SHOULD merge a Lambda **environment** variable (illustrative name **`MTNG_SECRETS_PREFIX`**) set to the resolved parameter path prefix supplied at deploy time. Actual secret values MUST NOT appear in `props.environment`.

Pair **`addFunction`** with **`grantSsmSecretsPrefixAccess`** (see [relationship spec](../../relationships/grant-ssm-secrets-prefix/README.md)) so the execution role receives prefix-scoped **`read`** or **`read-write`** IAM as required by the recipe.

## Examples

Minimal:

```ts
s.addFunction("NuxtServer");
```

Basic override:

```ts
s.addFunction("NuxtServer", {
  props: {
    ...createFunctionProps({ env, resourceKey: "NuxtServer" }),
    timeout: Duration.seconds(30),
  },
});
```
