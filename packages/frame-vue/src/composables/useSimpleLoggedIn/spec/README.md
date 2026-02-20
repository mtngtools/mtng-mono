# useSimpleLoggedIn

A simple Vue composable to allow components to share a `loggedIn` boolean state.

## Overview

Sometimes multiple components need to know if a user is "logged in" without going through a full auth system. This composable provides a globally shared reactive boolean.

## API

### `useSimpleLoggedIn(options?: UseSimpleLoggedInOptions)`

Accepts an options object:
- `initialValue?: boolean`: Optional initial state value.
- `addWindowAccess?: boolean`: Optional config to add an object to the global `window` object for external access.
- `windowAccessObjectName?: string`: The name of the object on the `window`.
- `initializeFromWindowAccessObject?: boolean`: Checks `window[initializeWindowAccessObjectName]` during initialization and seeds the state.
- `initializeWindowAccessObjectName?: string`: The name of the `window` variable to read for initialization (defaults to `'initialLoggedIn'`).

Returns an object with the following reactive state and methods:
## Documentation Requirements

- `index.md` must include usage examples for both **Vue SFC** and **Vanilla JavaScript** environments.

- `loggedIn`: `Ref<boolean>` - A shared ref representing the login status.
- `isInitialized`: `Ref<boolean>` - A shared ref indicating whether the state has been populated yet (useful for determining if polling is complete).
- `setToLoggedIn()`: `() => void` - Sets `loggedIn` to `true`.
- `setToLoggedOut()`: `() => void` - Sets `loggedIn` to `false`.
- `toggleLoggedIn()`: `() => void` - Toggles the value of `loggedIn`.
- `getLoggedIn()`: `() => boolean` - Non-reactive getter for the state.
- `setLoggedIn(val: boolean)`: `(val: boolean) => void` - Setter for the state.
- `setupWindowAccess(name: string)`: `Function` - Populates the `name` property on the `window` with auth control functions.
- `cleanupWindowAccess(name: string)`: `Function` - Removes the `name` property from the `window`.

## Implementation Details

- Uses a singleton `ref(false)` to share state across instances without adding a `@vueuse/core` dependency.
- Once the composable runs and sets `loggedIn` to `true` or `false` (either from `initialValue` or `window[initializeWindowAccessObjectName]`), the singleton `ref` takes over. Subsequent calls won't overwrite it from the window again unless it was uninitialized.
- If `initializeFromWindowAccessObject` is `true` and the window property is not immediately found, the composable uses an atomic `setInterval(..., 50)` block to continuously poll for the variable until it is created by another script, subsequently setting `isInitialized` to true and tearing down the interval.
- Uses explicit setter methods (`setToLoggedIn`, `toggleLoggedIn`, etc.) for easier Vanilla JS integration.

## Usage Example

```vue
<script setup>
import { useSimpleLoggedIn } from '../useSimpleLoggedIn'

const { loggedIn, setToLoggedIn, setToLoggedOut, toggleLoggedIn } = useSimpleLoggedIn({
  initialValue: false
})
</script>

<template>
  <div>
    <p>Logged in: {{ loggedIn }}</p>
    <button @click="setToLoggedIn">Log In</button>
    <button @click="setToLoggedOut">Log Out</button>
    <button @click="toggleLoggedIn">Toggle</button>
  </div>
</template>
```
