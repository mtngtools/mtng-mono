import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect } from 'vitest'

import LiveFrame from './LiveFrame.vue'
import {
  describeLiveScenarioSequence,
  type LiveBrowserSize,
  type LiveScenarioContext,
  type LiveScenarioExpectation,
  type MountAndRunScenariosConfig,
} from '../spec/test-utils/liveScenarioRunner'

export class ResizeObserverMock {
  static callback: ((entries: any[]) => void) | null = null
  constructor(cb: (entries: any[]) => void) {
    ResizeObserverMock.callback = cb
  }
  observe() { }
  disconnect() {
    ResizeObserverMock.callback = null
  }
  unobserve() { }
}

type BorderSide = 'top' | 'right' | 'bottom' | 'left'
type BorderColors = Record<BorderSide, string>
type DiffComparison = 'lt' | 'lte' | 'eq' | 'gte' | 'gt'
type ExpectedAutoResolvedMode = 'bottom' | 'right' | 'full' | 'minimized'
type BreakPointScenarioBucket
  = 'taller-than-auto-bottom'
  | 'wider-than-auto-right'
  | 'between-ratios-narrower-than-controls-overlay-only'
  | 'between-ratios-wider-than-side-panel-breakpoint'
  | 'between-ratios-between-controls-and-side-panel-breakpoints'

interface BorderFixtureContext {
  wrapper: VueWrapper
  mainElement: HTMLElement
  defaultContent: HTMLElement
  /** Present in non-minimized states; null when minimized (slot content not rendered). */
  sidePanelContent: HTMLElement | null
  sidePanelFrame: HTMLElement
  sidePanelHeader: HTMLElement
}

export interface SidePanelAvailabilityPayload {
  availableStates: string[]
  sidePanelMode: string
  sidePanelModeResolved: string
  overlayOnly: boolean
}

export interface BreakPointScenarioSize {
  describeLabel: string
  bucket: BreakPointScenarioBucket
  size: LiveBrowserSize
  expectOverlayOnly: boolean
  expectedAutoResolvedMode: ExpectedAutoResolvedMode
}

export interface BorderFixtureAssertion {
  label: string
  run: (ctx: BorderFixtureContext) => void
}

function assertLoopIntent(scopeLabel: string, itemCount: number) {
  if (!scopeLabel) {
    throw new Error('Loop scope label must describe assertion intent')
  }
  if (itemCount <= 0) {
    throw new Error(`${scopeLabel}: expected at least one item to iterate`)
  }
}

const DEFAULT_CONTENT_BORDER_COLORS: BorderColors = {
  top: '#ff2d55',
  right: '#7c3aed',
  bottom: '#00c2ff',
  left: '#22c55e',
}

const SIDE_PANEL_CONTENT_BORDER_COLORS: BorderColors = {
  top: '#f59e0b',
  right: '#ef4444',
  bottom: '#14b8a6',
  left: '#3b82f6',
}

const EXPECTED_BREAKPOINT_SCENARIO_COUNT = 5

const BREAKPOINT_SCENARIO_SIZES: BreakPointScenarioSize[] = [
  {
    describeLabel: 'taller `autoBottomAspectRatioBreakpoint` (900x1400)',
    bucket: 'taller-than-auto-bottom',
    size: { width: 900, height: 1400 },
    expectOverlayOnly: false,
    expectedAutoResolvedMode: 'bottom',
  },
  {
    describeLabel: 'wider `autoRightAspectRatioBreakpoint` (1600x500)',
    bucket: 'wider-than-auto-right',
    size: { width: 1600, height: 500 },
    expectOverlayOnly: false,
    expectedAutoResolvedMode: 'right',
  },
  {
    describeLabel: 'between ratios narrower `controlsOverlayOnly` (500x400)',
    bucket: 'between-ratios-narrower-than-controls-overlay-only',
    size: { width: 500, height: 400 },
    expectOverlayOnly: true,
    expectedAutoResolvedMode: 'full',
  },
  {
    describeLabel: 'between ratios wider `sidePanelBreakpoint` (1000x600)',
    bucket: 'between-ratios-wider-than-side-panel-breakpoint',
    size: { width: 1000, height: 600 },
    expectOverlayOnly: false,
    expectedAutoResolvedMode: 'right',
  },
  {
    describeLabel: 'between ratios between `controlsOverlayOnly` and `sidePanelBreakpoint` (700x600)',
    bucket: 'between-ratios-between-controls-and-side-panel-breakpoints',
    size: { width: 700, height: 600 },
    expectOverlayOnly: false,
    expectedAutoResolvedMode: 'full',
  },
]

