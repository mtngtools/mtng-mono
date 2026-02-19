# LiveFrame

Full-screen frame for live content with an optional side panel system. This component owns side panel mode selection/resolution and publishes the contract used by the `live` side-panel subcomponents.

Shared type and event definitions live in `packages/frame-vue/src/components/live/spec/CONTRACTS.md`.

## V1 Scope

- Include only behaviors required for first release.
- Exclude planned/future enhancements (state persistence, gesture support, advanced transition reason mapping, and extended accessibility work).
- Footer region support is moved to a future planned feature and is not part of V1 implementation.

## Features

- Fixed viewport container (`inset-0`) with `header`, `default`, and optional `sidePanelContent` region.
- Explicit semantic structure where `main` wraps only default slot content and side panel is a sibling of `main`.
- Built-in default-slot fit behavior: content fills the allocated `main` region edge-to-edge and is clipped to the frame region when oversized.
- Non-overlay occlusion behavior: when `overlayOnly === false`, default content must not be visible behind side panel chrome.
- Side panel mode system with selected mode (`sidePanelMode`) and resolved mode (`sidePanelModeResolved`).
- Viewport-driven `auto` resolution with explicit available-state publishing.
- Overlay-only control behavior for small viewports.
- Auto-hide behavior for header/minimized controls on small viewports.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sidePanelPosition` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | `'minimized'` | Selected side panel mode (`v-model:sidePanelPosition`) when side panel slot is present. Default is minimized so side panel starts hidden unless caller provides a value. |
| `mainContentAspectRatio` | `number \| string` | `'16/9'` | Main content aspect ratio used for bottom-panel sizing. Accepts decimal (`1.7777`) or fraction (`'16/9'`) and is normalized to decimal internally. |
| `autoBottomAspectRatioBreakpoint` | `number` | `0.9` | `viewportWidth / availableHeight` threshold used by `auto` to favor `bottom`. |
| `autoRightAspectRatioBreakpoint` | `number` | `3.2` | `viewportWidth / availableHeight` threshold used by `auto` to favor `right`. |
| `sidePanelBreakpoint` | `ScreenCSSUtilityStringLiteral` | `'md'` | Width breakpoint used in the in-between aspect-ratio branch. |
| `controlsOverlayOnly` | `ScreenCSSUtilityStringLiteral` | `'sm'` | Below this breakpoint, controls behave as overlay-only controls. |
| `autoHideTimeout` | `number` | `5000` | Inactivity timeout for auto-hide behavior. |
| `layoutDebounceMs` | `number` | `50` | Debounce duration for post-mount layout recalculation triggers. |
| `sidePanelMinRight` | `string` | `'20rem'` | Minimum side panel width in `right`. |
| `sidePanelMaxRight` | `string` | `'30vw'` | Standard side panel width cap in `right`. |
| `sidePanelMaxRightWide` | `string` | `'40vw'` | Ultra-wide side panel width cap in `right`. |
| `sidePanelMinBottom` | `string` | `'12.5rem'` | Minimum side panel height in `bottom`. |
| `sidePanelMaxBottom` | `string` | `'30vh'` | Standard side panel height cap in `bottom`. |
| `sidePanelMaxBottomTall` | `string` | `'60vh'` | Height cap when `auto` resolves to `bottom` from tall aspect ratio. |
| `headerHideWidthThreshold` | `string` | `'50rem'` | Viewport width below which the header is hidden. |
| `headerHideHeightThreshold` | `string` | `'40rem'` | Viewport height below which the header is hidden. |
| `disableSidePanel` | `boolean` | `false` | When `true`, the side panel system is disabled even if `sidePanelContent` slot is provided. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `update:sidePanelPosition` | `SidePanelMode` | Emits selected mode changes and fallback-to-`auto` updates. |
| `sidePanelTransition` | `{ from, to, reason }` | Emitted when side panel transitions begin. V1 requires event presence; detailed per-path `reason` mapping is not locked. |
| `sidePanelAvailableStates` | `{ availableStates, sidePanelMode, sidePanelModeResolved, overlayOnly }` | Emits available-state contract changes for control rendering. `availableStates` does not include `'auto'` (user cannot select auto from controls). |
| `defaultSlotResize` | `{ width, height }` | Emits default slot size changes when side panel slot is present. |

### Side Panel Modes (V1)

- `sidePanelMode` (selected): `'auto' | 'right' | 'bottom' | 'full' | 'minimized'` when `sidePanelContent` exists; `'none'` when `sidePanelContent` is absent.
- `sidePanelModeResolved` (rendered): `'right' | 'bottom' | 'full' | 'minimized' | 'none'`.
- Initial default selected mode is `minimized` when `sidePanelContent` exists and no explicit `sidePanelPosition` is provided by parent.

`LiveFrame` owns `auto` resolution. Child components consume selected/resolved values and do not resolve `auto`.

### Auto Resolution (V1)

`auto` uses current viewport and measured available height:

1. `availableHeight = viewportHeight - headerHeight`
2. Compute bottom-fit availability gate:
   - `requiredMainHeightForBottom = viewportWidth / mainContentAspectRatio`
   - `requiredBottomMinHeight = sidePanelMinBottom` (converted to px)
   - Bottom is available only when:
     - `availableHeight >= requiredMainHeightForBottom + requiredBottomMinHeight`
3. If `viewportWidth / availableHeight < autoBottomAspectRatioBreakpoint`:
   - resolve to `bottom`
   - internal available states (for resolution): `['auto', 'bottom', 'full', 'minimized']`; **user-selectable** (emitted/passed to controls) exclude `'auto'`: `['bottom', 'full', 'minimized']`
   - if bottom-fit gate fails, `bottom` must not be available and `auto` falls back to non-bottom states for the current width bucket.
4. Else if `viewportWidth / availableHeight > autoRightAspectRatioBreakpoint`:
   - resolve to `right`
   - internal: `['auto', 'right', 'full', 'minimized']`; user-selectable: `['right', 'full', 'minimized']`
5. Else:
   - if width is `>= sidePanelBreakpoint`, internal: `['auto', 'right', 'bottom', 'full', 'minimized']`, user-selectable: `['right', 'bottom', 'full', 'minimized']`, default resolved is `right`
   - when bottom-fit gate fails in this branch, remove `bottom` from available states (internal: `['auto', 'right', 'full', 'minimized']`, user-selectable: `['right', 'full', 'minimized']`)
   - otherwise internal: `['auto', 'full', 'minimized']`, user-selectable: `['full', 'minimized']`

Manual selections are viewport-constrained in V1. Recalculation can override manual choice based on current rules.

`auto`/layout recalculation inputs are viewport and frame-chrome measurements only; default slot content size is not a layout input.

### Bottom Height Sizing (V1 first pass)

When resolved mode is `bottom`, side panel max height is constrained using `mainContentAspectRatio`:

1. Normalize `mainContentAspectRatio` to decimal (`width / height`).
2. Compute required main-region height to preserve full-width content:
   - Use measured main-region width (`default` region width) when available; fallback to `viewportWidth` before first measurement.
   - `requiredMainHeight = (mainRegionWidth / mainContentAspectRatio) + 20px`
3. Compute remaining space in frame:
   - `remainingForBottom = availableHeight - requiredMainHeight`
4. Bottom panel max height is:
   - `min(configuredBottomMaxHeight, remainingForBottom)`, floored at `0`.
5. Bottom panel min height is clamped so it never exceeds computed max.

This preserves full-width main content first, then allows bottom panel to consume remaining space up to configured limits.

Viewport-driven sizing caps also apply when users manually select `right` or `bottom`:

- Manual `right` uses wide-cap sizing (`sidePanelMaxRightWide`) when viewport is in the wide-right auto branch.
- Manual `bottom` uses tall-cap sizing (`sidePanelMaxBottomTall`) when viewport is in the tall-bottom auto branch.

### Recalculation Timing (V1)

- Initial mount recalculation: immediate.
- Subsequent recalculations from resize/measurement updates: debounced using `layoutDebounceMs` (default `50ms`).
- Missing `header` slot is treated as measured height `0`.

#### Future planned feature (post-resize verification)

- Add a delayed verification pass after resize settles (for example `1000-2000ms` after the last resize event).
- Purpose: mitigate occasional missed/late resize updates by running a final "check if layout is correct" recalculation.
- This pass should be additive safety logic and must not replace the normal debounced recalculation path.

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `header` | ✓ | Top chrome. Height contributes to available space when present. |
| `default` |  | Main content area. |
| `sidePanelContent` | ✓ | Content-only slot rendered in the default body area of an internally managed `SidePanelFrame`. |

### Structural Layout Contract (V1)

Required semantic/container structure:

1. Root is `section` (`fixed inset-0`) and fills the viewport.
2. `header` (when present) is the only top region and spans full width.
3. Middle region is an `article` that fills remaining space below header (or full viewport when header is absent).
4. Side panel frame is constrained to the `article` region and must never paint above `header`.
5. Inside `article`:
   - `main` wraps only default slot content.
   - Side panel frame/slot is a sibling of `main` (never nested inside `main`).
- Default slot content is rendered through an internal non-scroll fit wrapper. To ensure compatibility with web components and complex children, `LiveFrame` explicitly enforces the container height onto the direct slot children via JavaScript (`ResizeObserver`). Width remains managed by CSS (`100%`).
- Overflow is clipped by the frame regions.
- `section` must not use flex layout in V1.
- `article` wrapper around `main` + side panel must not use flex layout in V1.
- Use `display: grid` for general layout. Use `place-items: stretch` (or specific alignment like `end`/`center`) on the grid container to position children, freeing children from positioning themselves, but children that should take up full space can still use absolute with `top: 0`, `left: 0`, `bottom: 0`, `right: 0`.
- Flex should be reserved for selective groups (buttons, cards, labels).
- Layout must fill the page every render and every mode transition.
- `main` content region is never scrollable in V1.
- `main` must be the sizing region for default slot content and must fit child content within the available frame space.
- `main` must provide built-in edge-to-edge fill behavior for default content without requiring caller styles.
- Oversized default content must be clipped/contained by frame regions and must not become scrollable through `main`.
- When `overlayOnly === false`, `main` visible content area must exclude side-panel footprint (`right`, `bottom`, and `full` resolved states).
- In non-overlay `right` and `bottom` modes, `article` must allocate dedicated grid tracks for `main` and side panel host (no overlap). **Touch rules**: in bottom (stacked), bottom of main content frame must meet top of side panel frame; in right (side-by-side), right of main content frame must meet left of side panel frame.
- Overlap is allowed only when `overlayOnly === true`, or user has chosen `full` (only side panel visible), or minimized (side panel frame on top of main at bottom). In all other non-overlay states there must be no overlap.
- Content-behind-panel visibility is allowed only in overlay-only contexts.
- Internal wrapper structure for fitting is allowed only when it remains non-scroll and does not change top-level frame geometry.

### Layout Invariants (V1)

- `main` versus side panel layout is controlled only by viewport state and selected/resolved side panel mode.
- Default slot content must never change top-level frame geometry, row/column track sizing, or side panel placement.
- Intrinsic size growth from default slot content must not reflow frame layout; overflow behavior is clipped/contained by frame regions.
- Once mode is resolved for a given viewport state, adding/removing/changing default slot content must not change layout mode or panel placement.
- Default slot content must render against the full allocated `main` bounds by default (not centered by frame chrome). To guarantee this for all content types, `LiveFrame` monitors the `main` container size and explicitly sets the `height` of the top-level slot children to match.
- In non-overlay mode, default slot content must never remain visible under side panel frame chrome. The bottom of the default content frame must never extend below (or behind) the side panel frame; that is allowed only when `overlayOnly === true` or in full/minimized as above. When not overlapping, main and panel must touch: in bottom mode, main bottom = side panel top; in right mode, main right = side panel left.

#### Top-level layout scenarios (V1)

- If header is present: use a two-row section layout with header row + main row.
- If header is absent: do not use grid for top-level layout; make `article` fill the viewport using absolute inset anchoring.
- Layout decision must be implemented via a Vue computed class variable that applies scenario-specific classes.
- `article` layout tracks must be explicitly fixed by container rules (for example a single `1fr` track) so child content cannot implicitly resize tracks.

#### Side panel control rules

- `LiveFrame` owns all frame controls in V1 and hard-codes `SidePanelFrame` composition.
- `setSidePanelMode(mode)`:
  - If mode is unavailable, fallback to `auto` and emit `update:sidePanelPosition` with `auto`.
- `closeSidePanel()`:
  - Helper action valid only when `overlayOnly === true`.
  - Sets selected mode to `minimized`.
- Default `SidePanelButtonGroup` rendering:
  - When `overlayOnly === true` and `sidePanelModeResolved === 'full'`, only the `minimized` control is shown.
  - The `minimized` control label is `Close`.
  - No separate hard-coded close button is rendered in default controls.
- Future planned feature: add a `sidePanelFrame` slot for full frame/chrome customization.

### Availability Event Behavior (V1)

`sidePanelAvailableStates`:

- Emits once on initial mount when side panel slot is present.
- Emits only when payload values change.
- In `none` mode, emits once on entry to `none`, then suppresses updates while still in `none`.

### None Mode Behavior (V1)

When `sidePanelContent` is absent OR `disableSidePanel` is `true`:

- `sidePanelMode = 'none'`
- `sidePanelModeResolved = 'none'`
- `SidePanelFrame` component must NOT be rendered in the DOM.
- Incoming `sidePanelPosition` is accepted but ignored for layout logic.
- Side-panel-related emits are suppressed.
- `defaultSlotResize` is suppressed.
- `overlayOnly` remains breakpoint-derived for header overlay behavior.

### Auto-Hide Rules (V1)

- Auto-hide applies to header/minimized controls in overlay-only context.
- Auto-hide timer resets on `mousemove`, `click`, `tap`, `scroll`, and keyboard input.
- Breakpoint crossing rule:
  - If resolved mode is `full`, keep current visibility state.
  - Otherwise show controls immediately and restart auto-hide timer.
- Tall-viewport rule:
  - While tall rule is active, controls stay visible.
  - On exit from tall rule, show controls immediately and restart timer.

### SSR & Hydration (V1)

SSR/hydration-specific assertions are deferred from required V1 test coverage.

## Testing Requirements (V1)

Tests in `index.test.ts` should cover:

- Auto decision branches and resulting available states.
- Core transition paths at minimum (user toggles plus breakpoint-driven transitions).
- Full transition matrix if feasible; core-path matrix is required minimum.
- Bottom availability gate: `bottom` is excluded from available states when `availableHeight < (viewportWidth / mainContentAspectRatio) + sidePanelMinBottom`.
- Initial immediate recalculation and debounced subsequent recalculations (`layoutDebounceMs` default and override).
- Missing header slot treated as 0-height input.
- Layout invariants: changing default slot content does not change side panel placement, resolved mode, or track geometry for fixed viewport + mode inputs.
- Default-slot fit behavior: content fills the allocated `main` region by `LiveFrame`, and oversized content is clipped within frame bounds (no `main` scrolling).
- Non-overlay occlusion behavior: in resolved `right`, `bottom`, and `full`, default slot content is not visible behind side panel frame chrome.
- Non-overlay structural behavior: in resolved `right` and `bottom`, `main` and side panel occupy separate `article` tracks.
- `sidePanelAvailableStates` emission behavior (initial emit + change-only emits + `none` entry behavior).
- None-mode suppression behavior for side-panel-related emits and `defaultSlotResize`.
- None-mode DOM behavior: verify that `SidePanelFrame` is not rendered when `sidePanelContent` slot is absent.
- Auto-hide rules including tall-viewport entry/exit behavior.
- Event assertion strictness: presence-only for transition-related event checks.

### Test Planning (V1)

Use a reusable scenario-step shape for LiveFrame interaction tests:

- `describeLabel`: scenario description used by runner diagnostics.
- `browserSize`: viewport size to apply for the step (`{ width, height }`).
- `optionButtonClick`: optional custom click function to trigger a state change.
- `waitMs`: optional delay before assertions.
- `expects`: array of assertions (function entries or labeled `{ describeLabel, run }` entries) so each step can verify multiple DOM outcomes.

Use a second reusable runner that executes an array of scenarios using single-mount flow:

- First element is mount behavior (initial render state; no button click).
- Subsequent elements are state-change behavior (button click and follow-up assertions).
- Timer strategy is hybrid:
  - default to fake timers for deterministic waits;
  - allow per-step opt-in to real timers when needed.
- Test output should use nested describe hierarchy for readability:
  - top-level: `LiveFrame scenario runner`
  - per-size grouping: use the exact breakpoint-size labels defined in the fixed list (for example `taller \`autoBottomAspectRatioBreakpoint\` (900x1400)`)
  - per-sequence and per-step labels from scenario config and step `describeLabel`
  - each expectation entry should render as its own nested test label (using expectation `describeLabel` when provided)
