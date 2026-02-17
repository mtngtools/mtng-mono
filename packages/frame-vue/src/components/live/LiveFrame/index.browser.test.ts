import type { VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { type LiveScenarioExpectation } from '../spec/test-utils/liveScenarioRunner'
import {
  buildScenarioExpectsFromBorderAssertions,
  buildBorderVisibilityAndLocationAssertions,
  expectedLocOfContentBorderVSidePanelFrameDiff,
  expectedLocOfContentBorderVSidePanelBorderDiff,
  getLatestAvailabilityPayload,
  runBreakPointScenarioSequences,
  runOncePerResolutionCheck,
  SIDE_PANEL_HEADER_EXPAND_BUTTON_LABEL,
  type BorderFixtureAssertion,
} from './helpers.test'

describe('LvFrame browser', () => {
  describe('Break', () => {
    const expectedBorderAssertionCountPerBreakpoint = 17
    const baseBorderAssertions = buildBorderVisibilityAndLocationAssertions()
    expect(
      baseBorderAssertions.length,
      'Break should use all border visibility/location assertions',
    ).toBe(expectedBorderAssertionCountPerBreakpoint)

    const touchTolerancePx = 2

    runBreakPointScenarioSequences((sizeCase) => {
      const normalizedBorderAssertions = baseBorderAssertions.map((assertion) => {
        if (
          assertion.label === 'default content border is visible'
          && !sizeCase.expectOverlayOnly
          && sizeCase.expectedAutoResolvedMode === 'full'
        ) {
          return {
            label: assertion.label,
            run: ({ wrapper }: { wrapper: VueWrapper }) => {
              expect(wrapper.find('[data-test="default-content"]').isVisible()).toBe(false)
            },
          }
        }

        // In bottom mode, content is above panel (stacked): content bottom must touch panel top (no gap/overlap).
        if (
          assertion.label === 'bottom-edge diff between default and side panel frame is aligned'
          && sizeCase.expectedAutoResolvedMode === 'bottom'
        ) {
          return expectedLocOfContentBorderVSidePanelFrameDiff('bottom', 'top', 'eq', 0, {
            tolerancePx: touchTolerancePx,
            label: 'content bottom touches side panel frame top (non-overlay bottom mode)',
          })
        }

        // In bottom mode, content is above panel so content top is above panel top (not aligned).
        if (
          assertion.label === 'top-edge diff between default and side panel frame is aligned'
          && sizeCase.expectedAutoResolvedMode === 'bottom'
        ) {
          return expectedLocOfContentBorderVSidePanelFrameDiff('top', 'top', 'lt', 0, {
            label: 'content top is above side panel frame top (stacked bottom mode)',
          })
        }

        // Content-vs-side-panel-content assertions below assume overlay (same rectangle). Normalize for non-overlay modes.
        if (sizeCase.expectedAutoResolvedMode === 'bottom') {
          if (assertion.label === 'top-edge diff between default and side panel is aligned') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('top', 'top', 'lt', 0, {
              label: 'content top is above side panel content top (stacked bottom mode)',
            })
          }
          if (assertion.label === 'bottom-edge diff between default and side panel is aligned') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('bottom', 'top', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content bottom at or above side panel content top (stacked bottom mode)',
            })
          }
          if (assertion.label === 'left-edge diff is <= 0') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content left at or left of side panel content left (full width)',
            })
          }
          if (assertion.label === 'left-edge diff is >= 0') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'gte', -touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content left at or right of side panel content left (full width)',
            })
          }
          if (assertion.label === 'right-edge diff is < 1') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('right', 'right', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content right at or left of side panel content right (full width)',
            })
          }
          if (assertion.label === 'right-edge diff is > -1') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('right', 'right', 'gte', -touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content right at or right of side panel content right (full width)',
            })
          }
        }

        if (sizeCase.expectedAutoResolvedMode === 'right') {
          if (assertion.label === 'top-edge diff between default and side panel is aligned') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('top', 'top', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content top at or above side panel content top (same row, header in panel)',
            })
          }
          if (assertion.label === 'bottom-edge diff between default and side panel is aligned') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('bottom', 'bottom', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content bottom at or above side panel content bottom (same row)',
            })
          }
          if (assertion.label === 'left-edge diff is <= 0') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'lte', 0, {
              label: 'content left at or left of side panel content left (side-by-side)',
            })
          }
          if (assertion.label === 'left-edge diff is >= 0') {
            // In right mode content is left of panel; we only need content left <= panel left (other assertion). This one: content is to the left.
            return expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'lt', 0, {
              label: 'content left is left of side panel content left (side-by-side)',
            })
          }
          if (assertion.label === 'right-edge diff is < 1') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('right', 'left', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content right at or left of side panel content left (touch)',
            })
          }
          if (assertion.label === 'right-edge diff is > -1') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('right', 'left', 'gte', -touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content right at or right of side panel content left (touch)',
            })
          }
        }

        // Full mode: panel has header so content vs panel-content edges need tolerance; frame alignment may have 1–2px rounding.
        if (sizeCase.expectedAutoResolvedMode === 'full') {
          if (assertion.label === 'top-edge diff between default and side panel is aligned') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('top', 'top', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content top at or above side panel content top (full mode)',
            })
          }
          if (assertion.label === 'bottom-edge diff between default and side panel is aligned') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('bottom', 'bottom', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content bottom at or above side panel content bottom (full mode)',
            })
          }
          if (assertion.label === 'top-edge diff between default and side panel frame is aligned') {
            return expectedLocOfContentBorderVSidePanelFrameDiff('top', 'top', 'eq', 0, {
              tolerancePx: touchTolerancePx,
              label: 'content top aligned with side panel frame top (full mode)',
            })
          }
          if (assertion.label === 'bottom-edge diff between default and side panel frame is aligned') {
            return expectedLocOfContentBorderVSidePanelFrameDiff('bottom', 'bottom', 'eq', 0, {
              tolerancePx: touchTolerancePx,
              label: 'content bottom aligned with side panel frame bottom (full mode)',
            })
          }
          if (assertion.label === 'left-edge diff is <= 0') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content left at or left of side panel content left (full)',
            })
          }
          if (assertion.label === 'left-edge diff is >= 0') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('left', 'left', 'gte', -touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content left at or right of side panel content left (full)',
            })
          }
          if (assertion.label === 'right-edge diff is < 1') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('right', 'right', 'lte', touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content right at or left of side panel content right (full)',
            })
          }
          if (assertion.label === 'right-edge diff is > -1') {
            return expectedLocOfContentBorderVSidePanelBorderDiff('right', 'right', 'gte', -touchTolerancePx, {
              tolerancePx: touchTolerancePx,
              label: 'content right at or right of side panel content right (full)',
            })
          }
        }

        return assertion
      })

      const borderScenarioExpects = buildScenarioExpectsFromBorderAssertions(normalizedBorderAssertions)
      expect(
        borderScenarioExpects.length,
        `${sizeCase.describeLabel}: each breakpoint scenario should run all border assertions`,
      ).toBe(expectedBorderAssertionCountPerBreakpoint)

      const invariantAssertions: BorderFixtureAssertion[] = [
        expectedLocOfContentBorderVSidePanelFrameDiff('left', 'left', 'lte', 0, {
          label: 'side panel left is never further left than content left',
        }),
      ]

      if (sizeCase.expectedAutoResolvedMode === 'bottom') {
        invariantAssertions.push(
          expectedLocOfContentBorderVSidePanelFrameDiff('bottom', 'top', 'eq', 0, {
            tolerancePx: touchTolerancePx,
            label: 'content bottom touches side panel top (stacked)',
          }),
        )
      }

      if (sizeCase.expectedAutoResolvedMode === 'right') {
        invariantAssertions.push(
          expectedLocOfContentBorderVSidePanelFrameDiff('right', 'left', 'eq', 0, {
            tolerancePx: touchTolerancePx,
            label: 'content right touches side panel left (side-by-side)',
          }),
        )
      }

      const additionalAssertions: Array<LiveScenarioExpectation<VueWrapper>> = [
        {
          describeLabel: 'validate availability payload',
          run: ({ wrapper }: { wrapper: VueWrapper }) => {
            const payload = getLatestAvailabilityPayload(wrapper)
            expect(payload.overlayOnly).toBe(sizeCase.expectOverlayOnly)
            expect(payload.sidePanelModeResolved).toBe(sizeCase.expectedAutoResolvedMode)
            expect(payload.availableStates).not.toContain('auto')
          },
        },
      ]

      if (!sizeCase.expectOverlayOnly) {
        additionalAssertions.push(...buildScenarioExpectsFromBorderAssertions(invariantAssertions))
      }

      const expectedButtons =
        sizeCase.expectedAutoResolvedMode === 'bottom'
          ? ['Bottom', 'Full', 'Close']
          : sizeCase.expectedAutoResolvedMode === 'right'
            ? ['Right', 'Full', 'Close']
            : sizeCase.expectOverlayOnly
              ? ['Close']
              : sizeCase.bucket === 'between-ratios-between-controls-and-side-panel-breakpoints'
                ? ['Full', 'Close']
                : ['Right', 'Bottom', 'Full', 'Close']

      // At initial load only expect the frame header (auto) button; when minimized at load that's the only one.
      const initialExpectedButtons =
        sizeCase.expectedAutoResolvedMode === 'minimized'
          ? [SIDE_PANEL_HEADER_EXPAND_BUTTON_LABEL]
          : expectedButtons

      return [
        runOncePerResolutionCheck(
          sizeCase,
          additionalAssertions,
          borderScenarioExpects,
          initialExpectedButtons,
          expectedButtons,
        ),
      ]
    })
  })
})

describe('LiveFrame browser mode smoke', () => {
  it('hello world', () => {
    expect('hello world').toBe('hello world')
  })
})
