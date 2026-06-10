# Resource Spec: Parameter (`addParameter`)

Defines requirements for registering and building parameter resources with `addParameter`.

## Method signature

```ts
addParameter<Key extends string>(
  resourceKey: Key,
  options?: AddParameterOptions<Key>,
): this;
```

## Typing

```ts
type ParameterRef<Key extends string = string> = ResourceRef<"parameter", Key>;

type AddParameterOptions<Key extends string = string> = {
  props?:
    | Partial<StringParameterProps>
    | ((ctx: ResourcePropsContext, ref: ParameterRef<Key>) => Partial<StringParameterProps>);
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

- Parameter resources should be typed for relationship methods such as `storeParameter` and env injection.
- `props` may be omitted to allow defaults to derive parameter naming/path from env and naming helpers.

## Default props factory typing

```ts
createParameterProps<Key extends string>(
  input: CreateResourcePropsInput<"parameter", Key>,
): Partial<StringParameterProps>;
```

`createParameterProps` is specified in this file and implemented in the defaults package.

## Examples

Minimal:

```ts
s.addParameter("ApiBaseUrl");
```

Basic override:

```ts
s.addParameter("ApiBaseUrl", {
  props: {
    ...createParameterProps({ env, resourceKey: "ApiBaseUrl" }),
    stringValue: "https://api.example.org",
  },
});
```
