import { mount, type VueWrapper } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, vi } from 'vitest'

import {
  describeLiveScenarioSequence,
  type MountAndRunScenariosConfig,
} from '../spec/test-utils/liveScenarioRunner'
import {
  ResizeObserverMock,
  getControlButton,
  getLatestAvailabilityPayload,
  mountLiveFrame,
  setSizeClickButtonExpectToSeeButtons,
} from './helpers.test'
import LiveFrame from './LiveFrame.vue'

describe('LiveFrame scenario runner pattern', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  describe('Mount size, see button, click button, see buttons', () => {
    const configs: Array<MountAndRunScenariosConfig<VueWrapper>> = [
      setSizeClickButtonExpectToSeeButtons(
        'desktop: click full',
        { width: 1280, height: 900 },
        'Full',
        ['Right', 'Full', 'Close'],
      ),
      setSizeClickButtonExpectToSeeButtons(
        'desktop: click right',
        { width: 1280, height: 900 },
        'Right',
        ['Right', 'Full', 'Close'],
      ),
      setSizeClickButtonExpectToSeeButtons(
        'tall viewport: click bottom',
        { width: 500, height: 900 },
        'Bottom',
        ['Bottom', 'Full', 'Close'],
      ),
    ]

    for (const [configIndex, config] of configs.entries()) {
      const size = config.scenarios[0]!.browserSize
      const describeLabel = config.describeLabel ?? `scenario config ${configIndex + 1}`
      const sizeDescribeLabel = `Below aspect ratio (${size.width}x${size.height})`
      describeLiveScenarioSequence({
        ...config,
        describeLabel: `${sizeDescribeLabel} - ${describeLabel}`,
      })
    }
  })

  describe('Bottom availability guard', () => {
    describeLiveScenarioSequence({
      describeLabel: 'bottom excluded when available height is insufficient',
      mount: mountLiveFrame,
      defaultTimerMode: 'fake',
      scenarios: [
        {
          describeLabel: '900x500 excludes bottom by height gate',
          browserSize: { width: 900, height: 500 },
          waitMs: 75,
          expects: [
            {
              describeLabel: 'availableStates excludes bottom and never includes auto',
              run: ({ wrapper }) => {
                const payload = getLatestAvailabilityPayload(wrapper)
                expect(payload.availableStates).not.toContain('bottom')
                expect(payload.availableStates).not.toContain('auto')
                expect(payload.sidePanelModeResolved).toBe('right')
              },
            },
            {
              describeLabel: 'bottom control button is not shown',
              run: ({ wrapper }) => {
                const bottomButton = getControlButton(wrapper, 'Bottom')
                expect(bottomButton).toBeUndefined()
              },
            },
          ],
        },
      ],
    })
  })

  describe('None mode behavior', () => {
    describeLiveScenarioSequence({
      describeLabel: 'SidePanelFrame is not rendered when slot is absent',
      mount: () => {
        return mount(LiveFrame, {
          props: {
            sidePanelPosition: 'auto',
            controlsOverlayOnly: '0',
          },
          slots: {
            header: '<div data-test="header-slot" style="height: 48px">Header</div>',
            default: '<div data-test="default-content">Default content</div>',
          },
          attachTo: document.body,
        })
      },
      scenarios: [
        {
          describeLabel: 'initial load without sidePanelContent slot',
          browserSize: { width: 1280, height: 900 },
          waitMs: 75,
          expects: [
            {
              describeLabel: 'SidePanelFrame shell should NOT exist',
              run: ({ wrapper }) => {
                const frame = wrapper.find('[data-test="side-panel-frame-shell"]')
                expect(frame.exists()).toBe(false)
              },
            },
          ],
        },
      ],
    })
  })
})
