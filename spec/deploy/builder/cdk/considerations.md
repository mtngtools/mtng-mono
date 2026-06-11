# CDK builder spec — considerations

Non-normative notes from a design review of this folder ([README](./README.md)). Use these items to extend specs, align README promises with indexed docs, and steer implementation.

---

## Strengths (preserve while iterating)

- **Clear layering**: Builder vs defaults vs recipes vs suites matches deploy conventions ([deployment specs](../../README.md), [naming and orchestration](../../naming-and-orchestration.md)). The builder stays a library, not a deploy entrypoint.
- **Deferred build + registry**: Blueprint → `.build(scope)` separates intent from constructs; typed refs and verb-based relationships reduce ambiguity versus a generic `link(source, target)`.
- **`core` alignment**: Consuming `FullEnv`, resolution helpers, and naming from `core` avoids a parallel deployment context; “no hidden globals” keeps recipes testable and predictable.
- **Extensibility**: `addCustomResource` / custom relationships keep the model open without front-loading every AWS primitive.
- **Recipes**: Pure `refs(recipeKey)`, constructor-prop composition first, and documented caution around per-resource overrides encode the right tradeoffs.
- **Honest backlog**: [stacks/README](./stacks/README.md) already flags merge rules, cross-stack refs, and deploy orchestration metadata.

---

## Coverage gaps (spec vs README promises)

- **Resources**: The main README lists methods such as `addQueue`, `addTopic`, `addHttpApi`, `addEventRule`, `addStateMachine`. [resources/README](./resources/README.md) indexes fewer primitives. Either narrow the README list to “phase 1,” maintain an explicit **not yet specified** list, or add stub specs so expectations stay in sync.
- **Relationships**: The README names verbs such as `subscribe`, `addOutput`, `storeParameter`. [relationships/README](./relationships/README.md) indexes a smaller set. Same remediation as resources.
- **Cross-stack**: Objectives mention exports/imports and stack boundaries; behavior remains thin. Specify **CloudFormation exports/imports vs SSM/parameters**, **when stack dependencies are required**, **logical ID / physical name stability** when splitting stacks, and **cyclic dependency** detection or documented avoidance patterns.
- **Cross-stack refs without Outputs**: Document a default policy of avoiding **CDK Outputs/exports/imports** for cross-stack references. Prefer kind-specific reference registration methods (`addCrossStackReferenceByXxx…` vs `addExternalReferenceByXxx…`), backed by deterministic naming + an auto-tagging contract (`FullEnvItemName`) for future “ByTag” lookups.
- **Stack overrides**: [stacks/README](./stacks/README.md) “stack-options” follow-up matters for implementation: **deep vs shallow merge** for `extensions`, **precedence** when root and stack both set hooks or naming, and whether **partial `env`** merges via `resolveEnv` or replaces dimensions.

---

## Lifecycle, validation, and failure modes

- **Pre-build validation**: Enumerate required checks (missing refs, incompatible resource kinds for a relationship, duplicate keys, invalid cross-stack references). Clarify **error shape** (fail-fast vs aggregated messages).
- **Ordering**: “Sort by dependency category” is underspecified relative to CDK’s own implicit dependencies. Document whether the builder relies on **explicit edges**, **topological ordering**, **registration order + validation**, and how that interacts with CDK dependency synthesis.
- **Post-build hooks**: For aspects, tags, outputs—define **ordering** (e.g. tags relative to aspects) and whether hooks may **mutate** constructs or are observation-only.
- **Removal / destroy**: Call out default `removalPolicy`, retained resources, buckets with objects, and similar—either as builder defaults or as explicit **recipe responsibilities** so behavior is not surprising.

---

## Security and compliance

- **IAM**: Clarify whether defaults target **least privilege** vs broader bootstrap policies; how **relationship verbs** map to IAM breadth (`grantRead` / `grantWrite` especially).
- **Secrets**: Normative SSM Parameter Store prefix model, Lambda env wiring, and **`grantSsmSecretsPrefixAccess`** are specified in [secrets/README](./secrets/README.md); rotation and KMS edge cases remain documented alongside defaults implementation.
- **Encryption**: Defaults for SSE (S3, DynamoDB, queues), KMS (account default vs CMK), and **ownership** of keys when multiple recipes compose.
- **Network**: VPC-attached compute, security groups, private APIs in certain environments—either env dimensions or recipe-level options so “network-shaped” resources stay intentional.

