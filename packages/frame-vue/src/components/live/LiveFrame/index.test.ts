import { mount, type VueWrapper } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, vi, it } from 'vitest'

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
    describeLiveScenarioSequence({
      describeLabel: 'SidePanelFrame is not rendered when displaySidePanel is a falsy function',
      mount: () => {
        const displayFunc = () => false
        return mount(LiveFrame, {
          props: {
            sidePanelPosition: 'auto',
            controlsOverlayOnly: '0',
            displaySidePanel: displayFunc,
          },
          slots: {
            header: '<div data-test="header-slot" style="height: 48px">Header</div>',
            default: '<div data-test="default-content">Default content</div>',
            sidePanelContent: '<div data-test="side-panel-content">Side panel content</div>',
          },
          attachTo: document.body,
        })
      },
      scenarios: [
        {
          describeLabel: 'initial load with sidePanelContent slot but function returns true',
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

  describe('Exposed methods', () => {
    it('exposes a refresh() method that synchronously recalcs sizing', () => {
      const wrapper = mount(LiveFrame, {
        slots: {
          default: '<div id="child-1" style="height: 10px">Child 1</div>',
        },
        attachTo: document.body,
      })

      const vm = wrapper.vm as any
      expect(typeof vm.refresh).toBe('function')

      // Call the refresh to ensure it throws no errors 
      // and triggers the enforceSlotChildSizing pathway
      expect(() => {
        vm.refresh()
      }).not.toThrow()
    })
  })

  describe('Content fit control', () => {
    describe('Default behavior (direct children)', () => {
      describeLiveScenarioSequence({
        describeLabel: 'height is enforced on direct children',
        mount: () => {
          return mount(LiveFrame, {
            props: {
              sidePanelPosition: 'right',
            },
            slots: {
              default: `
                <div id="child-1" style="height: 10px">Child 1</div>
                <div id="child-2" style="height: 10px">Child 2</div>
              `,
            },
            attachTo: document.body,
          })
        },
        scenarios: [
          {
            describeLabel: 'initial mount sets height on direct children',
            browserSize: { width: 1280, height: 900 },
            waitMs: 100, // wait for ResizeObserver and nextTick
            expects: [
              {
                describeLabel: 'direct children should have measured height applied',
                run: ({ wrapper }) => {
                  if (ResizeObserverMock.callback) {
                    ResizeObserverMock.callback([])
                  }

                  const child1 = wrapper.find('#child-1').element as HTMLElement
                  const child2 = wrapper.find('#child-2').element as HTMLElement

                  // Height should be applied. 
                  // In happy-dom, offsetHeight is 0 by default, so h will be "0px".
                  // But we can check if it was set explicitly.
                  expect(child1.style.height).toBe('0px')
                  expect(child2.style.height).toBe('0px')
                },
              },
            ],
          },
        ],
      })
    })

    describe('Custom selector behavior', () => {
      describeLiveScenarioSequence({
        describeLabel: 'height is enforced on selected elements',
        mount: () => {
          return mount(LiveFrame, {
            props: {
              sidePanelPosition: 'right',
              enforceSlotSizingQuerySelector: '.target-me',
            },
            slots: {
              default: `
                <div id="direct-child">
                  <div class="target-me" id="nested-target" style="height: 10px">Target</div>
                  <div id="not-target" style="height: 10px">Not Target</div>
                </div>
              `,
            },
            attachTo: document.body,
          })
        },
        scenarios: [
          {
            describeLabel: 'initial mount sets height on selected elements',
            browserSize: { width: 1280, height: 900 },
            waitMs: 100,
            expects: [
              {
                describeLabel: 'selected element should have height applied, other not',
                run: ({ wrapper }) => {
                  if (ResizeObserverMock.callback) {
                    ResizeObserverMock.callback([])
                  }

                  const target = wrapper.find('#nested-target').element as HTMLElement
                  const notTarget = wrapper.find('#not-target').element as HTMLElement

                  expect(target.style.height).toBe('0px')
                  expect(notTarget.style.height).toBe('10px') // unchanged
                },
              },
            ],
          },
        ],
      })
    })
  })
})
