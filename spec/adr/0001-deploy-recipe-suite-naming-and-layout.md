# ADR-0001: Deploy Recipe, Suite, and Library Naming and Layout

**Status:** Accepted

## Context

mtngTOOLS needs independent recipe deployment (one app or shared resources) and coordinated multi-recipe orchestration, but distinguish these from reusable libraries.

## Decision

Three deployment package categories:
- **`deploy-*`** (packages/) — reusable libraries; not deployable
- **`deploy-recipe-*`** (deploy/recipes/) — one app slice or shared resources; deployable independently
- **`deploy-suite-*`** (deploy/suites/) — orchestrates multiple recipes

Recipe naming: `deploy-recipe-<cloud>-<stack>-<ref>-<slice>`
- Example: `deploy-recipe-aws-nuxt-ref-1a-attend`

Shared resources use generic patterns: `deploy-recipe-aws-shared-bucket-only-ref-1a` (not tied to one stack).

Suite naming matches recipe prefix: `deploy-suite-aws-nuxt-ref-1a` (no slice suffix).

## Consequences

- CI can target one recipe without redeploying others
- Clear role distinction aids discoverability
- Recipes resolve shared outputs via SSM/CloudFormation, not direct imports

**Alternatives:** Flat namespace (unclear what's deployable); per-app dirs (obscures shared infra); monolithic package (no independent deployment).

## Related

- [Deployment specs](../README.md)
- [CDK builder](./builder/cdk/README.md)
