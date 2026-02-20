<script setup lang="ts">
import VanillaIf from './VanillaIf.vue'

// A mock external vanilla function that simulates a delayed response
let isReady = false
let result = false

setTimeout(() => {
  isReady = true
  result = true
}, 2000)

const checkExternalState = () => {
    if (!isReady) throw new ReferenceError('External script not yet loaded')
    return result
}
</script>

<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold">VanillaIf Demo</h1>
    <p class="text-neutral-400">
        This component simulates a vanilla script that is delayed by 2 seconds. 
        Before 2 seconds, `checkExternalState()` throws a ReferenceError.
        The wrapper should swallow it and show nothing until the result is `true`.
    </p>

    <!-- It mounts silently and polls 40 times (50ms * 40 = 2000) until checkExternalState stops throwing. -->
    <VanillaIf :show="checkExternalState">
        <div class="p-4 bg-green-900 border border-green-700 rounded text-green-100">
            ✅ The simulated external state is now loaded and returned <strong>true</strong>!
        </div>

        <template #else>
            <div class="p-4 bg-red-900 border border-red-700 rounded text-red-100">
                ❌ The simulated external state returned <strong>false</strong>.
            </div>
        </template>
    </VanillaIf>
  </div>
</template>
