<script setup lang="ts">
import { ref, unref, onMounted, onUnmounted, type Ref, watch } from 'vue'

const props = defineProps<{
  show: boolean | (() => boolean) | Ref<boolean>
}>()

const isReady = ref(false)
const isVisible = ref(false)

let pollInterval: ReturnType<typeof setInterval> | null = null

function clearPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function evaluateShow(): { ready: boolean; value: boolean } {
  const unwrapped = unref(props.show)
  
  if (typeof unwrapped === 'function') {
    try {
      const result = unwrapped()
      if (typeof result === 'boolean') {
        return { ready: true, value: result }
      }
      return { ready: false, value: false }
    } catch (e) {
      if (e instanceof ReferenceError || e instanceof TypeError) {
        // Expected when waiting on vanilla globals
        return { ready: false, value: false }
      }
      // Re-throw unexpected errors
      throw e
    }
  }

  // Boolean or Ref<boolean> unwrapped naturally
  if (typeof unwrapped === 'boolean') {
    return { ready: true, value: unwrapped }
  }

  // If we passed an object variable string that hasn't populated yet,
  // we can also support polling until that variable exists if requested,
  // but standard v-if resolves undefined to false. Let's lock it to boolean
  // explicitly as stated in the spec.
  if (unwrapped === undefined || unwrapped === null) {
      return { ready: false, value: false }
  }

  return { ready: true, value: Boolean(unwrapped) }
}

function processEvaluation() {
  const { ready, value } = evaluateShow()
  
  if (ready) {
    isVisible.value = value
    isReady.value = true
    clearPolling()
  } else if (!pollInterval) {
    // Start polling if not ready and not already polling
    pollInterval = setInterval(() => {
      const pollResult = evaluateShow()
      if (pollResult.ready) {
        isVisible.value = pollResult.value
        isReady.value = true
        clearPolling()
      }
    }, 50)
  }
}

// Evaluate synchronously once to ensure literal booleans or simple functions
// resolve prior to the initial render, preventing layout shift or SSR mismatches.
const initialCheck = evaluateShow()
if (initialCheck.ready) {
  isReady.value = true
  isVisible.value = initialCheck.value
}

watch(() => props.show, () => {
  // If the prop identity changes, reset and re-evaluate
  isReady.value = false
  clearPolling()
  processEvaluation()
}, { deep: true }) // deep to catch internal Ref changes if needed, although unref handles it

onMounted(() => {
  if (!isReady.value) {
    processEvaluation()
  }
})

onUnmounted(() => {
  clearPolling()
})
</script>

<template>
  <template v-if="isReady">
    <slot v-if="isVisible" />
    <slot v-else name="else" />
  </template>
</template>
