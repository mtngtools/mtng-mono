# Environment specifications (requirements)

This directory holds **specifications** for how **mtng-mono** manages environment variables and tooling (Varlock, schemas, examples).

- **[varlock-and-env.md](./varlock-and-env.md)** — Varlock usage: single root **`.env.schema`**, **`@import`**, **`loadPath`**, package composition.

**Fragment schemas and examples** (source of truth for variable lists) live in the repo root **`env/`** directory—not here:

| Location | Role |
| :--- | :--- |
| **[env/](../../env/)** | One directory per scope (e.g. **`env/base/`**, **`env/aws/`**), each with **`.env.schema`** + **`.env.example`**. Root **`.env.schema`** uses **`@import(./env/<scope>/.env.schema)`** (leading **`./`** required by Varlock). **`spec/env`** documents behavior only. |

Future provider-specific scopes should add **`env/<provider>/.env.schema`** + **`env/<provider>/.env.example`**, then **`@import`** them from the single root **`.env.schema`**.

## Related

- [Application environment (`app-env`)](../../packages/core/spec/app-env.md) — **`MTNG_OP_ENV`**, **`MTNG_ORG_DIR`**, naming dimensions.
- [Deploy recipe mock-data env schema](../../deploy/recipes/deploy-recipe-mock-data-1/.env.schema) — recipe-local keys importing the root aggregate.
