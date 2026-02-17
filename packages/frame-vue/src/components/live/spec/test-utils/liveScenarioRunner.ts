import { nextTick } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

export type LiveTimerMode = 'fake' | 'real'

export interface LiveBrowserSize {
  width: number
  height: number
}

export interface LiveScenarioContext<TWrapper extends VueWrapper> {
  wrapper: TWrapper
  stepIndex: number
  describeLabel: string
  browserSize: LiveBrowserSize
  setBrowserSize: (size: LiveBrowserSize) => Promise<void>
}

export interface LiveScenarioExpectation<TWrapper extends VueWrapper> {
  describeLabel?: string
  run: (ctx: LiveScenarioContext<TWrapper>) => Promise<void> | void
}

export type LiveScenarioExpectationEntry<TWrapper extends VueWrapper>
  = ((ctx: LiveScenarioContext<TWrapper>) => Promise<void> | void)
    | LiveScenarioExpectation<TWrapper>

export interface LiveScenarioStep<TWrapper extends VueWrapper> {
  describeLabel: string
  browserSize: LiveBrowserSize
  optionButtonClick?: (ctx: LiveScenarioContext<TWrapper>) => Promise<void> | void
  waitMs?: number
  expects: Array<LiveScenarioExpectationEntry<TWrapper>>
  timerMode?: LiveTimerMode
}

export interface LiveScenarioSequenceOptions<TWrapper extends VueWrapper> {
  describeLabel?: string
  mount: () => Promise<TWrapper> | TWrapper
  scenarios: Array<LiveScenarioStep<TWrapper>>
  defaultTimerMode?: LiveTimerMode
}

export type MountAndRunScenariosConfig<TWrapper extends VueWrapper> = LiveScenarioSequenceOptions<TWrapper>

function applyTimerMode(mode: LiveTimerMode) {
  if (mode === 'fake') {
    vi.useFakeTimers()
    return
  }
  vi.useRealTimers()
}

async function setWindowSize(size: LiveBrowserSize) {
  // In Vitest browser mode, set the actual iframe viewport so layout, getBoundingClientRect, and screenshots use the scenario size.
  try {
    const { page } = await import('vitest/browser')
    await page.viewport(size.width, size.height)
  } catch {
    // Not in browser mode (e.g. happy-dom); only the window patch below will run.
  }

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: size.width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: size.height,
  })

  window.dispatchEvent(new Event('resize'))
  await nextTick()
}

async function waitForScenario(waitMs: number, timerMode: LiveTimerMode) {
  if (waitMs <= 0) {
    await nextTick()
    return
  }

  if (timerMode === 'fake') {
    await vi.advanceTimersByTimeAsync(waitMs)
  } else {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, waitMs)
    })
  }

  await nextTick()
}

function normalizeScenarioExpectation<TWrapper extends VueWrapper>(
  expectEntry: LiveScenarioExpectationEntry<TWrapper>,
  expectIndex: number,
): LiveScenarioExpectation<TWrapper> {
  if (typeof expectEntry === 'function') {
    return {
      describeLabel: `expectation ${expectIndex + 1}`,
      run: expectEntry,
    }
  }

  return {
    describeLabel: expectEntry.describeLabel ?? `expectation ${expectIndex + 1}`,
    run: expectEntry.run,
  }
}

async function prepareLiveScenarioContext<TWrapper extends VueWrapper>(
  wrapper: TWrapper,
  scenario: LiveScenarioStep<TWrapper>,
  stepIndex: number,
  timerMode: LiveTimerMode,
): Promise<LiveScenarioContext<TWrapper>> {
  const setBrowserSize = async (size: LiveBrowserSize) => {
    await setWindowSize(size)
  }

  await setBrowserSize(scenario.browserSize)

  const context: LiveScenarioContext<TWrapper> = {
    wrapper,
    stepIndex,
    describeLabel: scenario.describeLabel,
    browserSize: scenario.browserSize,
    setBrowserSize,
  }

  if (scenario.optionButtonClick) {
    await scenario.optionButtonClick(context)
  }

  await waitForScenario(scenario.waitMs ?? 0, timerMode)
  return context
}

