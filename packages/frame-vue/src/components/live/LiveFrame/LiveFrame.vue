<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch, Comment, Text, type CSSProperties, type VNode } from 'vue'

import SidePanelFrame from '../SidePanelFrame/SidePanelFrame.vue'
import type {
  SidePanelAvailableStatesPayload,
  SidePanelMode,
  SidePanelModeResolved,
  SidePanelModeSelectable,
  SidePanelTransitionPayload,
} from '../types'

const props = withDefaults(
  defineProps<{
    sidePanelPosition?: SidePanelModeSelectable
    mainContentAspectRatio?: string | number
    autoBottomAspectRatioBreakpoint?: number
    autoRightAspectRatioBreakpoint?: number
    sidePanelBreakpoint?: string
    controlsOverlayOnly?: string
    autoHideTimeout?: number
    layoutDebounceMs?: number
    sidePanelMinRight?: string
    sidePanelMaxRight?: string
    sidePanelMaxRightWide?: string
    sidePanelMinBottom?: string
    sidePanelMaxBottom?: string
    sidePanelMaxBottomTall?: string
    headerHideWidthThreshold?: string
    headerHideHeightThreshold?: string
  }>(),
  {
    sidePanelPosition: 'minimized',
    mainContentAspectRatio: '16/9',
    autoBottomAspectRatioBreakpoint: 0.9,
    autoRightAspectRatioBreakpoint: 3.2,
    sidePanelBreakpoint: 'md',
    controlsOverlayOnly: 'sm',
    autoHideTimeout: 5000,
    layoutDebounceMs: 50,
    sidePanelMinRight: '20rem',
    sidePanelMaxRight: '30vw',
    sidePanelMaxRightWide: '40vw',
    sidePanelMinBottom: '12.5rem',
    sidePanelMaxBottom: '30vh',
    sidePanelMaxBottomTall: '60vh',
    headerHideWidthThreshold: '50rem',
    headerHideHeightThreshold: '40rem',
  },
)

const emit = defineEmits<{
  'update:sidePanelPosition': [mode: SidePanelModeSelectable]
  sidePanelTransition: [payload: SidePanelTransitionPayload]
  sidePanelAvailableStates: [payload: SidePanelAvailableStatesPayload]
  defaultSlotResize: [payload: { width: number; height: number }]
}>()

const slots = useSlots()

const rootRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const defaultRef = ref<HTMLElement | null>(null)

const viewportWidth = ref(0)
const viewportHeight = ref(0)
const headerHeight = ref(0)
// Measures: width/height of Default slot (article region)
const defaultWidth = ref(0)
const defaultHeight = ref(0)

/**
 * Enforces the measured container height onto the direct children of the slot.
 * This is necessary for some web components that don't correctly respect fluid
 * grid/flex container constraints or default to inline/intrinsic sizes.
 */
function enforceSlotChildSizing() {
  const container = defaultRef.value
  if (!container) return

  const children = Array.from(container.children) as HTMLElement[]
  const h = `${defaultHeight.value}px`

  children.forEach((child) => {
    // Only apply if different to avoid unnecessary reflows/jitter
    if (child.style.height !== h) {
      child.style.height = h
    }
  })
}

const sidePanelMode = ref<SidePanelMode>('none')
const sidePanelModeResolved = ref<SidePanelModeResolved>('none')
const availableStates = ref<SidePanelModeSelectable[]>([])
const autoResolutionReason = ref<'tall-bottom' | 'wide-right' | 'mixed' | 'none'>('none')

const controlsVisible = ref(true)
const hasMounted = ref(false)

const breakpointsPx: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

const hasSidePanelSlot = computed(() => {
  if (!slots.sidePanelContent) return false
  const content = slots.sidePanelContent({})
  return content.length > 0 && content.some((node: VNode) => {
    if (node.type === Comment) return false
    if (Array.isArray(node.children) && node.children.length === 0) return false
    if (node.type === Text && !String(node.children).trim()) return false
    return true
  })
})
const hasHeaderSlot = computed(() => Boolean(slots.header))

