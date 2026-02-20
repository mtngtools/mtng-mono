<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed } from 'vue'
import { useSimpleLoggedIn } from '../../composables/useSimpleLoggedIn'

const props = withDefaults(defineProps<{
  initiallyLoggedIn?: boolean
  addWindowAccess?: boolean
  windowAccessObjectName?: string
  initializeFromWindowAccessObject?: boolean
  initializeWindowAccessObjectName?: string
  waitBehavior?: boolean
}>(), {
  addWindowAccess: false,
  windowAccessObjectName: 'loggedInOut',
  initializeFromWindowAccessObject: false,
  initializeWindowAccessObjectName: 'initialLoggedIn',
  waitBehavior: undefined,
})

const { 
  loggedIn, 
  isInitialized,
  setToLoggedIn, 
  setToLoggedOut, 
  toggleLoggedIn,
  getLoggedIn,
  setLoggedIn,
  setupWindowAccess,
  cleanupWindowAccess
} = useSimpleLoggedIn({
  initialValue: props.initiallyLoggedIn,
  addWindowAccess: props.addWindowAccess,
  windowAccessObjectName: props.windowAccessObjectName,
  initializeFromWindowAccessObject: props.initializeFromWindowAccessObject,
  initializeWindowAccessObjectName: props.initializeWindowAccessObjectName
})

const resolvedWaitBehavior = computed(() => {
  if (props.waitBehavior !== undefined) {
    return props.waitBehavior
  }
  return props.initializeFromWindowAccessObject
})

onMounted(() => {
  if (props.addWindowAccess) {
    setupWindowAccess(props.windowAccessObjectName)
  }
})

onUnmounted(() => {
  cleanupWindowAccess(props.windowAccessObjectName)
})

watch(() => props.addWindowAccess, (newVal) => {
  if (newVal) {
    setupWindowAccess(props.windowAccessObjectName)
  } else {
    cleanupWindowAccess(props.windowAccessObjectName)
  }
})

watch(() => props.windowAccessObjectName, (_newVal, oldVal) => {
  if (props.addWindowAccess) {
    if (oldVal) cleanupWindowAccess(oldVal)
    setupWindowAccess(props.windowAccessObjectName)
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
  <template v-if="!resolvedWaitBehavior || isInitialized">
    <template v-if="loggedIn">
      <slot name="loggedIn" />
    </template>
    <template v-else>
      <slot name="loggedOut" />
    </template>
  </template>
</template>
