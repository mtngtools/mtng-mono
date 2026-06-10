# Deployment specifications

Repo-level conventions for **DEPLOY** packages: libraries (`deploy-*`), recipes (`deploy-recipe-*`), suites (`deploy-suite-*`), shared vs app-scoped infrastructure, and pnpm orchestration. **Layout:** `deploy-*` libraries live under **`packages/`**; recipes under **`deploy/recipes/`**; suites under **`deploy/suites/`** (see [naming-and-orchestration.md](./naming-and-orchestration.md)).

> **AWS CDK builder planning:** requirements for a reusable TypeScript/CDK builder library live in [builder/cdk/README.md](./builder/cdk/README.md).

| Document | Description |
| :--- | :--- |
| [naming-and-orchestration.md](./naming-and-orchestration.md) | Naming rules, reference recipe names, suite vs slice, pnpm script examples |
| [env/README.md](../env/README.md) | **[Varlock](https://varlock.dev/)**, **`@mtngtools/env-*`** (**`workspace:*`**), **`@mtngtools/core`** **`FullEnv`**, **`loadPath`**, forbidden root-relative **`@import`** |
| [`deploy/recipes/deploy-recipe-mock-data-1/README.md`](../../deploy/recipes/deploy-recipe-mock-data-1/README.md) | Deploy recipe: mock-meeting JSON to S3 (canonical spec lives with the package) |
