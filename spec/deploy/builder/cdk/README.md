# CDK Builder Package Requirements

TypeScript builder pattern that decouples mtngTOOLS infrastructure declarations from AWS CDK stack implementation. It focuses on a blueprint approach where resource intent is registered first and CDK constructs are created only during an explicit build phase. 

Leverages application environment and naming contracts from `core` to produce deterministic, pure, and reusable infrastructure declarations--allowing for minimal deploy code for standard patterns and easy overrides for special cases.

## Position in mtngTOOLS

The CDK builder belongs in the **DEPLOY** layer as a reusable `deploy-*` library. In the mtng-mono layout, that means the implementation package should live under `packages/` (for example, `packages/deploy-aws-cdk-builder/`), not under `deploy/`. The `deploy/` directory is reserved for `deploy-recipe-*` and `deploy-suite-*` packages that consume reusable deployment libraries.

Default AWS CDK behavior should live in a separate DEPLOY library package, suggested as `packages/deploy-aws-cdk-defaults/`. This package owns default resource extensions, `createXxxxProps` helpers, relationship extensions, and common builder recipe implementations. These defaults are reusable in-code helpers, not deployable `deploy-recipe-*` packages.

The builder should provide primitives for registering resources, resolving relationships, applying naming, and rendering constructs, but it should not itself be a deployable app slice or orchestration entrypoint.

## NPM consumers vs `spec/` paths

Implementations ship as **`@mtngtools/deploy-aws-cdk-builder`** and **`@mtngtools/deploy-aws-cdk-defaults`**. Downstream apps depend on those packages via **`npm`** / **`workspace:`** and read each package’s **published `README`**—not markdown links under **`spec/deploy/builder/cdk`**. **`FullEnv`** and **`resolveEnv`** come only from **`@mtngtools/core`**. This **`spec/`** tree is for **contributors** editing mtng-mono; relative links between files are **not** available inside installed **`node_modules`** layouts.

Related framework docs:

- [mtngTOOLS overview](../../../../README.md) — solution domains, product surfaces, and code organization layers.
- [Package directory](../../../../package-directory.md) — package groups and dependency rules.
- [Deployment specifications](../../README.md) — `deploy-*`, `deploy-recipe-*`, and `deploy-suite-*` conventions.
- [Deployment naming and orchestration](../../naming-and-orchestration.md) — recipe and suite naming rules.
- **`@mtngtools/core`** (`npm`) — **`FullEnv`** / **`resolveEnv`** for builder inputs; contributors may also read [`app-env` source spec](../../../../packages/core/spec/app-env.md).
- [Environment specs (Varlock, FullEnv roadmap)](../../../env/README.md) — contributors; npm-facing summaries belong on **`@mtngtools/core`** and future **`@mtngtools/env-*`** **`README`s**.
- [Considerations](./considerations.md) — non-normative design review notes: coverage gaps, lifecycle, security, ops, testing, and doc hygiene.

Detailed builder specs are split by concern:

- [resources](./resources/README.md) — per-resource `addXxxx` behavior
- [relationships](./relationships/README.md) — per-relationship method behavior
- [recipes](./recipes/README.md) — per-recipe composition behavior
- [stacks](./stacks/README.md) — `addStack` behavior for single and multi-stack composition
- [secrets](./secrets/README.md) — SSM Parameter Store (SecureString), prefix contract, Lambda env wiring, admin vs app IAM
- [env-and-varlock](./env-and-varlock.md) — Varlock → **`FullEnv`** → CDK recipes (npm-first + contributor links); repo index [spec/env](../../../env/README.md)

## Primary Objectives

- **Blueprint-driven design**: Separate declaration of infrastructure intent from instantiation of CDK constructs.
- **Centralized orchestration**: Enable one builder to define a deployable infrastructure graph that can render into one or more stacks.
- **Deterministic reliability**: Enforce naming, tagging, validation, and references through a controlled execution lifecycle.
- **Type-safe referencing**: Replace hard-coded construct variables with typed registry keys and late-bound resolution.
- **Framework alignment**: Consume mtngTOOLS `core` environment and naming contracts instead of defining a parallel deployment context.
- **Composable extensions**: Keep default resource, relationship, and recipe behavior outside the builder package and inject those extensions through builder options.
- **Opinionated props**: Provide defaults for common CDK resource props so most `addXxxx` calls only need a local registry key and environment context.
- **Composable recipes**: Support common `addXxxxRecipe` helpers and user-defined `addCustomRecipe` helpers that compose existing builder methods and relationship methods.