function buildBorderFixtureStyle(borderColors: BorderColors, backgroundColor: string): string {
  return `
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-top: 8px solid ${borderColors.top};
    border-right: 8px solid ${borderColors.right};
    border-bottom: 8px solid ${borderColors.bottom};
    border-left: 8px solid ${borderColors.left};
    padding: 1rem;
    background: ${backgroundColor};
  `
}

function expectBorderStyleToMatch(element: HTMLElement, borderColors: BorderColors) {
  const normalizedStyle = (element.getAttribute('style') ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
  const styleLower = normalizedStyle

  expect(styleLower).toContain('width: 100%;')
  expect(styleLower).toContain('height: 100%;')
  expect(styleLower).toContain('box-sizing: border-box;')
  // Fixture uses longhand border-top/right/bottom/left; browser may serialize as hex or rgb().
  const hasShorthandBorderColor = styleLower.includes(
    `border-color: ${borderColors.top} ${borderColors.right} ${borderColors.bottom} ${borderColors.left};`.toLowerCase(),
  )
  const hexColors = [
    borderColors.top.toLowerCase(),
    borderColors.right.toLowerCase(),
    borderColors.bottom.toLowerCase(),
    borderColors.left.toLowerCase(),
  ]
  const hasLonghandHex = hexColors.every(c => styleLower.includes(c))
  // getComputedStyle can return rgb(r,g,b) for borders; check computed values match expected hex.
  const computed = element.ownerDocument.defaultView?.getComputedStyle(element)
  const computedColors = computed
    ? [
      computed.borderTopColor,
      computed.borderRightColor,
      computed.borderBottomColor,
      computed.borderLeftColor,
    ]
    : []
  const hexToRgb = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`
  }
  const expectedRgbs = hexColors.map(c => hexToRgb(c.startsWith('#') ? c : `#${c}`))
  const computedMatches = computedColors.length === 4 && computedColors.every((c, i) => c === expectedRgbs[i])
  expect(
    hasShorthandBorderColor || hasLonghandHex || computedMatches,
    'Border colors must appear in style or computed style',
  ).toBe(true)
}

function getRequiredElement(wrapper: VueWrapper, selector: string, label: string): HTMLElement {
  const node = wrapper.find(selector)
  expect(node.exists(), `Expected ${label} (${selector}) to exist`).toBe(true)
  return node.element as HTMLElement
}

function edgeValue(rect: DOMRect, side: BorderSide): number {
  if (side === 'left') {
    return rect.left
  }
  if (side === 'right') {
    return rect.right
  }
  if (side === 'top') {
    return rect.top
  }
  return rect.bottom
}

function assertDiffComparison(
  actual: number,
  comparison: DiffComparison,
  expected: number,
  label: string,
  tolerancePx: number,
) {
  const describeBase = `Diff comparison for "${label}"`

  if (comparison === 'lt') {
    const describeLabel = `${describeBase} [less-than]`
    expect(actual, `${describeLabel}: expected ${actual} < ${expected}`).toBeLessThan(expected)
    return
  }
  if (comparison === 'lte') {
    const describeLabel = `${describeBase} [less-than-or-equal]`
    expect(actual, `${describeLabel}: expected ${actual} <= ${expected}`).toBeLessThanOrEqual(expected)
    return
  }
  if (comparison === 'gt') {
    const describeLabel = `${describeBase} [greater-than]`
    expect(actual, `${describeLabel}: expected ${actual} > ${expected}`).toBeGreaterThan(expected)
    return
  }
  if (comparison === 'gte') {
    const describeLabel = `${describeBase} [greater-than-or-equal]`
    expect(actual, `${describeLabel}: expected ${actual} >= ${expected}`).toBeGreaterThanOrEqual(expected)
    return
  }

  const describeLabel = `${describeBase} [equal-with-tolerance]`
  const diff = Math.abs(actual - expected)
  expect(
    diff,
    `${describeLabel}: expected ${actual} ~= ${expected} within tolerance ${tolerancePx}`,
  ).toBeLessThanOrEqual(tolerancePx)
}

// @ts-ignore
function logBorderEdgeComparison(params: {
  target: 'side-panel-content' | 'side-panel-frame' | 'side-panel-header'
  label: string
  contentEdge: BorderSide
  sidePanelEdge: BorderSide
  comparison: DiffComparison
  expected: number
  tolerancePx: number
  contentEdgeValue: number
  sidePanelEdgeValue: number
  actualDiff: number
}) {
  // Intentionally verbose for debugging live geometry assertions in Vitest UI.
  console.log(
    '[liveframe-border-diff]',
    JSON.stringify(
      {
        target: params.target,
        label: params.label,
        contentEdge: params.contentEdge,
        sidePanelEdge: params.sidePanelEdge,
        comparison: params.comparison,
        expected: params.expected,
        tolerancePx: params.tolerancePx,
        contentEdgeValue: params.contentEdgeValue,
        sidePanelEdgeValue: params.sidePanelEdgeValue,
        actualDiff: params.actualDiff,
      },
      null,
      2,
    ),
  )
}

export function expectedLocOfContentBorderVSidePanelBorderDiff(
  contentEdge: BorderSide,
  sidePanelEdge: BorderSide,
  comparison: DiffComparison,
  expected: number,
  options?: { tolerancePx?: number; label?: string },
): BorderFixtureAssertion {
  const tolerancePx = options?.tolerancePx ?? 0.5
  const label = options?.label
    ?? `content-${contentEdge}-vs-side-panel-${sidePanelEdge} diff ${comparison} ${expected}`

  return {
    label,
    run: ({ defaultContent, sidePanelContent }) => {
      if (sidePanelContent == null) return
      const contentRect = defaultContent.getBoundingClientRect()
      const sidePanelRect = sidePanelContent.getBoundingClientRect()
      const contentEdgeValue = edgeValue(contentRect, contentEdge)
      const sidePanelEdgeValue = edgeValue(sidePanelRect, sidePanelEdge)
      const actualDiff = contentEdgeValue - sidePanelEdgeValue
      // logBorderEdgeComparison({
      //   target: 'side-panel-content',
      //   label,
      //   contentEdge,
      //   sidePanelEdge,
      //   comparison,
      //   expected,
      //   tolerancePx,
      //   contentEdgeValue,
      //   sidePanelEdgeValue,
      //   actualDiff,
      // })
      assertDiffComparison(actualDiff, comparison, expected, label, tolerancePx)
    },
  }
}

export function expectedLocOfContentBorderVSidePanelFrameDiff(
  contentEdge: BorderSide,
  sidePanelEdge: BorderSide,
  comparison: DiffComparison,
  expected: number,
  options?: { tolerancePx?: number; label?: string },
): BorderFixtureAssertion {
  const tolerancePx = options?.tolerancePx ?? 0.5
  const label = options?.label
    ?? `content-${contentEdge}-vs-side-panel-frame-${sidePanelEdge} diff ${comparison} ${expected}`

  return {
    label,
    run: ({ defaultContent, sidePanelFrame }) => {
      const contentRect = defaultContent.getBoundingClientRect()
      const sidePanelFrameRect = sidePanelFrame.getBoundingClientRect()
      const contentEdgeValue = edgeValue(contentRect, contentEdge)
      const sidePanelEdgeValue = edgeValue(sidePanelFrameRect, sidePanelEdge)
      const actualDiff = contentEdgeValue - sidePanelEdgeValue
      logBorderEdgeComparison({
        target: 'side-panel-frame',
        label,
        contentEdge,
        sidePanelEdge,
        comparison,
        expected,
        tolerancePx,
        contentEdgeValue,
        sidePanelEdgeValue,
        actualDiff,
      })
      assertDiffComparison(actualDiff, comparison, expected, label, tolerancePx)
    },
  }
}

export function expectBorderFixturesWithAssertions(
  wrapper: VueWrapper,
  assertions: BorderFixtureAssertion[],
  options?: { requireSidePanelContent?: boolean },
) {
  const assertionScope = 'Checking border visibility, placement, and edge relationships'
  assertLoopIntent(assertionScope, assertions.length)
  const requireSidePanelContent = options?.requireSidePanelContent !== false

  const mainElement = getRequiredElement(wrapper, 'main', 'main region')
  const defaultContent = getRequiredElement(wrapper, '[data-test="default-content"]', 'default content fixture')
  const sidePanelFrame = getRequiredElement(wrapper, '[data-test="side-panel-frame-shell"]', 'side panel frame shell')
  const sidePanelHeader = getRequiredElement(wrapper, '[data-test="side-panel-frame-shell"] header', 'side panel header')

  const sidePanelContentNode = wrapper.find('[data-test="side-panel-content"]')
  const sidePanelContent =
    requireSidePanelContent
      ? (getRequiredElement(wrapper, '[data-test="side-panel-content"]', 'side panel content fixture') as HTMLElement)
      : (sidePanelContentNode.exists() ? (sidePanelContentNode.element as HTMLElement) : null)

  const context: BorderFixtureContext = {
    wrapper,
    mainElement,
    defaultContent,
    sidePanelContent,
    sidePanelFrame,
    sidePanelHeader,
  }

  for (const [index, assertion] of assertions.entries()) {
    expect(
      assertion.label,
      `${assertionScope}: assertion ${index + 1} must include a descriptive label`,
    ).toBeTruthy()
    assertion.run(context)
  }
}

export function getLatestAvailabilityPayload(wrapper: VueWrapper): SidePanelAvailabilityPayload {
  const emitted = wrapper.emitted('sidePanelAvailableStates') ?? []
  expect(emitted.length, 'Expected sidePanelAvailableStates to be emitted').toBeGreaterThan(0)

  const latestEmissionArgs = emitted[emitted.length - 1]
  const payload = latestEmissionArgs?.[0] as SidePanelAvailabilityPayload | undefined
  expect(payload, 'Expected latest sidePanelAvailableStates payload').toBeDefined()

  return payload!
}

/** Wait for component to emit minimized state so layout assertions run after DOM/state have updated (avoids fake-timer race where we read stale payload and no-op). */
export async function waitForMinimizedState(
  wrapper: VueWrapper,
  maxTicks = 20,
): Promise<void> {
  for (let i = 0; i < maxTicks; i++) {
    await nextTick()
    const payload = getLatestAvailabilityPayload(wrapper)
    if (payload.sidePanelModeResolved === 'minimized') return
  }
  const payload = getLatestAvailabilityPayload(wrapper)
  expect(
    payload.sidePanelModeResolved,
    `Expected sidePanelModeResolved to be 'minimized' after ${maxTicks} ticks (got '${payload.sidePanelModeResolved}')`,
  ).toBe('minimized')
}

/** Assertion for runOncePerResolutionCheck step 3: when minimized, the header expand button (requests 'auto') is visible. */
export function expectHeaderExpandButtonVisibleWhenMinimized(): LiveScenarioExpectation<VueWrapper> {
  return {
    describeLabel: 'side panel header expand button is visible when minimized',
    run: ({ wrapper }) => {
      const frame = wrapper.find('[data-test="side-panel-frame-shell"]')
      expect(frame.exists(), 'Side panel frame shell must exist').toBe(true)
      const headerButton = frame.find('header button')
      expect(
        headerButton.exists(),
        'Header expand button (requests auto) should exist when minimized',
      ).toBe(true)
      expect(headerButton.isVisible()).toBe(true)
    },
  }
}

export function buildBorderVisibilityAndLocationAssertions(): BorderFixtureAssertion[] {
  return [
    {
      label: 'default content border is visible',
      run: ({ wrapper }) => {
        expect(wrapper.find('[data-test="default-content"]').isVisible()).toBe(true)
      },
    },
    {
      label: 'side panel border is visible',
      run: ({ wrapper, sidePanelContent }) => {
        if (sidePanelContent == null) return
        expect(wrapper.find('[data-test="side-panel-content"]').isVisible()).toBe(true)
      },
    },
    {
      label: 'side panel frame shell is visible',
      run: ({ wrapper }) => {
        expect(wrapper.find('[data-test="side-panel-frame-shell"]').isVisible()).toBe(true)
      },
    },
    {
      label: 'side panel frame has visible size (non-overlay only)',
      run: ({ wrapper, sidePanelFrame }) => {
        const payload = getLatestAvailabilityPayload(wrapper)
        if (payload.overlayOnly) return
        const rect = sidePanelFrame.getBoundingClientRect()
        expect(
          rect.width,
          'side panel frame must have non-zero width when not overlay-only',
        ).toBeGreaterThan(0)
        expect(
          rect.height,
          'side panel frame must have non-zero height when not overlay-only',
        ).toBeGreaterThan(0)
      },
    },
    {
      label: 'default content border is in main',
      run: ({ mainElement, defaultContent }) => {
        expect(mainElement.contains(defaultContent)).toBe(true)
      },
    },
    {
      label: 'side panel border is outside main',
      run: ({ mainElement, sidePanelContent }) => {
        if (sidePanelContent == null) return
        expect(mainElement.contains(sidePanelContent)).toBe(false)
      },
    },
    expectedLocOfContentBorderVSidePanelBorderDiff('top', 'top', 'eq', 0, {
      label: 'top-edge diff between default and side panel is aligned',
    }),
    expectedLocOfContentBorderVSidePanelBorderDiff('bottom', 'bottom', 'eq', 0, {
      label: 'bottom-edge diff between default and side panel is aligned',
    }),
    expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'lte', 0, {
      label: 'left-edge diff is <= 0',
    }),
    expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'gte', 0, {
      label: 'left-edge diff is >= 0',
    }),
    expectedLocOfContentBorderVSidePanelBorderDiff('right', 'right', 'lt', 1, {
      label: 'right-edge diff is < 1',
    }),
    expectedLocOfContentBorderVSidePanelBorderDiff('right', 'right', 'gt', -1, {
      label: 'right-edge diff is > -1',
    }),
    expectedLocOfContentBorderVSidePanelFrameDiff('top', 'top', 'eq', 0, {
      label: 'top-edge diff between default and side panel frame is aligned',
    }),
    expectedLocOfContentBorderVSidePanelFrameDiff('bottom', 'bottom', 'eq', 0, {
      label: 'bottom-edge diff between default and side panel frame is aligned',
    }),
    {
      label: 'content bottom at/above side panel header top (minimized, non-overlay)',
      run: ({ wrapper, defaultContent, sidePanelHeader }) => {
        const payload = getLatestAvailabilityPayload(wrapper)
        if (payload.sidePanelModeResolved !== 'minimized' || payload.overlayOnly) {
          return
        }
        const contentEdge = 'bottom'
        const headerEdge = 'top'
        const contentRect = defaultContent.getBoundingClientRect()
        const headerRect = sidePanelHeader.getBoundingClientRect()
        const contentEdgeValue = edgeValue(contentRect, contentEdge)
        const headerEdgeValue = edgeValue(headerRect, headerEdge)
        const actualDiff = contentEdgeValue - headerEdgeValue
        logBorderEdgeComparison({
          target: 'side-panel-header',
          label: 'content bottom at/above side panel header top (minimized, non-overlay)',
          contentEdge,
          sidePanelEdge: headerEdge,
          comparison: 'lt',
          expected: 0,
          tolerancePx: 0.5,
          contentEdgeValue,
          sidePanelEdgeValue: headerEdgeValue,
          actualDiff,
        })

        expect(
          actualDiff,
          'content bottom at/above side panel header top (minimized, non-overlay)',
        ).toBeLessThanOrEqual(0.5)
      },
    },
    {
      label: 'default content border colors match',
      run: ({ defaultContent }) => {
        expectBorderStyleToMatch(defaultContent, DEFAULT_CONTENT_BORDER_COLORS)
      },
    },
    {
      label: 'side panel content border colors match',
      run: ({ sidePanelContent }) => {
        if (sidePanelContent == null) return
        expectBorderStyleToMatch(sidePanelContent, SIDE_PANEL_CONTENT_BORDER_COLORS)
      },
    },
  ]
}

