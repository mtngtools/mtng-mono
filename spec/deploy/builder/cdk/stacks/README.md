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

- **Default**: Avoid CloudFormation **Outputs** / exports/imports as the primary cross-stack reference mechanism.
- **Cross-stack vs external**:
  - **cross-stack**: the referenced resource is **defined by the same builder graph** (possibly in another stack), so its **compliant physical name** can be derived deterministically from `FullEnv` / `StorageEnv` naming.
  - **external**: the referenced resource exists outside the builder graph; it may be non-compliant, so references typically require an **explicit physical name** (or other explicit identifiers).
- **Shape in recipes**: Prefer explicit, kind-specific reference registration methods such as `addCrossStackReferenceByBucketName` / `addExternalReferenceByBucketName` so recipe intent is obvious even if implementations converge.
