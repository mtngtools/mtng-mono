# LoggedInOut

A Vue component that conditionally renders content based on the user's login status from `useSimpleLoggedIn`.

## Installation

```bash
npm install @mtngtools/frame-vue
```

## Usage

### In Vue SFC

Use named slots to define what should be shown for logged in vs logged out users.

```vue
<script setup>
import { LoggedInOut } from '@mtngtools/frame-vue'
</script>

<template>
  <LoggedInOut>
    <template #loggedIn>
      <p>Welcome! You have access to restricted data.</p>
    </template>
    <template #loggedOut>
      <p>Please log in to view this content.</p>
    </template>
  </LoggedInOut>
</template>
```

### via Template Ref

You can access the login state and methods directly from the component instance.

```vue
<script setup>
import { ref } from 'vue'
import { LoggedInOut } from '@mtngtools/frame-vue'

const authGuard = ref(null)

const forceLogout = () => {
  authGuard.value?.setToLoggedOut()
}
</script>

<template>
  <LoggedInOut ref="authGuard">
    <!-- ... slots ... -->
  </LoggedInOut>
  <button @click="forceLogout">Admin Logout</button>
</template>
```

### Vanilla JavaScript Integration

You can initialize the shared state natively from outside Vue before the `LoggedInOut` component even mounts. This is especially useful in environments like Astro where you might have backend session data to pass down.

```html
<!-- Set this anywhere before your Vue app mounts -->
<script>
  window.initialLoggedIn = true; // Setup the seed variable
</script>

<div id="app">
  <!-- The Vue application root -->
</div>
```

Then configure the Vue component to look for that global object:

```vue
<template>
  <LoggedInOut initialize-from-window-access-object>
    <!-- Your content -->
  </LoggedInOut>
</template>
```

The component exposes its methods, making it easy to interact with from external scripts after it mounts.

```javascript
// Assuming 'componentInstance' is the mounted LoggedInOut component
console.log('Is logged in?', componentInstance.loggedIn.value)

// Trigger actions
componentInstance.toggleLoggedIn()
componentInstance.setToLoggedIn()
componentInstance.setToLoggedOut()
```

## API

### Slots

| Name | Description |
| --- | --- |
| `loggedIn` | Content shown when `loggedIn` is `true`. |
| `loggedOut` | Content shown when `loggedIn` is `false`. |

### Exposed Properties

| Property | Type | Description |
| --- | --- | --- |
| `loggedIn` | `Ref<boolean>` | Reactive login status. |
| `setToLoggedIn` | `() => void` | Sets status to `true`. |
| `setToLoggedOut` | `() => void` | Sets status to `false`. |
| `toggleLoggedIn` | `() => void` | Toggles status. |
