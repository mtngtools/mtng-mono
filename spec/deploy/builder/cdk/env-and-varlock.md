# CDK deploy env, Varlock, and FullEnv

Varlock + **`@mtngtools/core`** **`FullEnv`**: **[spec/env/README.md](../../../env/README.md)** (schemas ship in **`@mtngtools/env-*`** with **`workspace:*`** in-repo; **expected** recipe implementation is a **flattened `.env.schema`** generated in CI/automation; **`loadPath: ["."]`**).

## NPM consumption (authoritative for downstream)

- **`@mtngtools/core`** — import **`FullEnv`**, **`resolveEnv`**, **`resolveStorageEnv`** (and related) only from this package via **`dependencies`** / **`workspace:`**—see published **`README`** and **`exports`**.
- **`@mtngtools/deploy-aws-cdk-builder`** / **`@mtngtools/deploy-aws-cdk-defaults`** — CDK recipe code depends on these packages normally; builder **`env`** inputs must be constructed from public APIs of **`core`** and any future **`@mtngtools/env-*`** loader—**never** `import … from '../../../../spec/…'`.
- **Varlock** pairs **`.env.schema`** with **`@mtngtools/env-*`** packages (dependencies / **`workspace:*`**). **`spec/env`** documents behavior only; npm **`README`** carries operator-facing steps.

## Contributors (monorepo spec navigation)

- **[spec/env/README.md](../../../env/README.md)** — roadmap, **`@mtngtools/env-*`** strategy, backlog.
- **`packages/core/spec/app-env.md`** — contributor-oriented **`FullEnv`** documentation mirror (**published** contract is **`@mtngtools/core`** on npm).
- **[Secrets (SSM)](./secrets/README.md)** — prefix inputs such as **`MTNG_SSM_SECRETS_PREFIX`** (npm-facing detail should ship from **`@mtngtools/deploy-aws-cdk-defaults`** **`README`** too).

## Still to specify (CDK / recipe backlog)

Items below extend the repo env roadmap where **`cdk synth`**, **`cdk deploy`**, or builder behavior matters.

- **Recipe ↔ Varlock merge**: For each **`deploy-recipe-*`**, document which dimensions are **hardcoded** in source (`solutionDomain`, `applRole`, …) versus **required from Varlock** (`orgDir`, `opEnv`, parameter prefixes, account/region/stack-name vars)—and the **deterministic merge order** into **`Partial<FullEnv>`** (then **`resolveEnv`**) so CDK entry modules stay testable.

- **Lifecycle-specific keys**: Which variables must exist for **`cdk synth`** only, **`cdk deploy`** only, or runtime-only scripts; whether some recipes allow synth with stubs; how **`@defaultRequired`** in recipe **`.env.schema`** reflects that split.

- **Failure surfaces**: Operators should get distinct signals for **Varlock** validation failures vs **`resolveEnv`** / loader failures vs optional **builder preflight** (missing refs, duplicate registry keys, missing secrets prefix when the recipe requires it). Document where each is enforced per recipe.

- **`cdk` context vs environment**: If **`-c`** / **`cdk.context.json`** ever overlaps **`FullEnv`** or naming inputs, specify **precedence** and forbid silent divergence from Varlock-backed **`process.env`**.

- **Canonical mapping (deploy column)**: Extend the repo-wide env-var → **`FullEnv`** mapping with **CDK-only keys** (stack names, bootstrap hints, optional **`CDK_*`** conventions)—publish tables from **`@mtngtools/deploy-aws-cdk-defaults`** **`README`** (and optional **`packages/*/spec`**) so **`createCdkBuilder({ env })`** stays aligned with **`pnpm exec varlock load`** for that recipe package.

- **Testing**: How **`deploy-recipe-*`** unit-test CDK entry configuration—fixture **`.env`** fragments, mocked **`process.env`**, or **`resolveEnv`** on typed fixtures—without AWS or full synth (unless integration tier).