- `runLiveScenarioStep` should accept a describe-label parameter so expectation failures include hierarchical context.

#### Scenario Builder Helper (V1)

Add a helper function to build common scenario steps:

- Function name: `setSizeClickButtonExpectToSeeButtons`
- Inputs:
  - `describeLabel`: scenario label prefix
  - `size`: viewport `{ width, height }`
  - `controlButtonType`: string identifying which control button to click
  - `expectedButtons`: array of strings representing the buttons expected to be visible
- Return type: `MountAndRunScenariosConfig`
- Return shape: two scenarios
  - Scenario 1 (mount step): sets browser size and expects to see the button that will be clicked.
  - Scenario 2 (state-change step): clicks the button and expects to see each button in `expectedButtons`.

Example usage pattern (build a scenario array with three helper calls):

```ts
const scenarios = [
  setSizeClickButtonExpectToSeeButtons(
    'desktop: click full',
    { width: 1280, height: 900 },
    'Full',
    ['Auto', 'Right', 'Full', 'Close'],
  ),
  setSizeClickButtonExpectToSeeButtons(
    'desktop: click right',
    { width: 1280, height: 900 },
    'Right',
    ['Auto', 'Right', 'Full', 'Close'],
  ),
  setSizeClickButtonExpectToSeeButtons(
    'tall viewport: click bottom',
    { width: 800, height: 1200 },
    'Bottom',
    ['Auto', 'Bottom', 'Full', 'Close'],
  ),
]
```