// User cannot select 'auto' from controls; it is still used internally and when expanding from minimized.
const userSelectableStates = computed(() => availableStates.value.filter(s => s !== 'auto'))

const availableHeight = computed(() => Math.max(0, viewportHeight.value - headerHeight.value))
const overlayOnly = computed(() => viewportWidth.value < parseBreakpointToPx(props.controlsOverlayOnly))
const tallViewportRuleActive = computed(() => {
  if (viewportWidth.value === 0) {
    return false
  }
  return availableHeight.value / viewportWidth.value > 1.1
})

const sidePanelFrameMaxWidth = computed(() => {
  if (sidePanelModeResolved.value === 'right' && autoResolutionReason.value === 'wide-right') {
    return props.sidePanelMaxRightWide
  }
  return props.sidePanelMaxRight
})

const resolvedMainContentAspectRatio = computed(() => parseAspectRatioToDecimal(props.mainContentAspectRatio, 16 / 9))
const mainWidthForBottomSizingPx = computed(() => {
  if (defaultWidth.value > 0) {
    return defaultWidth.value
  }
  return Math.max(1, viewportWidth.value)
})
const requiredMainHeightPx = computed(() => {
  const width = mainWidthForBottomSizingPx.value
  const aspectRatio = resolvedMainContentAspectRatio.value
  return width / aspectRatio + 20
})

const requiredMainHeightForBottomAvailabilityPx = computed(() => {
  const width = Math.max(1, viewportWidth.value)
  const aspectRatio = resolvedMainContentAspectRatio.value
  return width / aspectRatio
})

const requiredBottomMinHeightForAvailabilityPx = computed(() => {
  return parseLengthToPx(props.sidePanelMinBottom, viewportWidth.value, viewportHeight.value)
})

const bottomFitsAvailabilityRule = computed(() => {
  const requiredHeight =
    requiredMainHeightForBottomAvailabilityPx.value + requiredBottomMinHeightForAvailabilityPx.value
  return availableHeight.value >= requiredHeight
})

const bottomPanelMaxHeightByContentPx = computed(() => Math.max(0, availableHeight.value - requiredMainHeightPx.value))

const sidePanelFrameMinHeight = computed(() => {
  if (sidePanelModeResolved.value !== 'bottom') {
    return props.sidePanelMinBottom
  }

  const configuredMinPx = parseLengthToPx(props.sidePanelMinBottom, viewportWidth.value, viewportHeight.value)
  const effectiveMinPx = Math.min(configuredMinPx, sidePanelFrameMaxHeightPx.value)
  return `${Math.max(0, Math.floor(effectiveMinPx))}px`
})

const sidePanelFrameMaxHeightPx = computed(() => {
  const configuredMaxRaw =
    sidePanelModeResolved.value === 'bottom' && autoResolutionReason.value === 'tall-bottom'
      ? props.sidePanelMaxBottomTall
      : props.sidePanelMaxBottom

  const configuredMaxPx = parseLengthToPx(configuredMaxRaw, viewportWidth.value, viewportHeight.value)
  return Math.max(0, Math.min(configuredMaxPx, bottomPanelMaxHeightByContentPx.value))
})

const sidePanelFrameMaxHeight = computed(() => {
  if (sidePanelModeResolved.value !== 'bottom') {
    return props.sidePanelMaxBottom
  }

  return `${Math.max(0, Math.floor(sidePanelFrameMaxHeightPx.value))}px`
})

const mainLayoutStyle = computed<CSSProperties>(() => {
  if (sidePanelModeResolved.value === 'right') {
    return {}
  }

  if (sidePanelModeResolved.value === 'bottom') {
    return {}
  }

  if (sidePanelModeResolved.value === 'full' && !overlayOnly.value) {
    return {
      opacity: 0,
      pointerEvents: 'none',
    }
  }

  return {}
})

// Occlusion only in non-overlay full mode: main and panel are in same cell and main is hidden.
// For right/bottom, main and panel are in separate grid tracks so no overlay; occlusion would cover content and hide its borders.
const mainOcclusionStyle = computed<CSSProperties | null>(() => {
  if (
    !hasSidePanelSlot.value
    || overlayOnly.value
    || sidePanelModeResolved.value === 'none'
    || sidePanelModeResolved.value === 'minimized'
    || sidePanelModeResolved.value === 'right'
    || sidePanelModeResolved.value === 'bottom'
  ) {
    return null
  }

  // full mode: panel covers main; full-area occlusion behind panel chrome if needed
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    pointerEvents: 'none',
  }
})

