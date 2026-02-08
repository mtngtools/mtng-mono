# @mtngtools/frame-vue

Vue.js component and composable library for mtngTOOLS. Built for use in Nuxt apps via a Nuxt module (to be added).

## Contents

- **Components** — Vue 3 SFCs (Composition API). Sample: `SampleGreeting`.
- **Composables** — Shared logic. Sample: `useCounter`.

## Usage

Install in an app that already uses Vue 3 (e.g. a Nuxt app):

```bash
pnpm add @mtngtools/frame-vue vue
```

```ts
import { SampleGreeting, useCounter } from '@mtngtools/frame-vue';
```

In a Nuxt app, a Nuxt module can register these for auto-import (module to be created separately).

## Requirements

- Vue >= 3.5.0

## Scripts

- `pnpm run build` — build library to `dist/`
- `pnpm run dev` — watch build
- `pnpm run typecheck` — TypeScript check
- `pnpm run lint` — oxlint