Notes:

- Each helper result already contains both mount and state-change scenarios.
- Use multiple helper calls to build multiple `MountAndRunScenariosConfig` runs, then call `runLiveScenarioSequence` for each config.
- Keep `index.test.ts` focused on high-level happy-dom scenarios only; keep geometry/bounding-box assertions in `index.browser.test.ts` (Vitest browser mode).
- Move reusable builders, fixture setup, assertion helpers, and breakpoint runners into `helpers.test.ts`.
- Add shared color variables for default-slot and side-panel-slot border fixtures in tests so visual boundary checks are deterministic.
- Add a reusable helper that takes an array of border assertions (visibility + location checks) and executes them against mounted fixture elements.
- Before any helper-level loop that executes assertions/expectations, include an explicit assertion-scope description (human-readable intent) and validate that the loop has items to run.
- Wrap scenario-sequence generation in nested `describe` blocks so output expands by size and scenario labels.
- For border location comparisons, helper functions should accept explicit edge pairs:
  - content edge (`left`/`right`/`top`/`bottom`)
  - side-panel edge (`left`/`right`/`top`/`bottom`)
  - comparison operator (`lt`/`lte`/`eq`/`gte`/`gt`) and expected numeric diff
- Required helper names for this intent:
  - `expectedLocOfContentBorderVSidePanelBorderDiff` (compare default slot border edge vs sidePanelContent border edge)
  - `expectedLocOfContentBorderVSidePanelFrameDiff` (compare default slot border edge vs side panel frame edge)
