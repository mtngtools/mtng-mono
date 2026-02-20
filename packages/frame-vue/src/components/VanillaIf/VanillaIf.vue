<script setup lang="ts">
import { ref, unref, onMounted, onUnmounted, type Ref, watch } from 'vue'

const props = defineProps<{
  show?: boolean | (() => boolean) | Ref<boolean>
  showWindowFn?: string
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
  let toEvaluate: any

  if (typeof window !== 'undefined' && props.showWindowFn) {
     toEvaluate = (window as any)[props.showWindowFn]
  } else {
     toEvaluate = unref(props.show)
  }
  
  if (typeof toEvaluate === 'function') {
    try {
      const result = toEvaluate()
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

  // If we're waiting for a showWindowFn but it's not a function yet, it's not ready
  if (props.showWindowFn) {
    return { ready: false, value: false }
  }

  // Boolean or Ref<boolean> unwrapped naturally
  if (typeof toEvaluate === 'boolean') {
    return { ready: true, value: toEvaluate }
  }

  // If we passed an object variable string that hasn't populated yet,
  // we can also support polling until that variable exists if requested,
  // but standard v-if resolves undefined to false. Let's lock it to boolean
  // explicitly as stated in the spec.
  if (toEvaluate === undefined || toEvaluate === null) {
      return { ready: false, value: false }
  }

  return { ready: true, value: Boolean(toEvaluate) }
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

watch(() => [props.show, props.showWindowFn], () => {
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