/** Assertions used for Close (minimized) scenario: header-top check and side panel frame visible. */
function buildMinimizedHeaderTopAssertions(): BorderFixtureAssertion[] {
  const assertions = buildBorderVisibilityAndLocationAssertions()
  return assertions.filter(
    a =>
      a.label === 'content bottom at/above side panel header top (minimized, non-overlay)'
      || a.label === 'side panel frame has visible size (non-overlay only)',
  )
}

export function buildScenarioExpectsFromBorderAssertions(
  assertions: BorderFixtureAssertion[],
  options?: { requireSidePanelContent?: boolean },
): Array<LiveScenarioExpectation<VueWrapper>> {
  const assertionScope = 'Building scenario expectations from border assertions'
  assertLoopIntent(assertionScope, assertions.length)

  return assertions.map((assertion, index) => {
    if (!assertion.label) {
      throw new Error(`${assertionScope}: assertion ${index + 1} must include a descriptive label`)
    }

    return {
      describeLabel: assertion.label,
      run: ({ wrapper }) => {
        expectBorderFixturesWithAssertions(wrapper, [assertion], options)
      },
    }
  })
}

export function getControlButton(wrapper: VueWrapper, label: string) {
  return wrapper
    .findAll('button')
    .find((button) => button.text().trim().toLowerCase() === label.toLowerCase())
}

