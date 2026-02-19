# useSimpleLoggedIn

A simple Vue composable to allow components to share a `loggedIn` boolean state.

## Overview

Sometimes multiple components need to know if a user is "logged in" without going through a full auth system. This composable provides a globally shared reactive boolean.

## API

### `useSimpleLoggedIn(initialValue?: boolean)`

Returns an object with the following reactive state and methods:
## Documentation Requirements

- `index.md` must include usage examples for both **Vue SFC** and **Vanilla JavaScript** environments.

- `loggedIn`: `Ref<boolean>` - A shared ref representing the login status.
- `setToLoggedIn()`: `() => void` - Sets `loggedIn` to `true`.
- `setToLoggedOut()`: `() => void` - Sets `loggedIn` to `false`.
- `toggleLoggedIn()`: `() => void` - Toggles the value of `loggedIn`.

## Implementation Details

- Uses `createGlobalState` from `@vueuse/core` to share state across instances.
- Initial state is `false` unless `initialValue` is provided.
- Uses `useToggle` from `@vueuse/core` for `toggleLoggedIn` internally if applicable, or simple logic.

## Usage Example

```vue
<script setup>
import { useSimpleLoggedIn } from '../useSimpleLoggedIn'

const { loggedIn, setToLoggedIn, setToLoggedOut, toggleLoggedIn } = useSimpleLoggedIn()
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