---

## Operability (deploy, promote, observe)

- **CI/CD contract**: What each recipe exposes (`synth`, `diff`, `deploy`, asset build); **bootstrap** and **toolkit stack** expectations; prod approval patterns.
- **Synth-time input catalog**: For each **`deploy-recipe-*`** (or shared suite doc), specify the **complete** set of inputs required to reproduce **`cdk synth`**—environment variables (including those consumed only by naming or [secrets](./secrets/README.md) prefix resolution), optional **`cdk` context** keys (`-c` / `cdk.context.json`), asset/build prerequisites, and AWS **account/region/profile** assumptions. Document whether the builder validates missing inputs **before** synthesis with actionable errors versus relying on CDK/runtime failures. Reduces implicit `process.env` reads and “works locally but not in CI.” **Publish** the catalog (or link it) from each recipe’s **`README.md` on npm**, not only under **`spec/`**—relative spec links are invisible to downstream **`node_modules`** installs.
- **Varlock distribution**: Treat Varlock schemas as **npm artifacts** (e.g. **`@mtngtools/env-*`**) and prefer publishing recipes with a **flattened `.env.schema`** (generated in CI/automation) so configuration behaves the same under monorepo and external installs. See [spec/env/README.md](../../../env/README.md).
- **Promotion**: Same recipe code with different `opEnv` (and related dimensions); domains and certificates without forking recipe code.
- **Observability**: Log retention, baseline alarms/dashboards—builder defaults vs recipe-owned—especially if verbs like `subscribe` become first-class.
- **Cost and tagging**: Map mandatory tags from `core` dimensions where relevant; optional note on budgets or cost allocation tags as recipe or suite concerns.

---

## Developer experience and typing

- **Shared context types**: A single spec for `ResourcePropsContext`, `CreateResourceContext`, and **`getResource` semantics** (throws vs optional, timing relative to registration) anchors every resource and relationship doc.
- **Recipe ref keys**: Template literal keys (e.g. `` `${Key}.staticBucket` ``) need **CloudFormation length / naming constraints**, collision rules between recipe keys, and **ref identity** (two `refs()` calls with the same key).
- **Nested scopes**: Confirm whether nested stacks or sub-scopes ever need **sub-builders** or whether one stack-scoped fluent builder always suffices.

---

## Testing strategy

- **Unit**: Extensions and props factories without deploy; registry-only tests for validation and ordering.
- **Integration**: Snapshot policy vs `Template.fromStack`-style assertions; how **CDK version bumps** affect snapshot churn.
- **Recipe invariants**: Tests that safe overrides stay within documented bounds—or explicit documentation that certain overrides void recipe guarantees.

---

## AWS / CDK ecosystem edges

- **Asset bundling**: Lambda bundling (esbuild, Docker), monorepo paths, CI caching, and importing from workspace packages.
- **CloudFront and origins**: Behaviors, OAC/OAI, Lambda URLs, **WAF**—often recipe-specific but affects what “defaults” must cover.
- **Custom resources**: Provider framework vs low-level custom resources; timeouts, failure handling, replacement semantics for wrapped third-party resources.
- **Escape hatches**: Supported patterns (`Cfn*`, raw prop patches) when the builder blocks an urgent change.

---

## Multi-account and advanced topology

- Even if v1 is single-account, single-region, a short **future-facing** note on cross-account access (KMS, S3, Lambda invoke) reduces later rework.
- Relationship between CDK **`Stage`**, **`addStack`**, and suite orchestration (one `App` vs several).

---

## Documentation hygiene

- **Glossary**: Registry key vs physical name vs stack name vs recipe key—one canonical paragraph, linked from resource specs.
- **Versioning**: Target **CDK minor range** and **API stability** expectations for builder vs defaults packages while the spec remains draft.

---

## Parent deploy README ([spec/deploy/README.md](../../README.md))

- Consider one sentence on **when** recipes should adopt the builder vs hand-written CDK (threshold or guideline).
- Optional early pointer to [stacks](./stacks/README.md) if stack and cross-stack design will drive suite layout.