## Deferred Execution and Lifecycle

- **Intent registration**: `addXxxx` methods register resource definitions (props, metadata, resource extension key, environment, and dependencies) rather than creating live constructs immediately.
- **Build phase**: A mandatory `.build(scope)` step iterates through registered definitions and instantiates constructs inside the provided CDK scope.
- **Builder stack**: A specialized `Stack` can receive a builder and trigger `.build()` inside its constructor, but deploy recipes may also call the builder directly when that is clearer.
- **Lifecycle hooks**: Support pre-build validation (for circular dependencies, missing refs, invalid environment dimensions) and post-build actions (tags, aspects, outputs, or cross-stack exports).

## Builder Options and Extensions

The builder package should declare the options interface, including a dedicated `extensions` section, but it should not own default CDK resource, relationship, or recipe implementations.

```ts
type CdkBuilderOptions = {
  env?: FullEnv;
  naming?: CdkNamingOptions;
  extensions?: CdkBuilderExtensions;
  hooks?: CdkBuilderHooks;
};

type CdkBuilderExtensions = {
  resources: CdkResourceExtensions;
  relationships: CdkRelationshipExtensions;
  recipes?: CdkRecipeExtensions;
};
```

Default implementations are provided by a companion package. A deploy recipe composes the builder and defaults:

```ts
import { createCdkBuilder } from "@mtngtools/deploy-aws-cdk-builder";
import {
  defaultCdkResources,
  defaultCdkRelationships,
  defaultCdkRecipes,
} from "@mtngtools/deploy-aws-cdk-defaults";

const builder = createCdkBuilder({
  env,
  extensions: {
    resources: {
      ...defaultCdkResources,
      function: customFunctionResource,
    },
    relationships: {
      ...defaultCdkRelationships,
      grantRead: customGrantReadRelationship,
    },
    recipes: {
      ...defaultCdkRecipes,
    },
  },
});
```

This keeps overrides simple: spread the defaults, then replace only the resource, relationship, or recipe extension keys a deploy recipe needs to customize.

Most builder options are intentionally optional at root. Root config provides defaults, while `addStack` may override env, naming, defaults/extensions, and hooks per stack.

## Stack Composition with `addStack`

Use `addStack` as the required composition primitive for both single-stack and multi-stack recipes. The callback receives a fluent stack-scoped builder (`s`) where each method returns the same stack builder for chaining.

### Stack naming for CLI deploys

`addStack` should require an explicit `stackName` so the same name is available to CDK CLI callers (`cdk deploy <stackName>`). In practice this typically comes from env vars in the same process that invokes CDK.

```ts
addStack<StackKey extends string>(
  stackKey: StackKey,
  options: AddStackOptions,
  define: (s: StackBuilder<StackKey>) => StackBuilder<StackKey> | void,
): this;

type AddStackOptions = {
  stackName: string;
  env?: Partial<FullEnv>;
  naming?: CdkNamingOptions;
  extensions?: PartialCdkBuilderExtensions;
  hooks?: CdkBuilderHooks;
};
```

### Root defaults and per-stack overrides

- Root builder options are defaults.
- `addStack(..., options, ...)` may override env/naming/extensions/hooks for that stack.
- Stack config should resolve as inherit + merge + resolve (for env defaults via `resolveEnv`).
- Resource/relationship/recipe registration methods are stack-scoped and should be called through `s` inside `addStack`.

### Fluent stack-scoped builder

Within `define`, calls should chain on `s`:

```ts
builder.addStack("app", { stackName: process.env.CDK_APP_STACK_NAME! }, (s) =>
  s
    .addBucket(STORAGE_APP_STATIC)
    .addFunction("NuxtServer")
    .addDistribution("AttendDistribution")
    .grantRead("NuxtServer", STORAGE_APP_STATIC)
);
```