- This supports explicit intent assertions such as: "bottom of content slot is above top of side panel frame" (`contentEdge: 'bottom'`, `sidePanelEdge: 'top'`, `comparison: 'lte'`, `expected: 0`).

#### Breakpoint Sequence Helper (V1)

Add a reusable helper to repeat scenario configs across a standard size list:

- Function name: `runBreakPointScenarioSequences`
- Input:
  - callback that receives the current breakpoint-size case (including initial size metadata)
  - callback returns an array of `MountAndRunScenariosConfig`
- Behavior:
  - helper iterates a fixed size list and runs each returned config with `runLiveScenarioSequence`
  - fixed list must include exactly 5 entries with describe labels that include the exact size:
    - taller `autoBottomAspectRatioBreakpoint` (`900x1400`)
    - wider `autoRightAspectRatioBreakpoint` (`1600x500`)
    - between ratios narrower `controlsOverlayOnly` (`500x400`)
    - between ratios wider `sidePanelBreakpoint` (`1000x600`)
    - between ratios between `controlsOverlayOnly` and `sidePanelBreakpoint` (`700x600`)

Use this helper to assert known non-overlay geometry intents across breakpoint-driven states, including:

- content bottom is never below side panel top
- content right is never further right than side panel left
- side panel left is never further left than content left
- Under each breakpoint label in Vitest UI hierarchy, include distinct test suites (for example `frame comparison` and `border visibility and location`) and render scenario expectation labels as leaf tests.
- For `border visibility and location`, run the full assertion set from `buildBorderVisibilityAndLocationAssertions` (currently 17 labeled assertions, including side panel frame has visible size when not overlay-only) for each of the 5 breakpoint scenarios.
- Run unit scripts (`test`, `test:min`, `test:verbose`, `test:coverage`, `test:watch`, `test:ui`) with `*.browser.test.ts` excluded, and run breakpoint geometry scenarios via browser mode command (`test:browser`) so edge values come from real layout instead of happy-dom zeros.

