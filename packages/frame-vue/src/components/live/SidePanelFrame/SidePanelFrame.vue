<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

import SidePanelHeader from '../SidePanelHeader/SidePanelHeader.vue'

import type { SidePanelMode, SidePanelModeResolved, SidePanelModeSelectable } from '../types'

const props = withDefaults(
  defineProps<{
    sidePanelMode?: SidePanelMode
    sidePanelModeResolved?: SidePanelModeResolved
    availableStates?: SidePanelModeSelectable[]
    overlayOnly?: boolean
    showTitleLabel?: boolean
    hideIcons?: boolean
    minWidth?: string
    maxWidth?: string
    minHeight?: string
    maxHeight?: string
  }>(),
  {
    sidePanelMode: 'none',
    sidePanelModeResolved: 'none',
    availableStates: () => [],
    overlayOnly: false,
    showTitleLabel: false,
    hideIcons: false,
    minWidth: '320px',
    maxWidth: '30vw',
    minHeight: '200px',
    maxHeight: '30vh',
  },
)

const emit = defineEmits<{
  setSidePanelMode: [mode: SidePanelModeSelectable]
  closeSidePanel: []
}>()

const shouldRender = computed(() => props.sidePanelModeResolved !== 'none')
const isMinimized = computed(() => props.sidePanelModeResolved === 'minimized')

const containerStyle = computed<CSSProperties>(() => {
  const base: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'grid',
    overflow: 'hidden',
    placeItems: 'stretch',
  }

  if (props.sidePanelModeResolved === 'full') {
    return base
  }

  if (props.sidePanelModeResolved === 'right') {
    return base
  }

  if (props.sidePanelModeResolved === 'bottom') {
    return base
  }

  return {
    ...base,
    placeItems: 'end center',
  }
})

const frameSizeStyle = computed<CSSProperties | undefined>(() => {
  if (props.sidePanelModeResolved === 'full') {
    return {
      width: '100%',
      height: '100%',
    }
  }

  if (props.sidePanelModeResolved === 'right') {
    return {
      minWidth: props.minWidth,
      maxWidth: props.maxWidth,
      width: '100%',
    }
  }

  if (props.sidePanelModeResolved === 'bottom') {
    return {
      minHeight: props.minHeight,
      maxHeight: props.maxHeight,
      height: '100%',
      width: '100%',
    }
  }

  return undefined
})

const framePositionStyle = computed<CSSProperties | undefined>(() => {
  if (props.sidePanelModeResolved === 'full' && !props.overlayOnly) {
    return {
      maxWidth: '100%',
      maxHeight: '100%',
      minHeight: 0,
      minWidth: 0,
      overflow: 'hidden',
    }
  }

  return {
    maxWidth: '100%',
    maxHeight: '100%',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  }
})

const frameGridStyle = computed<CSSProperties>(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: isMinimized.value ? 'max-content' : 'max-content minmax(0, 1fr)',
}))

const frameShellClass = computed(() => {
  return props.overlayOnly
    ? 'border-neutral-700 bg-black/95'
    : ''
})
</script>

<template>
  <div
    v-if="shouldRender"
    class=""
    :style="{ width: '100%', height: '100%' }"
  >
    <div :style="containerStyle">
      <section
        data-test="side-panel-frame-shell"
        :class="frameShellClass"
        :style="[framePositionStyle, frameSizeStyle, frameGridStyle]"
      >
        <div
          class=""
          :style="{ gridColumn: '1 / 2', gridRow: '1 / 2', minWidth: 0, minHeight: 0, overflow: 'hidden' }"
        >
          <SidePanelHeader
            :show-title-label="showTitleLabel"
            :side-panel-mode="sidePanelMode"
            :side-panel-mode-resolved="sidePanelModeResolved"
            :available-states="availableStates"
            :overlay-only="overlayOnly"
            :hide-icons="hideIcons"
            @set-side-panel-mode="emit('setSidePanelMode', $event)"
            @close-side-panel="emit('closeSidePanel')"
          />
        </div>

        <div
          v-show="!isMinimized"
          class=""
          :style="{
            gridColumn: '1 / 2',
            gridRow: '2 / 3',
            minWidth: 0,
            minHeight: 0,
            width: '100%',
            height: '100%',
            display: 'grid',
            placeContent: 'stretch',
          }"
        >
          <slot />
        </div>
      </section>
    </div>
  </div>
</template>
