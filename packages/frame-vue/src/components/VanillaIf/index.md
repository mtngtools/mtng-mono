# VanillaIf

A Vue wrapper component that delays rendering its slot content until an asynchronously defined Vanilla JS condition becomes strictly true or false.

## Usage

```html
<!-- Native scripts might load externally -->
<script src="/my-auth.js" async></script>

<div id="app">
  <!-- Vue app goes here -->
</div>
```

```vue
<script setup>
import { VanillaIf } from '@mtngtools/frame-vue'

const isUserExternalAuth = () => window.externalAuthSystem.isLoggedIn()
</script>

<template>
  <VanillaIf :show="isUserExternalAuth">
    <p>User is fully authenticated.</p>
    
    <template #else>
      <p>User is logged out.</p>
    </template>
  </VanillaIf>
</template>
```

If `window.externalAuthSystem` causes a `ReferenceError` or `TypeError` upon mount because the file hasn't fired yet, `VanillaIf` will swallow the error and poll rapidly (50ms interval) until the function returns a firm `boolean`.

## API Settings

- **`show`**: `boolean | (() => boolean) | Ref<boolean>` 
  The condition tracking the display. Only when it resolves strictly to a literal `boolean` does it freeze and render the `default` or `else` views.
