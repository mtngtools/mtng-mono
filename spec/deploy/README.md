# Deployment specifications

Repo-level conventions for **DEPLOY** packages: libraries (`deploy-*`), recipes (`deploy-recipe-*`), suites (`deploy-suite-*`), shared vs app-scoped infrastructure, and pnpm orchestration. **Layout:** `deploy-*` libraries live under **`packages/`**; recipes under **`deploy/recipes/`**; suites under **`deploy/suites/`** (see [naming-and-orchestration.md](./naming-and-orchestration.md)).

| Document | Description |
| :--- | :--- |
| [naming-and-orchestration.md](./naming-and-orchestration.md) | Naming rules, reference recipe names, suite vs slice, pnpm script examples |
| [env/README.md](../env/README.md) | **`env/`** fragment schemas vs **`spec/env`** docs |
| [env/varlock-and-env.md](../env/varlock-and-env.md) | **Varlock**: root aggregate **`.env.schema`**, **`env/`** **`@import`**, package **`@import`**, **`loadPath`**, pnpm **`cwd`** |
| [`deploy/recipes/deploy-recipe-mock-data-1/README.md`](../../deploy/recipes/deploy-recipe-mock-data-1/README.md) | Deploy recipe: mock-meeting JSON to S3 (canonical spec lives with the package) |
