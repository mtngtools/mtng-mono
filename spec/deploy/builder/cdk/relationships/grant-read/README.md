# Relationship Spec: `grantRead`

Defines requirements for granting read access between supported resource types.

## Scope

- Supported source/target kind matrix
- Permission actions and principal wiring
- Validation errors for unsupported combinations
- Cross-stack behavior expectations

> **Note:** `grantRead` is not a universal primitive. It should strictly be implemented for resource kinds where CDK natively supports a corresponding `.grantRead()` method (or equivalent). It does not synthesize arbitrary IAM reads if CDK lacks native construct wiring.