export function expectButtonsToBeVisible(wrapper: VueWrapper, labels: string[]) {
  const assertionScope = 'Verifying requested control buttons are visible'
  assertLoopIntent(assertionScope, labels.length)

  for (const label of labels) {
    expect(label, `${assertionScope}: each button label must be provided`).toBeTruthy()
    const button = getControlButton(wrapper, label)
    expect(button, `Expected button "${label}" to be visible`).toBeDefined()
  }
}

export function mountLiveFrameWithProps(props: Record<string, unknown>, slots?: Record<string, any>) {
  const defaultSlots = {
    header: '<div data-test="header-slot" style="height: 48px">Header</div>',
    default: `
      <div
        data-test="default-content"
        style="${buildBorderFixtureStyle(DEFAULT_CONTENT_BORDER_COLORS, '#333300')}"
      >
        Default content
      </div>
    `,
    sidePanelContent: `
      <div
        data-test="side-panel-content"
        style="${buildBorderFixtureStyle(SIDE_PANEL_CONTENT_BORDER_COLORS, '#111827')}"
      >
        Side panel content
      </div>
    `,
  }

  // If slots is provided, we merge. To omit a slot, the caller can pass it as null or undefined
  // logic: Object.assign({}, defaultSlots, slots) will override with undefined if present.
  // Actually, we want to allow the caller to pass an object with ONLY the slots they want.

  return mount(LiveFrame, {
    props: {
      sidePanelPosition: 'auto',
      layoutDebounceMs: 50,
      autoHideTimeout: 3000,
      ...props,
    },
    slots: {
      ...defaultSlots,
      ...slots,
    },
    attachTo: document.body,
  })
}