const articleTrackStyle = computed<CSSProperties>(() => {
  if (
    !hasSidePanelSlot.value
    || sidePanelModeResolved.value === 'none'
    || sidePanelModeResolved.value === 'full'
  ) {
    return { gridTemplate: '1fr / 1fr' }
  }

  if (sidePanelModeResolved.value === 'right') {
    return {
      gridTemplateRows: '1fr',
      gridTemplateColumns: `minmax(0, 1fr) max(${props.sidePanelMinRight}, ${sidePanelFrameMaxWidth.value})`,
    }
  }

  if (sidePanelModeResolved.value === 'bottom') {
    return {
      gridTemplateRows: `minmax(0, 1fr) ${sidePanelFrameMaxHeight.value}`,
      gridTemplateColumns: '1fr',
    }
  }

  if (sidePanelModeResolved.value === 'minimized') {
    return {
      gridTemplateRows: '1fr 34px',
      gridTemplateColumns: '1fr',
    }
  }

  return { gridTemplate: '1fr / 1fr' }
})

const sidePanelMountStyle = computed<CSSProperties>(() => {
  const baseStyle: CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    width: '100%',
    height: '100%',
    placeSelf: 'stretch',
    zIndex: 20,
  }

  if (hasSidePanelSlot.value) {
    if (sidePanelModeResolved.value === 'right') {
      return {
        ...baseStyle,
        gridColumn: '2 / 3',
        gridRow: '1 / 2',
      }
    }

    if (sidePanelModeResolved.value === 'full') {
      return {
        ...baseStyle,
        gridColumn: '1 / 2',
        gridRow: '1 / 2',
      }
    }
  }

  //should always be this unless right or full
  return {
    ...baseStyle,
    gridColumn: '1 / 2',
    gridRow: '2 / 3',
  }
})

const rootLayoutStyle = computed<CSSProperties>(() => {
  const baseStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  }

  if (hasHeaderSlot.value) {
    return {
      ...baseStyle,
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
    }
  }

  return {
    ...baseStyle,
    display: 'block',
  }
})

const articleLayoutStyle = computed<CSSProperties>(() => {
  if (hasHeaderSlot.value) {
    return {
      position: 'relative',
      zIndex: 0,
      display: 'grid',
      ...articleTrackStyle.value,
      gridRow: '2 / 3',
      minWidth: 0,
      minHeight: 0,
      overflow: 'hidden',
    }
  }

  return {
    position: 'absolute',
    zIndex: 0,
    display: 'grid',
    ...articleTrackStyle.value,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
  }
})

const showOverlayControls = computed(() => !overlayOnly.value || controlsVisible.value)

let resizeObserver: ResizeObserver | null = null
let recalcTimer: ReturnType<typeof setTimeout> | undefined
let autoHideTimer: ReturnType<typeof setTimeout> | undefined
let removeInteractionListeners: (() => void) | null = null
let lastAvailabilityKey = ''
let hasEmittedNoneAvailability = false

function parseBreakpointToPx(input: string): number {
  const namedValue = breakpointsPx[input]
  if (namedValue !== undefined) {
    return namedValue
  }

  if (input.endsWith('px')) {
    const value = Number.parseFloat(input)
    return Number.isFinite(value) ? value : 0
  }

  const numeric = Number.parseFloat(input)
  return Number.isFinite(numeric) ? numeric : 0
}

function parseAspectRatioToDecimal(input: string | number, fallback: number): number {
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? input : fallback
  }

  const normalized = String(input).trim()
  if (normalized.includes('/')) {
    const parts = normalized.split('/', 2)
    const numeratorRaw = parts[0] ?? ''
    const denominatorRaw = parts[1] ?? ''
    const numerator = Number.parseFloat(numeratorRaw)
    const denominator = Number.parseFloat(denominatorRaw)
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && numerator > 0 && denominator > 0) {
      return numerator / denominator
    }
    return fallback
  }

  const asNumber = Number.parseFloat(normalized)
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber
  }

  return fallback
}