#### runOncePerResolutionCheck (per-resolution sequence) (V1)

Single-mount scenario sequence used per breakpoint size. Function builds one `MountAndRunScenariosConfig` whose scenarios implement, in order:

1. **Load at correct size** — First scenario sets browser size (no click); runner mounts at that size.
2. **Run all additional (frame/comparison) assertions** — Same scenario or immediate follow-up: run `additionalAssertions` (e.g. availability payload, invariant border assertions).
3. **Confirm side panel header expand button when minimized** — When the panel is minimized, the header shows a control that requests `'auto'` to expand; assert that control is visible. Implemented as an expectation in the scenario where the user has clicked the minimized (Close) control.
4. **Run all border tests before expanding: "initial border"** — Second scenario (no click): run full border visibility/location assertions at initial auto-resolved state; describe label `initial border` (or equivalent).
5. **Confirm expectedButtons are visible** — Assert each of the user-selectable state buttons (e.g. Right, Full, Close) is visible for the current resolution.
6. **For each expected button, click it** — One scenario per user-selectable state: perform the button click for that state.
7. **Run all border tests after each click: "[state] border"** — In each scenario from step 6, after the click and wait, run border assertions; describe label per state (e.g. `right border`, `full border`, `minimized border`). When the resulting state is minimized, run at least the header-expand visibility assertion; when the resulting state is right or bottom, run the full border set; when full, run mode-appropriate assertions (content hidden, etc.). Implementation may use the full `borderExpects` for right/bottom and a reduced set for full/minimized to avoid asserting on DOM that is hidden in those states.

