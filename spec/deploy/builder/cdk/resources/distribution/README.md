# Resource Spec: Distribution (`addDistribution`)

Defines requirements for registering and building CloudFront distribution resources with `addDistribution`.

## Method signature

```ts
addDistribution<Key extends string>(
  resourceKey: Key,
  options?: AddDistributionOptions<Key>,
): this;
```

## Typing

```ts
type DistributionRef<Key extends string = string> = ResourceRef<"distribution", Key>;

type AddDistributionOptions<Key extends string = string> = {
  props?:
    | Partial<DistributionProps>
    | ((ctx: ResourcePropsContext, ref: DistributionRef<Key>) => Partial<DistributionProps>);
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

- Prefer constructor-prop composition for relationships AWS CDK already models (origins, certificate, domain names, behaviors).
- `props` may resolve typed refs (bucket/function/certificate) through context helper APIs.
- Relationship methods can still be used for supplemental behavior not modeled directly by constructor props.

## Default props factory typing

```ts
createDistributionProps<Key extends string>(
  input: CreateResourcePropsInput<"distribution", Key>,
): Partial<DistributionProps>;
```

`createDistributionProps` is specified in this file and implemented in the defaults package.

## Examples

Minimal:

```ts
s.addDistribution("AttendDistribution");
```

Basic override:

```ts
s.addDistribution("AttendDistribution", {
  props: ({ getResource }) => ({
    ...createDistributionProps({ env, resourceKey: "AttendDistribution" }),
    domainNames: ["attend.example.org"],
    certificate: getResource(certificateRef),
  }),
});
```