function parseLengthToPx(input: string, viewportWidthPx: number, viewportHeightPx: number): number {
  const normalized = input.trim()
  if (normalized.endsWith('px')) {
    const value = Number.parseFloat(normalized)
    return Number.isFinite(value) ? value : 0
  }

  if (normalized.endsWith('vh')) {
    const value = Number.parseFloat(normalized)
    return Number.isFinite(value) ? (viewportHeightPx * value) / 100 : 0
  }

  if (normalized.endsWith('vw')) {
    const value = Number.parseFloat(normalized)
    return Number.isFinite(value) ? (viewportWidthPx * value) / 100 : 0
  }

  const asNumber = Number.parseFloat(normalized)
  return Number.isFinite(asNumber) ? asNumber : 0
}

function buildAutoResolution(): { states: SidePanelModeSelectable[]; resolved: SidePanelModeResolved } {
  const width = Math.max(1, viewportWidth.value)
  const height = Math.max(1, availableHeight.value)

  const bottomRatio = width / height
  const rightRatio = width / height
  const sidePanelBp = parseBreakpointToPx(props.sidePanelBreakpoint)
  const bottomAvailable = bottomFitsAvailabilityRule.value

  if (bottomRatio < props.autoBottomAspectRatioBreakpoint && bottomAvailable) {
    autoResolutionReason.value = 'tall-bottom'
    return {
      states: ['auto', 'full', 'bottom', 'minimized'],
      resolved: 'bottom',
    }
  }

  if (rightRatio > props.autoRightAspectRatioBreakpoint) {
    autoResolutionReason.value = 'wide-right'
    return {
      states: ['auto', 'full', 'right', 'minimized'],
      resolved: 'right',
    }
  }

  autoResolutionReason.value = 'mixed'
  if (width >= sidePanelBp) {
    return {
      states: bottomAvailable
        ? ['auto', 'full', 'bottom', 'right', 'minimized']
        : ['auto', 'full', 'right', 'minimized'],
      resolved: 'right',
    }
  }

  return {
    states: ['auto', 'full', 'minimized'],
    resolved: 'full',
  }
}

function emitTransitionIfNeeded(previousResolved: SidePanelModeResolved, nextResolved: SidePanelModeResolved, reason: string) {
  if (previousResolved === nextResolved || nextResolved === 'none' || !hasSidePanelSlot.value) {
    return
  }

  emit('sidePanelTransition', {
    from: previousResolved,
    to: nextResolved,
    reason,
  })
}

function emitAvailabilityIfNeeded(force = false) {
  const payload: SidePanelAvailableStatesPayload = {
    availableStates: hasSidePanelSlot.value ? [...userSelectableStates.value] : [],
    sidePanelMode: hasSidePanelSlot.value ? sidePanelMode.value : 'none',
    sidePanelModeResolved: hasSidePanelSlot.value ? sidePanelModeResolved.value : 'none',
    overlayOnly: overlayOnly.value,
  }

  if (!hasSidePanelSlot.value) {
    if (hasEmittedNoneAvailability) {
      return
    }
    hasEmittedNoneAvailability = true
    emit('sidePanelAvailableStates', payload)
    return
  }

  hasEmittedNoneAvailability = false
  const key = JSON.stringify(payload)

  if (!force && key === lastAvailabilityKey) {
    return
  }

  lastAvailabilityKey = key
  emit('sidePanelAvailableStates', payload)
}

