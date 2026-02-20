<script setup lang="ts">
import { computed } from 'vue'

import SidePanelControlButton from '../SidePanelControlButton/SidePanelControlButton.vue'
import type { SidePanelMode, SidePanelModeResolved, SidePanelModeSelectable } from '../types'

const props = withDefaults(
  defineProps<{
    sidePanelMode?: SidePanelMode
    sidePanelModeResolved?: SidePanelModeResolved
    availableStates?: SidePanelModeSelectable[]
    overlayOnly?: boolean
    hideIcons?: boolean
  }>(),
  {
    sidePanelMode: 'none',
    sidePanelModeResolved: 'none',
    availableStates: () => [],
    overlayOnly: false,
    hideIcons: false,
  },
)

const emit = defineEmits<{
  setSidePanelMode: [mode: SidePanelModeSelectable]
  closeSidePanel: []
}>()

const canRender = computed(() => props.sidePanelModeResolved !== 'none')
const displayStates = computed<SidePanelModeSelectable[]>(() => {
  if (!(props.overlayOnly && props.sidePanelModeResolved === 'full')) {
    return props.availableStates
  }

  return props.availableStates.includes('minimized') ? ['minimized'] : []
})

function setSidePanelMode(mode: SidePanelModeSelectable) {
  emit('setSidePanelMode', mode)
}

function closeSidePanel() {
  emit('closeSidePanel')
}
</script>

<template>
  <slot
    v-if="canRender"
    :side-panel-mode="sidePanelMode"
    :side-panel-mode-resolved="sidePanelModeResolved"
    :available-states="availableStates"
    :overlay-only="overlayOnly"
    :set-side-panel-mode="setSidePanelMode"
    :close-side-panel="closeSidePanel"
  >
    <div
      class=""
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }"
    >
      <SidePanelControlButton
        v-for="state in displayStates"
        :key="state"
        :state="state"
        :active="state === sidePanelMode"
        :active-resolved="state === sidePanelModeResolved"
        :hide-icon="hideIcons"
        @click="setSidePanelMode"
      />
    </div>
  </slot>
</template>
