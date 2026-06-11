# Resource Spec: `addCustomResource`

Defines requirements for registering custom resource types through `addCustomResource`.

## Method signature

```ts
addCustomResource<
  Kind extends string,
  Key extends string,
  Props extends object,
  ConstructType,
>(
  kind: Kind,
  resourceKey: Key,
  options: AddCustomResourceOptions<Kind, Key, Props, ConstructType>,
): this;
```

## Typing

```ts
type CustomResourceRef<Kind extends string, Key extends string> = ResourceRef<Kind, Key>;

type AddCustomResourceOptions<
  Kind extends string,
  Key extends string,
  Props extends object,
  ConstructType,
> = {
  props?: Props | ((ctx: ResourcePropsContext, ref: CustomResourceRef<Kind, Key>) => Props);
  create: (ctx: CreateResourceContext, ref: CustomResourceRef<Kind, Key>, props: Props) => ConstructType;
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

- `kind` is the typed identifier used for lookup and compatibility rules.
- `create` is required for custom resources because defaults package does not own implementation.
- Custom resources must participate in registry, lifecycle hooks, ordering, discovery, and typed refs exactly like built-in resources.

## Optional custom props factory typing

```ts
createCustom<ResourceName>Props<Key extends string>(
  input: CreateResourcePropsInput<CustomKind, Key>,
): CustomProps;
```

If a custom resource is used repeatedly, its props factory should be documented in the same spec file.

## Examples

Minimal:

```ts
s.addCustomResource("alarm", "HighErrorAlarm", {
  create: (ctx, ref, props) =>
    new CloudWatchAlarm(ctx.scope, ref.key, {
      alarmName: props.alarmName ?? ref.key,
      threshold: props.threshold ?? 1,
      evaluationPeriods: props.evaluationPeriods ?? 1,
    }),
});
```

Basic override:

```ts
s.addCustomResource("alarm", "HighErrorAlarm", {
  props: {
    alarmName: "attend-high-errors",
    threshold: 5,
  },
  create: (ctx, ref, props) =>
    new CloudWatchAlarm(ctx.scope, ref.key, {
      alarmName: props.alarmName,
      threshold: props.threshold,
      evaluationPeriods: 1,
    }),
});
```