function applyStateRules(reason: string) {
  const previousResolved = sidePanelModeResolved.value

  if (!hasSidePanelSlot.value) {
    sidePanelMode.value = 'none'
    sidePanelModeResolved.value = 'none'
    availableStates.value = []
    emitAvailabilityIfNeeded()
    return
  }

  const autoResult = buildAutoResolution()
  availableStates.value = autoResult.states

  const current = sidePanelMode.value === 'none' ? 'auto' : sidePanelMode.value

  if (current !== 'auto' && !availableStates.value.includes(current)) {
    sidePanelMode.value = 'auto'
    emit('update:sidePanelPosition', 'auto')
  } else {
    sidePanelMode.value = current
  }

  sidePanelModeResolved.value =
    sidePanelMode.value === 'auto' ? autoResult.resolved : (sidePanelMode.value as SidePanelModeResolved)

  emitTransitionIfNeeded(previousResolved, sidePanelModeResolved.value, reason)
  emitAvailabilityIfNeeded(hasMounted.value === false)
}

function scheduleRecalculate(reason: string, immediate = false) {
  if (recalcTimer) {
    clearTimeout(recalcTimer)
    recalcTimer = undefined
  }

  if (immediate || !hasMounted.value) {
    applyStateRules(reason)
    return
  }

  recalcTimer = setTimeout(() => {
    applyStateRules(reason)
  }, props.layoutDebounceMs)
}

function setSidePanelMode(requestedMode: SidePanelModeSelectable) {
  if (!hasSidePanelSlot.value) {
    return
  }

  const modeToApply = availableStates.value.includes(requestedMode) ? requestedMode : 'auto'
  if (modeToApply !== sidePanelMode.value) {
    sidePanelMode.value = modeToApply
    emit('update:sidePanelPosition', modeToApply)
  }

  scheduleRecalculate('set-side-panel-mode', true)
}

function closeSidePanel() {
  if (!hasSidePanelSlot.value || !overlayOnly.value) {
    return
  }

  setSidePanelMode('minimized')
}

function clearAutoHideTimer() {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = undefined
  }
}

function startAutoHideTimer() {
  clearAutoHideTimer()

  if (!overlayOnly.value || tallViewportRuleActive.value || sidePanelModeResolved.value === 'none') {
    controlsVisible.value = true
    return
  }

  autoHideTimer = setTimeout(() => {
    controlsVisible.value = false
  }, props.autoHideTimeout)
}

function showControlsAndRestartTimer() {
  controlsVisible.value = true
  startAutoHideTimer()
}

function bindActivityListeners() {
  if (!rootRef.value) {
    return
  }

  const events: Array<keyof HTMLElementEventMap> = ['mousemove', 'click', 'scroll', 'keydown', 'touchstart']

  const handler = () => {
    showControlsAndRestartTimer()
  }

  for (const eventName of events) {
    rootRef.value.addEventListener(eventName, handler, { passive: true })
  }

  removeInteractionListeners = () => {
    if (!rootRef.value) {
      return
    }
    for (const eventName of events) {
      rootRef.value.removeEventListener(eventName, handler)
    }
  }
}

function updateViewportSize() {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
  scheduleRecalculate('viewport-resize')
}

watch(
  () => props.sidePanelPosition,
  (mode) => {
    if (!hasSidePanelSlot.value) {
      sidePanelMode.value = 'none'
      return
    }

    sidePanelMode.value = mode
    scheduleRecalculate('prop-sync')
  },
  { immediate: true },
)

watch(
  hasSidePanelSlot,
  (hasSlot) => {
    if (!hasSlot) {
      sidePanelMode.value = 'none'
      sidePanelModeResolved.value = 'none'
      availableStates.value = []
      emitAvailabilityIfNeeded()
      return
    }

    sidePanelMode.value = props.sidePanelPosition
    scheduleRecalculate('slot-state-change', true)
  },
  { immediate: true },
)

watch(
  () => [overlayOnly.value, props.autoHideTimeout, sidePanelModeResolved.value],
  () => {
    if (sidePanelModeResolved.value === 'full') {
      startAutoHideTimer()
      return
    }
    showControlsAndRestartTimer()
  },
)

watch(tallViewportRuleActive, (isTall, wasTall) => {
  if (isTall) {
    controlsVisible.value = true
    clearAutoHideTimer()
    return
  }

  if (wasTall) {
    showControlsAndRestartTimer()
  }
})

watch(
  () => [defaultWidth.value, defaultHeight.value, sidePanelModeResolved.value, hasSidePanelSlot.value],
  () => {
    if (!hasSidePanelSlot.value || sidePanelModeResolved.value === 'none') {
      return
    }

    emit('defaultSlotResize', {
      width: defaultWidth.value,
      height: defaultHeight.value,
    })
  },
)

