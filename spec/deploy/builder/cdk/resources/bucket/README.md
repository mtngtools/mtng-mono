# Resource Spec: Bucket (`addBucket`)

Defines requirements for registering and building bucket resources with `addBucket`.

## Method signature

```ts
addBucket<Role extends StorageRole>(
  storageRole: Role,
  options?: AddBucketOptions,
): this;
```

## Typing

```ts
type BucketRef<Key extends string = string> = ResourceRef<"bucket", Key>;

type AddBucketOptions = {
  /**
   * Optional override when you need more than one bucket for the same storageRole.
   * When omitted, `resourceKey` defaults to `storageRole`.
   */
  resourceKey?: string;
  props?:
    | Partial<BucketProps>
    | ((ctx: ResourcePropsContext, ref: BucketRef) => Partial<BucketProps>);
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

- `storageRole` does **two jobs**:
  - it is the **builder registry key** by default (`resourceKey = storageRole` unless overridden), and
  - it is the `storageRole` dimension used with the stack’s `FullEnv` to form a `StorageEnv` for naming.
- Prefer `STORAGE_*` constants (e.g. `STORAGE_APP_STATIC`) over ad-hoc string literals, even though `StorageRole` permits `string`.
- If you override `resourceKey`, it identifies the registry entry and drives deterministic naming within the chosen `storageRole`.
- `props` is optional; if omitted, defaults are generated.
- Function-style `props` can derive values from env, naming, and already-registered refs.

## Default props factory typing

```ts
createBucketProps<Key extends string>(
  input: CreateResourcePropsInput<"bucket", Key>,
): Partial<BucketProps>;
```

`createBucketProps` is specified in this file and implemented in the defaults package.

## Cross-stack and external references (no Outputs)

Buckets frequently need to be referenced from stacks that did not create them. This builder pattern prefers **explicit lookups** over CDK Outputs/exports/imports.

### Cross-stack vs external

- **cross-stack**: the bucket was created by another stack within the same builder graph (or follows the same `FullEnv`/`StorageEnv` naming contract). Lookup can be derived with minimal inputs.
- **external**: the bucket exists outside the builder graph and may not be compliant; callers typically supply an explicit `bucketName`.

### Method signatures (planned)

```ts
addCrossStackReferenceByBucketName<Role extends StorageRole>(
  storageRole: Role,
  options?: AddCrossStackBucketReferenceOptions,
): this;

addExternalReferenceByBucketName<Role extends StorageRole>(
  storageRole: Role,
  options: AddExternalBucketReferenceOptions,
): this;
```

```ts
type AddCrossStackBucketReferenceOptions = {
  /** Registry key override; defaults to `storageRole`. */
  resourceKey?: string;
  /** When omitted, derive bucketName from resolved env + naming conventions. */
  bucketName?: string;
  /** Optional env override when the reference target differs from stack env. */
  env?: Partial<StorageEnv>;
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};

type AddExternalBucketReferenceOptions = {
  /** Registry key override; defaults to `storageRole`. */
  resourceKey?: string;
  /** Physical name required by default for external buckets. */
  bucketName: string;
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

### ByTag lookups (future)

If CDK supports deterministic tag-based discovery for buckets in a given context, the bucket resource may add:

- `addCrossStackReferenceByBucketTag(...)`
- `addExternalReferenceByBucketTag(...)`

These are **future** and depend on CDK capabilities. The tagging contract is specified in the root CDK builder README under **Tagging (auto-tagging contract)**.

## Examples

Minimal:

```ts
s.addBucket(STORAGE_APP_STATIC);
```

Basic override:

```ts
s.addBucket(STORAGE_APP_STATIC, {
  props: {
    ...createBucketProps({ env, resourceKey: STORAGE_APP_STATIC }),
    versioned: true,
  },
});
```
