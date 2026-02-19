# useSimpleLoggedIn

A shared reactive state for basic "logged in" status using Vue Composition API.

## Installation

This composable is part of `@mtngtools/frame-vue`.

```bash
npm install @mtngtools/frame-vue
```

## Usage

### In Vue SFC

The shared state makes it easy to handle login UI across multiple components without complex state management.

```vue
<script setup>
import { useSimpleLoggedIn } from '@mtngtools/frame-vue'

const { loggedIn, setToLoggedIn, setToLoggedOut, toggleLoggedIn } = useSimpleLoggedIn()
</script>

<template>
  <p v-if="loggedIn">Welcome back!</p>
  <button @click="toggleLoggedIn">
    {{ loggedIn ? 'Logout' : 'Login' }}
  </button>
</template>
```

### In Vanilla JavaScript

You can also use this in plain JavaScript files (e.g., in utility functions or non-component logic) since the state is global.

```javascript
import { useSimpleLoggedIn } from '@mtngtools/frame-vue'

const { loggedIn, setToLoggedIn } = useSimpleLoggedIn()

// Access value
console.log('Current status:', loggedIn.value)

// Update status (Choice 1)
// Use helper functions
const changeLoggedInStatusWithFunctions = (isAuth) => {
  if (isAuth) {
    setToLoggedIn()
  } else {
    setToLoggedOut()
  }
}

// Update status (Choice 2)
// Use direct value access
const changeLoggedInStatusWithValue = (isAuth) => {
  loggedIn.value = isAuth
}
```

## API

| Property | Type | Description |
| --- | --- | --- |
| `loggedIn` | `Ref<boolean>` | Reactive ref for login status. |
| `setToLoggedIn` | `() => void` | Helper to set status to `true`. |
| `setToLoggedOut` | `() => void` | Helper to set status to `false`. |
| `toggleLoggedIn` | `() => void` | Helper to toggle the status. |
