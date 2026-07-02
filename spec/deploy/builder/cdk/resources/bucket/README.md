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

### 1. Minimal (Automatic)
The easiest and most common way to create a bucket. It will automatically derive its name, tags, encryption, and removal policies based on the environment and `STORAGE_APP_STATIC` key.

```ts
s.addBucket(STORAGE_APP_STATIC);
```

### 2. Basic Override (Patching Props)
When you need to change a specific property (like enabling versioning) but want to keep the automatic naming and defaults. Spread the opinionated default factory `createBucketPropsLatest` and then apply your overrides.

```ts
s.addBucket(STORAGE_APP_STATIC, {
  props: (ctx, ref) => ({
    ...createBucketPropsLatest({ env: ctx.env, resourceKey: ref.key }),
    versioned: true, // Overriding default behavior
  }),
});
```

### 3. Fully Custom (Ejecting to Native CDK)
If you realize you need perfect control over the bucket and the `addBucket` wrapper is getting in your way, you don't need to rewrite your whole stack. You can eject to raw native CDK using the `addConstruct` escape hatch. 

You can still use the builder's factories to generate the standard compliant name, but manually wire it up to `s3.Bucket`. Because you are registering it with `addConstruct(STORAGE_APP_STATIC, ...)`, all other builder methods (like `.grantRead(..., STORAGE_APP_STATIC)`) will still work seamlessly!

```ts
s.addConstruct(STORAGE_APP_STATIC, (scope, env, ctx) => {
  // 1. Generate the standard default props so we get the compliant physical name
  //    and the environment-aware removal policies.
  const defaultProps = createBucketPropsLatest({ env, resourceKey: STORAGE_APP_STATIC });

  // 2. Instantiate a raw CDK Bucket exactly how you want it.
  const bucket = new s3.Bucket(scope, 'MyCustomBucket', {
    ...defaultProps,
    bucketName: defaultProps.bucketName, // Guarantee compliant naming
    removalPolicy: defaultProps.removalPolicy,
    
    // Add any complex native CDK logic here
    lifecycleRules: [
      {
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        expiration: cdk.Duration.days(365),
      }
    ],
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  });

  // 3. Return the bucket so the builder registers it in the registry
  return bucket;
});
```
