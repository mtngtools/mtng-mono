<script setup lang="ts">
import { computed, useSlots } from 'vue'

import SidePanelButtonGroup from '../SidePanelButtonGroup/SidePanelButtonGroup.vue'
import type { SidePanelMode, SidePanelModeResolved, SidePanelModeSelectable } from '../types'

const props = withDefaults(
  defineProps<{
    title?: string
    showTitleLabel?: boolean
    sidePanelMode?: SidePanelMode
    sidePanelModeResolved?: SidePanelModeResolved
    overlayOnly?: boolean
    availableStates?: SidePanelModeSelectable[]
  }>(),
  {
    title: 'Submit Questions',
    showTitleLabel: true,
    sidePanelMode: 'none',
    sidePanelModeResolved: 'none',
    overlayOnly: false,
    availableStates: () => [],
  },
)

const emit = defineEmits<{
  setSidePanelMode: [mode: SidePanelModeSelectable]
  closeSidePanel: []
}>()

const slots = useSlots()
const canRender = computed(() => props.sidePanelModeResolved !== 'none')
const isMinimized = computed(() => props.sidePanelModeResolved === 'minimized')
const hasTitleSlot = computed(() => Boolean(slots.default))
const hasControlsSlot = computed(() => Boolean(slots.controls))
const showDefaultButtonGroup = computed(() => !isMinimized.value)
</script>

<template>
  <header
    v-if="canRender"
    class=""
    :style="{
      display: 'flex',
      // display: 'grid',
      // gridTemplateColumns: 'auto auto',
      // gridTemplateRows: '1fr',      
      height: '100%',
      minHeight: 0,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      overflow: 'hidden',
      padding: '0.25rem 0.5rem',
    }"
  >
    <div
      :style="{
        display: 'flex',
        flex: isMinimized && !hasTitleSlot ? '1 1 auto' : '0 1 auto',
        minWidth: 0,
        minHeight: 0,
        alignItems: 'center',
        justifyContent: isMinimized && !hasTitleSlot ? 'center' : 'flex-start',
        overflow: 'hidden',
      }"
    >
      <slot
        v-if="hasTitleSlot"
        name="default"
      />
      <template v-else>
        <button
          v-if="isMinimized"
          type="button"
          class="text-accent-200 bg-accent/50 hover:bg-accent/90 border-accent hover:text-white hover:border-white"
          :style="{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            borderRadius: '0.375rem 0.375rem 0 0',
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
          @click="emit('setSidePanelMode', 'auto')"
        >
          {{ title }}
        </button>
        <h2
          v-else-if="showTitleLabel"
          class="text-sm font-medium text-neutral-100"
          :style="{
            minWidth: 0,
            minHeight: 0,
            margin: 0,
            textAlign: 'left',
          }"
        >
          {{ title }}:
        </h2>
      </template>
    </div>

    <div
      v-if="hasControlsSlot || showDefaultButtonGroup"
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 0,
        minHeight: 0,
        marginLeft: 'auto',
      }"
    >
      <slot name="controls">
        <SidePanelButtonGroup
          v-if="showDefaultButtonGroup"
          :side-panel-mode="sidePanelMode"
          :side-panel-mode-resolved="sidePanelModeResolved"
          :available-states="availableStates"
          :overlay-only="overlayOnly"
          @set-side-panel-mode="emit('setSidePanelMode', $event)"
          @close-side-panel="emit('closeSidePanel')"
        />
      </slot>
    </div>
  </header>
</template>
