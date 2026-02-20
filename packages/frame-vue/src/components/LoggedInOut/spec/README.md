# LoggedInOut

A conditional rendering component that switches between `loggedIn` and `loggedOut` slots based on the state from `useSimpleLoggedIn`.

## Overview

The `LoggedInOut` component provides a declarative way to handle UI states that depend on whether a user is logged in. It integrates directly with the `useSimpleLoggedIn` composable, ensuring consistency across the application.

A key goal of this component is to provide easy access to authentication state and methods via Vanilla JS after the component is mounted, especially when used in mixed environments (e.g., Astro or traditional HTML pages).

## API

### Props
- `initiallyLoggedIn`: `boolean` (optional) - If provided, initializes the shared `loggedIn` state to this value.
- `addWindowAccess`: `boolean` (optional, default: `false`) - If `true`, adds an object to the global `window` object for external access.
- `windowAccessObjectName`: `string` (optional, default: `'loggedInOut'`) - The name of the object on the `window`.
- `initializeFromWindowAccessObject`: `boolean` (optional, default: `false`) - If `true`, checks `window[initializeWindowAccessObjectName]` during the initialization of the underlying composable and seeds `loggedIn` from its value.
- `initializeWindowAccessObjectName`: `string` (optional, default: `'initialLoggedIn'`) - The name of the `window` variable to check for the initial value if `initializeFromWindowAccessObject` is true.
- `waitBehavior`: `boolean` (optional)- If `true`, defers rendering any slots until the underlying `useSimpleLoggedIn` state has been explicitly initialized (either via direct configuration, or by a successful `window` object read during SSR/CSR). If omitted, defaults to `true` when `initializeFromWindowAccessObject` is `true`.

### Slots

- `loggedIn`: Content to display when `loggedIn` is `true`.
- `loggedOut`: Content to display when `loggedIn` is `false`.

### Exposed (via `defineExpose`)

For better integration with Vanilla JavaScript and external scripts, the component exposes the following from the `useSimpleLoggedIn` composable:

- `loggedIn`: `Ref<boolean>` - The current reactive login status.
- `setToLoggedIn()`: `() => void` - Sets status to `true`.
- `setToLoggedOut()`: `() => void` - Sets status to `false`.
- `toggleLoggedIn()`: `() => void` - Toggles the current status.

### Global Window Access

When `addWindowAccess` is `true`, the following methods are available on `window[windowAccessObjectName]` (defaulting to `window.loggedInOut`):

- `setToLoggedIn()`: `() => void` - Sets status to `true`.
- `setToLoggedOut()`: `() => void` - Sets status to `false`.
- `toggleLoggedIn()`: `() => void` - Toggles the current status.
- `getLoggedIn()`: `() => boolean` - Returns the current login status.
- `setLoggedIn(value: boolean)`: `(value) => void` - Sets the login status to the provided value.

## Implementation Details

- Uses `useSimpleLoggedIn()` internally, passing `initiallyLoggedIn` prop if provided.
- Conditional rendering using `v-if` / `v-else`.
- No extra wrapper elements are added by the component itself (uses `<template>` or fragments if possible, but usually a single root is needed for `defineExpose` to be reachable via $refs). *Note: Actually, `defineExpose` works in SFC regardless of root, but for Vanilla JS it's accessed via the component instance.*

## Usage Example (Vue SFC)

```vue
<script setup>
import { LoggedInOut } from '@mtngtools/frame-vue'
</script>

<template>
  <LoggedInOut :initiallyLoggedIn="true">
    <template #loggedIn>
      <p>You are viewing protected content.</p>
    </template>
    <template #loggedOut>
      <p>Please log in to continue.</p>
    </template>
  </LoggedInOut>
</template>
```
