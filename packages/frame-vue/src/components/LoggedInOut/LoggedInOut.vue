<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useSimpleLoggedIn } from '../../composables/useSimpleLoggedIn'

const props = withDefaults(defineProps<{
  initiallyLoggedIn?: boolean
  addWindowAccess?: boolean
  windowAccessObjectName?: string
}>(), {
  addWindowAccess: false,
  windowAccessObjectName: 'loggedInOut'
})

const { loggedIn, setToLoggedIn, setToLoggedOut, toggleLoggedIn } = useSimpleLoggedIn(props.initiallyLoggedIn)

const getLoggedIn = () => loggedIn.value
const setLoggedIn = (val: boolean) => { loggedIn.value = val }

const setupWindowAccess = () => {
  if (props.addWindowAccess && typeof window !== 'undefined') {
    (window as any)[props.windowAccessObjectName] = {
      setToLoggedIn,
      setToLoggedOut,
      toggleLoggedIn,
      getLoggedIn,
      setLoggedIn,
    }
  }
}

const cleanupWindowAccess = (name = props.windowAccessObjectName) => {
  if (typeof window !== 'undefined' && (window as any)[name]) {
    delete (window as any)[name]
  }
}

onMounted(() => {
  setupWindowAccess()
})

onUnmounted(() => {
  cleanupWindowAccess()
})

watch(() => props.addWindowAccess, (newVal) => {
  if (newVal) {
    setupWindowAccess()
  } else {
    cleanupWindowAccess()
  }
})

watch(() => props.windowAccessObjectName, (_newVal, oldVal) => {
  if (props.addWindowAccess) {
    cleanupWindowAccess(oldVal)
    setupWindowAccess()
  }
})

// Expose methods and state for external (e.g., Vanilla JS) interaction
defineExpose({
  loggedIn,
  setToLoggedIn,
  setToLoggedOut,
  toggleLoggedIn,
  getLoggedIn,
  setLoggedIn,
})
</script>

<template>
  <template v-if="loggedIn">
    <slot name="loggedIn" />
  </template>
  <template v-else>
    <slot name="loggedOut" />
  </template>
</template>