export async function runLiveScenarioStep<TWrapper extends VueWrapper>(
  wrapper: TWrapper,
  scenario: LiveScenarioStep<TWrapper>,
  stepIndex: number,
  timerMode: LiveTimerMode,
  stepDescribeLabel: string,
): Promise<void> {
  const context = await prepareLiveScenarioContext(wrapper, scenario, stepIndex, timerMode)
  expect(
    scenario.expects.length,
    `Scenario "${stepDescribeLabel}" must include at least one expectation`,
  ).toBeGreaterThan(0)

  for (const [expectIndex, expectEntry] of scenario.expects.entries()) {
    const normalizedExpectation = normalizeScenarioExpectation(expectEntry, expectIndex)
    expect(
      normalizedExpectation.run,
      `Scenario "${stepDescribeLabel}" expectation ${expectIndex + 1} must be defined`,
    ).toBeTypeOf('function')
    await normalizedExpectation.run(context)
  }
}

export async function runLiveScenarioSequence<TWrapper extends VueWrapper>(
  options: LiveScenarioSequenceOptions<TWrapper>,
): Promise<void> {
  const { mount, scenarios } = options
  const defaultTimerMode = options.defaultTimerMode ?? 'fake'

  expect(scenarios.length, 'Scenario sequence must include at least one scenario').toBeGreaterThan(0)
  expect(
    scenarios[0]?.optionButtonClick,
    'First scenario is reserved for mount behavior and should not include optionButtonClick',
  ).toBeUndefined()

  let currentTimerMode = defaultTimerMode
  let wrapper: TWrapper | null = null

  applyTimerMode(currentTimerMode)

  try {
    await setWindowSize(scenarios[0]!.browserSize)
    wrapper = await mount()
    await nextTick()

    for (const [index, scenario] of scenarios.entries()) {
      const scenarioTimerMode = scenario.timerMode ?? defaultTimerMode

      if (scenarioTimerMode !== currentTimerMode) {
        applyTimerMode(scenarioTimerMode)
        currentTimerMode = scenarioTimerMode
      }

      await runLiveScenarioStep(wrapper, scenario, index, currentTimerMode, scenario.describeLabel)
    }
  } finally {
    wrapper?.unmount()
    vi.useRealTimers()
  }
}

export function describeLiveScenarioSequence<TWrapper extends VueWrapper>(
  options: LiveScenarioSequenceOptions<TWrapper>,
) {
  const { mount, scenarios } = options
  const defaultTimerMode = options.defaultTimerMode ?? 'fake'
  const sequenceDescribeLabel = options.describeLabel ?? 'Live scenario sequence'

  expect(scenarios.length, `Sequence "${sequenceDescribeLabel}" must include at least one scenario`).toBeGreaterThan(0)
  expect(
    scenarios[0]?.optionButtonClick,
    `Sequence "${sequenceDescribeLabel}" first scenario is reserved for mount behavior and should not include optionButtonClick`,
  ).toBeUndefined()

  describe(sequenceDescribeLabel, () => {
    let currentTimerMode = defaultTimerMode
    let wrapper: TWrapper | null = null

    beforeAll(async () => {
      applyTimerMode(currentTimerMode)
      await setWindowSize(scenarios[0]!.browserSize)
      wrapper = await mount()
      await nextTick()
    })

    afterAll(() => {
      wrapper?.unmount()
      vi.useRealTimers()
    })

    for (const [index, scenario] of scenarios.entries()) {
      const scenarioDescribeLabel = `${scenario.describeLabel} (${scenario.browserSize.width}x${scenario.browserSize.height})`
      const normalizedExpectations = scenario.expects.map((entry, expectIndex) => {
        return normalizeScenarioExpectation(entry, expectIndex)
      })

      describe(scenarioDescribeLabel, () => {
        let scenarioContext: LiveScenarioContext<TWrapper> | null = null

        beforeAll(async () => {
          expect(
            wrapper,
            `Sequence "${sequenceDescribeLabel}" requires a mounted wrapper before running scenario "${scenarioDescribeLabel}"`,
          ).toBeTruthy()

          const scenarioTimerMode = scenario.timerMode ?? defaultTimerMode

          if (scenarioTimerMode !== currentTimerMode) {
            applyTimerMode(scenarioTimerMode)
            currentTimerMode = scenarioTimerMode
          }

          scenarioContext = await prepareLiveScenarioContext(
            wrapper!,
            scenario,
            index,
            currentTimerMode,
          )
        })

        for (const [expectIndex, normalizedExpectation] of normalizedExpectations.entries()) {
          const expectationDescribeLabel = normalizedExpectation.describeLabel ?? `expectation ${expectIndex + 1}`

          it(expectationDescribeLabel, async () => {
            expect(
              scenarioContext,
              `Scenario "${sequenceDescribeLabel} > ${scenarioDescribeLabel}" must prepare context before running expectation "${expectationDescribeLabel}"`,
            ).toBeTruthy()
            await normalizedExpectation.run(scenarioContext!)
          })
        }
      })
    }
  })
}