This keeps stack boundaries explicit without adding per-resource stack ids.

## Opinionated Props Factories

Dedicated `addXxxx` methods should not require callers to pass full CDK props for normal cases. When props are omitted, the resource extension should call a matching props factory such as `createBucketProps`, `createFunctionProps`, or `createTableProps` to build opinionated defaults from the resource key, `FullEnv` / resolved env, naming helpers, tags, and any resource-specific metadata.

Resource default props rules:

- **Spec location**: The default props factory contract for a resource should be specified in the same resource spec file under [`./resources/`](./resources/README.md).
- **Typing shape**: `createXxxxProps` should return a partial-typed shape aligned to the CDK props type for that resource (for example, `Partial<BucketProps>`, `Partial<FunctionProps>`, `Partial<DistributionProps>`), with the resource extension responsible for final normalization/validation before construct creation.

```ts
builder.addStack("app", { stackName: process.env.CDK_APP_STACK_NAME! }, (s) =>
  s.addBucket(STORAGE_APP_STATIC)
);
```

For special cases, users should have direct access to the same props factories from the defaults package so they can spread the opinionated defaults and override only what is different:

```ts
import { createBucketProps } from "@mtngtools/deploy-aws-cdk-defaults";

builder.addStack("app", { stackName: process.env.CDK_APP_STACK_NAME! }, (s) =>
  s.addBucket(STORAGE_APP_STATIC, {
    props: {
      ...createBucketProps({ env, resourceKey: STORAGE_APP_STATIC }),
      versioned: false,
    },
  })
);
```

The defaults package should export both:

- **Resource extensions**: create the CDK construct from resolved builder context and final props.
- **Props factories**: create opinionated CDK props without creating constructs.

This keeps the easy path terse while still making the default opinions reusable when a recipe needs explicit props.

## Environment and Naming Contract

mtngTOOLS already defines deployment identity in [`app-env.ts`](../../../../packages/core/src/app-env.ts) and documents it in [`app-env.md`](../../../../packages/core/spec/app-env.md). The builder should consume those dimensions instead of inventing its own global naming engine.

- **Environment input**: Builders and resource definitions should accept explicit `FullEnv`, resolved env, or resource-specific env such as `StorageEnv`.
- **Environment resolution**: Builders may call `resolveEnv` / `resolveStorageEnv`, or require callers to pass resolved values, but the resolution boundary must be documented per package. **`@mtngtools/core`** is the npm surface for those functions and **`FullEnv`** types. Deploy recipes SHOULD validate **`process.env`** with Varlock against schemas from **`@mtngtools/env-*`** (**`workspace:*`** in the monorepo)—never repo-root-relative **`@import`** / **`loadPath`** ([spec/env/README](../../../env/README.md)). Typed **`@mtngtools/*`** loaders (planned) replace ad hoc **`process.env`** parsing in **`@mtngtools/deploy-aws-cdk-defaults`**. CDK backlog: [env-and-varlock.md](./env-and-varlock.md).
- **Pure naming**: Physical names, parameter paths, export names, and stable identifiers should come from pure naming helpers such as [`app-naming.ts`](../../../../packages/core/src/app-naming.ts) or deployment-package-specific helpers that follow the same contract.
- **No hidden globals**: Builders, resource extensions, relationship extensions, recipes, and tests should receive environment input explicitly. Avoid process-global naming state outside the deploy recipe entrypoint.
- **Local registry keys**: Developer reference strings such as `OrderTable` or `AttendBucket` are local builder registry keys. They are not, by themselves, physical resource names.

The default naming shape currently available in `core` is dash-delimited and based on resolved environment dimensions:

```ts
const { resourceName } = resolveNameGenerator({})(env);
```

Deploy packages may provide AWS/CDK-specific naming helpers when resource families need additional segments such as `storageRole`, stack role, or meeting-scoped ids, but those helpers should still start from the `core` environment model.

## Tagging (auto-tagging contract)

By default, resources created through the builder SHOULD be tagged with the environment dimensions that contributed to their identity so they are discoverable and traceable across stacks and accounts.

