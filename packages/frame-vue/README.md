# @mtngtools/frame-vue

> [!WARNING]
> This package is currently **experimental** and in early development. APIs are subject to frequent breaking changes.

Vue.js component and composable library for mtngTOOLS. Built for use in Nuxt apps via a Nuxt module.

## Components

| Component | Description |
| --- | --- |
| [`LiveFrame`](./src/components/live/LiveFrame) | Full-screen wrapper for live video players with responsive layout support. |
| [`LoggedInOut`](./src/components/LoggedInOut) | Component that toggles content visibility based on authentication status. |
| [`SidePanelFrame`](./src/components/live/SidePanelFrame) | Wrapper for controlling and displaying side panel content. |
| [`SidePanelHeader`](./src/components/live/SidePanelHeader) | Standardized header component for the side panel. |
| [`SidePanelButtonGroup`](./src/components/live/SidePanelButtonGroup) | Control group for managing panel selection buttons. |
| [`SidePanelControlButton`](./src/components/live/SidePanelControlButton) | Interactive button for switching side panel states. |

## Composables

| Composable | Description |
| --- | --- |
| [`useSimpleLoggedIn`](./src/composables/useSimpleLoggedIn) | Shared reactive state for basic mobile/web "logged in" status. |

## Usage

Install in an app that already uses Vue 3 (e.g. a Nuxt app):

```bash
pnpm add @mtngtools/frame-vue vue
```

### Regular Imports

```ts
import { LiveFrame, LoggedInOut } from '@mtngtools/frame-vue';
```

### Direct Subpath Imports

For specific needs or smaller bundle sizes, you can import directly from subpaths:

```ts
import { LoggedInOut } from '@mtngtools/frame-vue/components';
import { useSimpleLoggedIn } from '@mtngtools/frame-vue/composables';
```

## Requirements

- Vue >= 3.5.0

## Scripts

- `pnpm run build` — build library to `dist/`
- `pnpm run dev` — watch build
- `pnpm run typecheck` — TypeScript check
- `pnpm run lint` — oxlint
