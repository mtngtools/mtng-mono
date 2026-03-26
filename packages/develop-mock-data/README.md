# @mtngtools/develop-mock-data

Deterministic, **recipe-driven** mock meeting data (rooms, sessions, presentations, speakers) aligned with `@mtngtools/core` types.

## Why this package exists

Building and verifying features against **real production data** is often slow, brittle, or impossible: privacy, size, shape mismatches, and one-off edge cases you do not control. This library exists so you can generate **test-oriented** data on purpose: scenarios you define, reproducible runs, and no need to copy, scrub, or reshape production exports to fit local development.

Use it when you want to **confirm the system behaves correctly** under controlled conditions—new UI flows, APIs, imports, or scheduling rules—without depending on live data or hand-built fixtures that drift out of date.

## What you get

- **Recipes** (`dayPlans`, `roomBlocks`, session-type defaults, rules like unopposed plenary windows, room lifecycles).
- **Deterministic output** for a given recipe (stable IDs and structure for tests and demos).
- **Named example recipes** and helpers to **visualize** what a recipe will generate (see `src/recipes/`).

Deeper behavior and schema details live in the [`spec/`](./spec/README.md) folder.

## Example recipes (easiest way to explore)

The quickest way to see what this package does is to read the **six example recipes** under [`src/recipes/examples/`](./src/recipes/examples/). There are **three scenarios**, each implemented **two ways**: **`dayPlans`** (explicit per-day blocks) and **`roomBlocks`** (shared day/time hierarchies). Compare the pairs to learn both authoring styles.

| Scenario | `dayPlans` | `roomBlocks` |
| --- | --- | --- |
| **1 day, 1 room** | [`1-day__1-room__recipeA__dayPlans.ts`](./src/recipes/examples/1-day__1-room__recipeA__dayPlans.ts) | [`1-day__1-room__recipeA__roomBlocks.ts`](./src/recipes/examples/1-day__1-room__recipeA__roomBlocks.ts) |
| **3 days, main + 3 breakouts** | [`3-day__1-main-room__3-breakouts__recipeA__dayPlans.ts`](./src/recipes/examples/3-day__1-main-room__3-breakouts__recipeA__dayPlans.ts) | [`3-day__1-main-room__3-breakouts__recipeA__roomBlocks.ts`](./src/recipes/examples/3-day__1-main-room__3-breakouts__recipeA__roomBlocks.ts) |
| **5 days, convention center + offsite hotels** | [`5-day__30-conv-center-room__3offsite__recipeA__dayPlans.ts`](./src/recipes/examples/5-day__30-conv-center-room__3offsite__recipeA__dayPlans.ts) | [`5-day__30-conv-center-room__3offsite__recipeA__roomBlocks.ts`](./src/recipes/examples/5-day__30-conv-center-room__3offsite__recipeA__roomBlocks.ts) |

Registered names for `getNamedRecipe` live in [`src/recipes/examples/index.ts`](./src/recipes/examples/index.ts). The 5-day **`dayPlans`** file is exposed as `5-day__30-conv-center-room__3offsite__recipeA` (no `__dayPlans` suffix); the **`roomBlocks`** variant uses `…__roomBlocks`.

## Quick start

```ts
import { createMockMeetingFromRecipe, getNamedRecipe } from "@mtngtools/develop-mock-data";

const recipe = getNamedRecipe("1-day__1-room__recipeA__dayPlans");
const data = createMockMeetingFromRecipe(recipe);
// data.rooms, data.sessions (with presentations/speakers), etc.
```

## Package scripts

From the monorepo root (or this package):

- `pnpm --filter @mtngtools/develop-mock-data typecheck`
- `pnpm --filter @mtngtools/develop-mock-data test`
- `pnpm --filter @mtngtools/develop-mock-data build`

## Documentation

| Doc | Purpose |
| --- | --- |
| [`spec/README.md`](./spec/README.md) | Spec index |
| [`spec/mock-data-contract.md`](./spec/mock-data-contract.md) | API and planner contracts |
| [`spec/recipe-model.md`](./spec/recipe-model.md) | Recipe schema |
| [`spec/recipe-examples.md`](./spec/recipe-examples.md) | Example recipes and visualization |
