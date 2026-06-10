# Resource Spec: Table (`addTable`)

Defines requirements for registering and building DynamoDB table resources with `addTable`.

## Method signature

```ts
addTable<Key extends string>(
  resourceKey: Key,
  options?: AddTableOptions<Key>,
): this;
```

## Typing

```ts
type TableRef<Key extends string = string> = ResourceRef<"table", Key>;

type AddTableOptions<Key extends string = string> = {
  props?:
    | Partial<TableProps>
    | ((ctx: ResourcePropsContext, ref: TableRef<Key>) => Partial<TableProps>);
  metadata?: ResourceMetadata;
  tags?: Record<string, string>;
};
```

- `resourceKey` defines registry identity and naming seed.
- `props` may be omitted for default table behavior from defaults package.
- Table resources should publish typed outputs required by `grantRead`/`grantWrite` relationship methods.

## Default props factory typing

```ts
createTableProps<Key extends string>(
  input: CreateResourcePropsInput<"table", Key>,
): Partial<TableProps>;
```

`createTableProps` is specified in this file and implemented in the defaults package.

## Examples

Minimal:

```ts
s.addTable("SessionStateTable");
```

Basic override:

```ts
s.addTable("SessionStateTable", {
  props: {
    ...createTableProps({ env, resourceKey: "SessionStateTable" }),
    billingMode: BillingMode.PAY_PER_REQUEST,
  },
});
```
