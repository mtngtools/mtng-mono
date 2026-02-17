<script setup lang="ts">
import { computed } from 'vue'

import type { SidePanelModeSelectable } from '../types'

const props = withDefaults(
  defineProps<{
    state: SidePanelModeSelectable
    active?: boolean
    activeResolved?: boolean
    disabled?: boolean
  }>(),
  {
    active: false,
    activeResolved: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  click: [state: SidePanelModeSelectable]
}>()

const defaultLabelMap: Record<SidePanelModeSelectable, string> = {
  auto: 'Auto',
  right: 'Right',
  bottom: 'Bottom',
  full: 'Full',
  minimized: 'Close',
}

const label = computed(() => defaultLabelMap[props.state])


const buttonClasses = computed(() => {
  if (props.disabled) {
    return 'cursor-not-allowed border-neutral-700 text-neutral-500';
  } else {
    const common = 'cursor-pointer';
    if (props.activeResolved) {
      return `${common} text-accent-400/80 bg-accent/20 border-accent-900/10`;
    } else {
      return `${common} text-accent-200 bg-accent/50 hover:bg-accent/90 border-accent hover:text-white hover:border-white`;
    }
  }  
})

function handleClick() {
  if (props.disabled) {
    return
  }

  emit('click', props.state)
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="buttonClasses"
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      borderRadius: '0.375rem',
      borderWidth: '1px',
      borderStyle: 'solid',
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem',
      paddingTop: '0.25rem',
      paddingBottom: '0.25rem',
      fontSize: '0.70rem',
      lineHeight: '1.2rem',
      textTransform: 'uppercase',
      // transition: 'color 150ms, background-color 150ms, border-color 150ms',
    }"
    @click="handleClick"
  >
    <slot name="icon" :state="state" />
    <slot name="label" :state="state">{{ label }}</slot>
  </button>
</template>