onMounted(async () => {
  hasMounted.value = true

  updateViewportSize()
  window.addEventListener('resize', updateViewportSize)

  bindActivityListeners()
  showControlsAndRestartTimer()

  await nextTick()

  resizeObserver = new ResizeObserver(() => {
    headerHeight.value = headerRef.value?.offsetHeight ?? 0
    defaultWidth.value = defaultRef.value?.offsetWidth ?? 0
    defaultHeight.value = defaultRef.value?.offsetHeight ?? 0
    enforceSlotChildSizing()
    scheduleRecalculate('slot-measure')
  })

  if (headerRef.value) {
    resizeObserver.observe(headerRef.value)
  }

  if (defaultRef.value) {
    resizeObserver.observe(defaultRef.value)
    defaultWidth.value = defaultRef.value.offsetWidth
    defaultHeight.value = defaultRef.value.offsetHeight
  }

  headerHeight.value = headerRef.value?.offsetHeight ?? 0
  scheduleRecalculate('mounted', true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportSize)
  removeInteractionListeners?.()
  removeInteractionListeners = null
  resizeObserver?.disconnect()
  resizeObserver = null
  clearAutoHideTimer()

  if (recalcTimer) {
    clearTimeout(recalcTimer)
    recalcTimer = undefined
  }
})
</script>

<template>
  <section
    ref="rootRef"
    class="bg-black text-neutral-100"
    :style="{
      ...rootLayoutStyle,
    }"
  >
    <header
      v-if="hasHeaderSlot"
      v-show="showOverlayControls"
      ref="headerRef"
      class=""
      :style="{
        position: 'relative',
        width: '100%',
        gridRow: '1 / 2',
        zIndex: 40,
      }"
    >
      <component :is="'style'">
        #header-outer { display: none; }
        @media (min-width: {{ props.headerHideWidthThreshold }}) and (min-height: {{ props.headerHideHeightThreshold }}) {
          #header-outer { display: block; }
        }
      </component>
      <div
        id="header-outer"
        :style="{ position: 'relative', width: '100%', margin: 0, padding: 0 }"
      >
        <slot name="header" />
      </div>
    </header>

    <article
      class=""
      :style="{
        ...articleLayoutStyle,        
      }"
    >
      <main
        ref="defaultRef"
        class="slot-content-container"
        :style="{
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'stretch',
          minHeight: 0,
          overflow: 'hidden',
          gridColumn: '1 / 2',
          gridRow: '1 / 2',
          zIndex: 0,
          ...mainLayoutStyle,          
        }"
      >
        <slot />
      </main>

      <div
        v-if="mainOcclusionStyle"
        class="bg-black"
        :style="{ 
          ...mainOcclusionStyle, 
          gridColumn: '1 / 2', 
          gridRow: '1 / 2' }"
      />

      <div
        v-if="hasSidePanelSlot && sidePanelModeResolved !== 'none'"
        class=""
        :style="sidePanelMountStyle"
      >
        <SidePanelFrame
          :side-panel-mode="sidePanelMode"
          :side-panel-mode-resolved="sidePanelModeResolved"
          :available-states="userSelectableStates"
          :overlay-only="overlayOnly"
          :min-width="sidePanelMinRight"
          :max-width="sidePanelFrameMaxWidth"
          :min-height="sidePanelFrameMinHeight"
          :max-height="sidePanelFrameMaxHeight"
          @set-side-panel-mode="setSidePanelMode"
          @close-side-panel="closeSidePanel"
        >
          <slot name="sidePanelContent" />
        </SidePanelFrame>
      </div>
    </article>
  </section>
</template>

<style scoped>
/* 
  Force slotted children to participate in the grid and fill it correctly.
  Web components often default to display: inline which prevents them from 
  respecting box-sizing and height constraints.
*/
.slot-content-container > :slotted(*) {
  display: block !important;
  width: 100% !important;
  max-height: 100% !important;
  min-height: 0 !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
</style>
