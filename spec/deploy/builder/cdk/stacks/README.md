# CDK Builder Stack Specs

Detailed stack composition behavior specifications for builder `addStack` live in this folder.

`addStack` is the required vehicle for both single-stack and multi-stack recipes.

## Required contract

- `stackName` is required on `addStack` options and should be sourced from the same env/context used to run CDK CLI.
- The stack callback receives a fluent stack-scoped builder (`s`) where `s.addXxxx(...)` and `s.relationshipMethod(...)` return `s`.
- Root builder defaults may be overridden per stack through optional stack options (`env`, `naming`, `extensions`, `hooks`).
- Resource/relationship/recipe registration methods are stack-scoped APIs and should be called through `s` inside `addStack`.

## Suggested follow-up specs

- `stack-options` — exact merge/resolve rules for root defaults vs stack overrides
- `cross-stack-refs` — behavior for references across stack boundaries **without** CDK Outputs by default
- `stack-build-plan` — metadata emitted for deploy recipe orchestration

## Cross-stack references (direction)

- **Avoid CfnOutputs**: The builder explicitly avoids CloudFormation **Outputs** (exports/imports) to prevent painful tight coupling on deletions/updates.
- **Name Lookup Only**: The *only* cross-stack strategy is lookup via deterministic physical name (e.g., bucket name).
- **CDK Primitives**: The builder itself does not implement a custom search mechanism. It utilizes standard CDK primitives (like `Bucket.fromBucketName` or `fromLookupByName`) to resolve references identically to native CDK.
- **Shape in recipes**: Prefer explicit, kind-specific reference registration methods such as `addCrossStackReferenceByBucketName` / `addExternalReferenceByBucketName` so recipe intent is obvious even if implementations converge.

## Stack Merge Semantics

- **Shallow Merge by Category**: When `options.extensions` are provided in `addStack`, they perform a shallow merge at the extension category level. Overriding `resources` replaces the entire `resources` object for that stack, but leaves `relationships` untouched.

## Logical ID Stability

- **Native CDK Generation**: The builder ignores logical IDs and lets CDK generate them natively based on stack and construct hierarchy. Moving resources across stacks or refactoring the hierarchy results in a delete-and-recreate. Because stateful resources are set to `RETAIN` in production and rely on physical names, a Logical ID change will safely abandon the old resource, and the new resource creation will intentionally fail (due to a physical name conflict), forcing the developer to safely import or migrate the resource.