export function mountLiveFrame() {
  return mountLiveFrameWithProps({
    controlsOverlayOnly: '0',
  })
}

export function mountLiveFrameUsingBreakpoints() {
  return mountLiveFrameWithProps({
    controlsOverlayOnly: 'sm',
    sidePanelBreakpoint: 'md',
  })
}

export function setSizeClickButtonExpectToSeeButtons(
  describeLabel: string,
  size: LiveBrowserSize,
  controlButtonType: string,
  expectedButtons: string[],
): MountAndRunScenariosConfig<VueWrapper> {
  return {
    describeLabel,
    mount: mountLiveFrame,
    defaultTimerMode: 'fake',
    scenarios: [
      {
        describeLabel: `${describeLabel} - mount`,
        browserSize: size,
        waitMs: 75,
        expects: [
          ({ wrapper }) => {
            const targetButton = getControlButton(wrapper, controlButtonType)
            expect(targetButton, `Expected to find "${controlButtonType}" button before click`).toBeDefined()
          },
        ],
      },
      {
        describeLabel: `${describeLabel} - click and verify`,
        browserSize: size,
        optionButtonClick: async ({ wrapper }) => {
          const button = getControlButton(wrapper, controlButtonType)
          expect(button, `Button "${controlButtonType}" must exist to click`).toBeDefined()
          await button!.trigger('click')
        },
        waitMs: 75,
        expects: [
          ({ wrapper }) => {
            expectButtonsToBeVisible(wrapper, expectedButtons)
          },
        ],
      },
    ],
  }
}