- **Dimensions**: Tag all `FullEnv` (or resource-specific env such as `StorageEnv`) dimensions that are present after resolution (`orgDir`, `opEnv`, `solutionDomain`, `applRole`, `applVariant`, and extensions such as `storageRole` for storage-like resources).
- **Unique item tag**: Include a deterministic tag key (suggested) **`FullEnvItemName`** whose value is a unique, stable identifier derived from the resolved env dimensions plus any required resource-role extensions. This supports future “ByTag” lookup patterns when CDK allows it.
- **Optional extra dimensions**: If uniqueness requires it for a particular resource family, allow optional inclusion of additional dimensions such as **region** (or availability zone) in the `FullEnvItemName` generation. **Account** is typically omitted under the expectation that a given `opEnv` maps to a dedicated account per `orgDir`.
- **Ownership**: Tagging rules and `FullEnvItemName` generation belong in **`deploy-aws-cdk-defaults`** so recipes and custom resources can reuse the same behavior.

## Secrets (SSM Parameter Store)

Application secrets for standard stacks are modeled in **AWS Systems Manager Parameter Store** as **SecureString** parameters under a deploy-time **path prefix** (not embedded in CDK templates). The external deployment process supplies that prefix (for example via env vars consumed at synth/deploy time).

- **Lambda defaults**: `createFunctionProps` in **`deploy-aws-cdk-defaults`** SHOULD inject a standard Lambda environment variable (for example **`MTNG_SECRETS_PREFIX`**) whose value is the resolved prefix so runtime code can locate secrets without hardcoding paths.
- **IAM**: Use **`grantSsmSecretsPrefixAccess`** with **`access: 'read'`** for typical app Lambdas, scoped only to that prefix. Admin stacks that write secrets use **`access: 'read-write'`** on an **explicit** prefix: either **`/${orgDir}/${opEnv}/…`** or **`/${orgDir}/…`**—never implied org-wide scope by default. See [secrets: Admin vs app stacks](./secrets/README.md#admin-vs-app-stacks).
- **Recipes**: [`LambdaAndS3BackedDistribution`](./recipes/lambda-and-s3-backed-distribution/README.md) includes this wiring for the server Lambda by default unless explicitly opted out.

Full normative detail: [secrets/README.md](./secrets/README.md).

## Registry and Discovery

- **Reference map**: Maintain a central registry that maps local developer keys to eventually-created CDK constructs, generated names, metadata, and outputs.
- **Typed lookup**: Provide lookup helpers that narrow by resource kind where possible, so relationship and resource extensions do not need broad casts.
- **Discovery API**: Allow post-build queries by type, metadata property, generated name, tag, or custom predicate.
- **Traceability**: Retain enough metadata to explain how a construct was named and which env dimensions contributed to it.

## Resource Methods, Custom Resources, and Props

- **Dedicated methods**: Start with first-class add methods for common CDK resources: `addBucket`, `addTable`, `addFunction`, `addQueue`, `addTopic`, `addHttpApi`, `addEventRule`, `addStateMachine`, `addDistribution`, and `addParameter`.
- **Custom resources**: Always provide an `addCustom<ResourceType>` path so library users can register resources the builder package does not know about yet.
- **Typed custom registration**: Custom resources should still receive builder benefits: local registry keys, metadata, dependency ordering, naming hooks, validation, and typed references usable by other builder method calls.
- **Resource extension overrides**: Dedicated resource methods call resource extensions supplied through `options.extensions.resources`. The builder package declares the expected resource extension interface; default construct and props implementations come from the separate defaults package.
- **Optional props**: Resource props are optional for the common path. If omitted, the selected resource extension should call the matching `createXxxxProps` factory before creating the CDK construct.
- **Late-bound props**: Properties may be functions that resolve against the builder registry at build time to retrieve generated names, ARNs, URLs, or construct references.
- **Order independence**: Since execution is deferred, the builder can internally sort resources by dependencies (for example, network, storage, database, compute) regardless of registration order.
- **Provider boundaries**: CDK-specific implementations belong in DEPLOY packages. Runtime service bindings remain in PROVIDE packages unless a deploy package only needs provider types or deployment outputs.

The dedicated methods are convenience APIs for popular constructs, not a closed resource model. A custom resource registered by a user should be able to participate in links and lookups just like a built-in resource when its type information and metadata are supplied.

## Relationship Methods and Linkers

- **Verb-based methods**: Define interactions with explicit methods such as `grantRead`, `grantWrite`, `addOrigin`, `addEventSource`, `addEnvironment`, `grantSsmSecretsPrefixAccess`, `subscribe`, `allowInvoke`, `addOutput`, and `storeParameter`.
- **Relationship extensions**: Dedicated relationship methods call implementations supplied through `options.extensions.relationships`. The builder package declares the expected relationship extension interface; default implementations come from the separate defaults package.
- **Named linkers**: Support reusable linking logic that plugs into the builder registry without requiring every app recipe to reimplement grants, environment variables, or outputs.
- **Prefer CDK-native composition first**: When AWS CDK already models a relationship through resource constructor props (for example, passing origins, certificate, and domain config into a CloudFront distribution), recipes should prefer that constructor-prop composition path before introducing separate relationship calls.
- **No bare links**: Avoid a generic `link(source, target)` as the primary API because it does not say what relationship is being created. Use explicit verbs for built-ins and a named custom path for unusual relationships.
- **Custom relationships**: Always provide an `addCustomRelationship` path so users can register relationship behavior the defaults package does not know about yet.
- **Cross-stack connectivity**: Handle CloudFormation exports/imports, stack dependencies, and SSM/parameter references when a link crosses stack or recipe boundaries.
- **Validation**: Relationship extensions should fail early when required source/target resource kinds, environment dimensions, or generated outputs are missing.

## Builder Recipes and Custom Recipes

Builder recipes are reusable composition helpers that call existing stack-scoped resource methods and relationship methods. They should not bypass the registry, naming, validation, or build lifecycle.

- **Dedicated recipe methods**: Common patterns may be exposed as `addXxxxRecipe` helpers, such as `addLambdaAndS3BackedDistributionRecipe` for a CloudFront distribution, readonly S3 static origin, Lambda origin, and custom domain using an existing certificate.
- **Recipe defaults**: Default recipe implementations should live in the defaults package, exported as `defaultCdkRecipes`.
- **Custom recipes**: Always provide an `addCustomRecipe` path so users can define their own composition helpers while still using builder primitives.
- **Primitive access**: A custom recipe should receive a recipe context with the same safe builder capabilities used by built-in recipes: `addBucket`, `addFunction`, `addDistribution`, `addCustom<ResourceType>`, `grantRead`, `grantSsmSecretsPrefixAccess`, `addOrigin`, `addCustomRelationship`, naming helpers, environment, and typed lookup helpers.
- **Fluent add methods**: `addXxxx`, `addXxxxRecipe`, and `addCustomRecipe` should return `this` so builder calls remain chainable.
- **Typed recipe refs**: Recipes should expose a pure `refs(recipeKey)` helper that returns typed refs for the resources the recipe registers. Later builder calls can use those refs without depending on the recipe internals.
- **Refs in props composition**: Recipes should be able to compose constructor props from typed refs (for example, bucket/function/certificate refs passed into `addDistribution` props), so CDK-native wiring remains the default for common patterns.
- **Recipe-level props factories**: Recipes should define their own typed recipe options and a default recipe props factory (for example, `createLambdaAndS3BackedDistributionRecipeProps`) that composes resource-level `createXxxxProps` helpers.
- **Per-resource prop passthrough**: Recipe options may include per-resource prop overrides (for example, `bucketProps`, `functionProps`, `distributionProps`) that are spread on top of recipe defaults.
- **Caution with passthrough**: Recipe docs must warn that per-resource overrides can break recipe invariants and should be used carefully. Defaults should preserve safe edge-case handling around origin wiring, behaviors, permissions, and domain/certificate coupling.
- **Graph participation**: Resources registered by a recipe, including custom recipe resources, must participate in dependency ordering, validation, discovery, tags, outputs, and cross-stack linking like individually added resources.

Conceptually (illustrative only):

> This section is an example shape for API and typing discussion. The concrete recipe specification lives in recipe-specific docs under [`./recipes/`](./recipes/), including [`LambdaAndS3BackedDistribution`](./recipes/lambda-and-s3-backed-distribution/README.md).

```ts
const attendSite = lambdaAndS3BackedDistributionRecipe.refs("AttendSite");

builder.addStack("app", { stackName: process.env.CDK_APP_STACK_NAME! }, (s) =>
  s
    .addCustomRecipe("AttendSite", lambdaAndS3BackedDistributionRecipe, {
      domainName: "attend.example.org",
      certificateRef: "WildcardCertificate",
    })
    .grantRead(attendSite.serverFunction, attendSite.staticBucket)
);
```

Inside the recipe definition, prefer constructor-prop composition where CDK already expresses the relationship:

```ts
const refs = lambdaAndS3BackedDistributionRecipe.refs(recipeKey);

ctx
  .addBucket(refs.staticBucket)
  .addFunction(refs.serverFunction)
  .addDistribution(refs.distribution, {
    props: ({ getResource }) => {
      const bucket = getResource(refs.staticBucket);
      const fn = getResource(refs.serverFunction);
      const cert = getResource(options.certificateRef);
      return {
        domainNames: [options.domainName],
        certificate: cert,
        defaultBehavior: {
          // Lambda origin
          origin: fn,
        },
        additionalBehaviors: {
          "/_nuxt/*": {
            // static asset origin
            origin: bucket,
          },
        },
      };
    },
  })
  .grantRead(refs.serverFunction, refs.staticBucket);
```

The `refs(recipeKey)` helper should be deterministic and should not read from builder state. It creates typed handles using the same key convention the recipe uses when it registers resources:

```ts
type ResourceRef<Kind extends string, Key extends string> = {
  kind: Kind;
  key: Key;
};

type LambdaAndS3BackedDistributionRefs<Key extends string> = {
  staticBucket: ResourceRef<"bucket", `${Key}.staticBucket`>;
  serverFunction: ResourceRef<"function", `${Key}.serverFunction`>;
  distribution: ResourceRef<"distribution", `${Key}.distribution`>;
};

type LambdaAndS3BackedDistributionRecipe = {
  define: (
    ctx: RecipeContext,
    recipeKey: string,
    options: LambdaAndS3BackedDistributionRecipeOptions,
  ) => void;
  refs: <Key extends string>(recipeKey: Key) => LambdaAndS3BackedDistributionRefs<Key>;
};
```

## Recipes and Suites

The builder library should be reusable by deploy recipes and suites without taking over their responsibilities:

- **`deploy-*` builder library**: Defines reusable CDK registration, build, naming, registry, and relationship primitives.
- **`deploy-*` defaults library**: Provides default CDK resource extensions, props factories, relationship extensions, and reusable `addXxxxRecipe` composition helpers. These are consumed through builder options and may be imported directly when recipes need to spread and override default props.
- **`deploy-recipe-*` package**: Instantiates the builder for one deployable slice, either shared infrastructure or one app surface such as attend, admin, or integration.
- **`deploy-suite-*` package**: Orchestrates several recipes through workspace dependencies and scripts. It may host a thin CDK entrypoint, but it should not hide the fact that recipes remain independently deployable.

Deploy recipes may hardcode identity dimensions that define *what* is being deployed, such as `solutionDomain`, `applRole`, `applVariant`, and resource roles. Values that define *where* it is deployed, such as `orgDir`, `opEnv`, and optional uniqueness inputs, should usually come from CI/CD or environment configuration so the same recipe can promote from development to production.

## Desired Developer Experience

The developer defines an infrastructure blueprint through the builder API using local registry keys, typed resource definitions, explicit environment input, and reusable relationship methods. A deploy recipe then hands that blueprint to a stack or CDK app for rendering. This keeps variable management manageable while preserving mtngTOOLS-wide naming consistency through `core` environment and naming contracts.

## Status

- **Status**: Draft requirements
- **Environment**: AWS CDK v2
- **Language**: TypeScript