Inputs: `sizeCase`, `additionalAssertions`, `borderExpects` (full border set; used for "initial border" and for per-button scenarios), `initialExpectedButtons` (buttons to assert visible at load—only the frame header (auto) button when minimized at load, otherwise the user-selectable set), and `expectedButtons` (array of button labels for clicks and post-click border runs, e.g. `['Right', 'Full', 'Close']`). Return a single config so one mount is reused for all steps. The first scenario must not include `optionButtonClick`.

#### Planned: fix minimized initial-load assertion

The assertion **"content bottom at/above side panel header top (minimized, non-overlay)"** (in `buildBorderVisibilityAndLocationAssertions`) correctly fails after the user clicks "Close" to return to minimized state (layout bug: content extends behind panel). The same assertion incorrectly passes on initial load when the viewport auto-resolves to minimized—it should fail there too. Fixing the test so it fails on initial load when the layout is wrong is **Planned** (likely timing/state: initial load may not yet have emitted or applied minimized resolved state when the assertion runs).

#### Browser test setup

Vitest (run from this package) resolves `playwright-core` from the monorepo root, so browsers must be installed from the root. After `pnpm i` at the repository root, run from the **repository root**: `pnpm run playwright:install` (or `pnpm exec playwright install chromium`). Then run `pnpm test:browser` from this package (`packages/frame-vue`). Playwright is a root devDependency so the root install populates the same `playwright-core` that the browser tests use.