/** Label of the frame header expand (auto) button when minimized (SidePanelHeader default title). */
export const SIDE_PANEL_HEADER_EXPAND_BUTTON_LABEL = 'Submit Questions'

/**
 * Builds a single per-resolution config that runs the full sequence (spec steps 1–7):
 * 1 Load at size, 2 additional assertions, 3 header expand visible when minimized (in Close step),
 * 4 initial border (all border tests), 5 initialExpectedButtons visible (frame header auto only), 6–7 for each button click then border.
 * First scenario has no optionButtonClick (mount behavior).
 */
export function runOncePerResolutionCheck(
  sizeCase: BreakPointScenarioSize,
  additionalAssertions: Array<LiveScenarioExpectation<VueWrapper>>,
  borderExpects: Array<LiveScenarioExpectation<VueWrapper>>,
  initialExpectedButtons: string[],
  expectedButtons: string[],
): MountAndRunScenariosConfig<VueWrapper> {
  const size = sizeCase.size
  const waitMs = 75

  const scenarios: Array<{
    describeLabel: string
    browserSize: LiveBrowserSize
    waitMs: number
    optionButtonClick?: (ctx: LiveScenarioContext<VueWrapper>) => Promise<void> | void
    expects: Array<LiveScenarioExpectation<VueWrapper>>
  }> = [
      // 1 Load at correct size — first scenario sets browser size (no click); runner mounts at that size.
      // 2 Run all additional (frame/comparison) assertions.
      {
        describeLabel: 'comparison',
        browserSize: size,
        waitMs,
        expects: additionalAssertions,
      },
      // 4 Run all border tests before expanding: "initial border" (full set, all ~16).
      {
        describeLabel: 'initial border',
        browserSize: size,
        waitMs,
        expects: borderExpects,
      },
      // 5 Confirm initialExpectedButtons are visible (frame header auto button only at load).
      {
        describeLabel: 'expectedButtons visible',
        browserSize: size,
        waitMs,
        expects: [
          {
            describeLabel: 'expected state buttons visible',
            run: ({ wrapper }) => {
              expectButtonsToBeVisible(wrapper, initialExpectedButtons)
            },
          },
        ],
      },
    ]

  const sidePanelFrameVisibleExpectation: LiveScenarioExpectation<VueWrapper> = {
    describeLabel: 'side panel frame visible after state change',
    run: ({ wrapper }) => {
      expect(wrapper.find('[data-test="side-panel-frame-shell"]').isVisible()).toBe(true)
    },
  }

  // 6 For each expected button, click it.
  // 7 Run all border tests after each click: "[state] border".
  for (const buttonLabel of expectedButtons) {
    const stateBorderLabel = `${buttonLabel} border`
    const isClose = buttonLabel.toLowerCase() === 'close'
    const isRight = buttonLabel.toLowerCase() === 'right'
    const isBottom = buttonLabel.toLowerCase() === 'bottom'
    const runFullBorderSet = isRight || isBottom
    scenarios.push({
      describeLabel: stateBorderLabel,
      browserSize: size,
      waitMs,
      optionButtonClick: async ({ wrapper }) => {
        const button = getControlButton(wrapper, buttonLabel)
        expect(button, `Button "${buttonLabel}" must exist to click`).toBeDefined()
        await button!.trigger('click')
      },
      // 3 Confirm side panel header expand button when minimized (in Close scenario); plus minimized header-top assertion.
      // Wait for minimized state first so we don't read stale payload and no-op (fake timers can leave emission pending).
      expects: isClose
        ? [
          {
            describeLabel: 'wait for minimized state before layout assertions',
            run: async ({ wrapper }) => {
              await waitForMinimizedState(wrapper)
            },
          },
          expectHeaderExpandButtonVisibleWhenMinimized(),
          ...buildScenarioExpectsFromBorderAssertions(buildMinimizedHeaderTopAssertions(), {
            requireSidePanelContent: false,
          }),
        ]
        : runFullBorderSet
          ? borderExpects
          : [sidePanelFrameVisibleExpectation],
    })
  }

  return {
    describeLabel: 'frame',
    mount: mountLiveFrameUsingBreakpoints,
    defaultTimerMode: 'fake',
    scenarios,
  }
}

export function runBreakPointScenarioSequences(
  buildConfigsForSize: (sizeCase: BreakPointScenarioSize) => Array<MountAndRunScenariosConfig<VueWrapper>>,
) {
  const sizeScope = 'Running breakpoint scenario sequences across predefined viewport categories'
  assertLoopIntent(sizeScope, BREAKPOINT_SCENARIO_SIZES.length)
  if (BREAKPOINT_SCENARIO_SIZES.length !== EXPECTED_BREAKPOINT_SCENARIO_COUNT) {
    throw new Error(
      `${sizeScope}: expected exactly ${EXPECTED_BREAKPOINT_SCENARIO_COUNT} size cases, got ${BREAKPOINT_SCENARIO_SIZES.length}`,
    )
  }

  for (const [sizeIndex, sizeCase] of BREAKPOINT_SCENARIO_SIZES.entries()) {
    if (!sizeCase.describeLabel) {
      throw new Error(`${sizeScope}: size case ${sizeIndex + 1} must include a descriptive label`)
    }

    const configs = buildConfigsForSize(sizeCase)
    if (configs.length <= 0) {
      throw new Error(`Expected at least one MountAndRunScenariosConfig for "${sizeCase.describeLabel}"`)
    }

    const configScope = `Running scenario configs for size case "${sizeCase.describeLabel}"`
    assertLoopIntent(configScope, configs.length)
    const sizeDescribeLabel = sizeCase.describeLabel

    describe(sizeDescribeLabel, () => {
      for (const [configIndex, config] of configs.entries()) {
        if (config.scenarios.length <= 0) {
          throw new Error(`${configScope}: config ${configIndex + 1} must include at least one scenario`)
        }

        const sequenceDescribeLabel = config.describeLabel ?? `config ${configIndex + 1}`
        describeLiveScenarioSequence({
          ...config,
          describeLabel: sequenceDescribeLabel,
        })
      }
    })
  }
}
