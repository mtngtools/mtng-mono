# LiveFrame

Full-screen frame for live content with an optional side panel system. This component owns side panel mode selection/resolution and publishes the contract used by the `live` side-panel subcomponents.

Shared type and event definitions live in `app/components/live/spec/CONTRACTS.md`.

## V1 Scope

- Include only behaviors required for first release.
- Exclude planned/future enhancements (state persistence, gesture support, advanced transition reason mapping, and extended accessibility work).

## Features

- Fixed viewport container (`inset-0`) with `header`, `default`, optional `sidePanel`, and `footer` regions.
- Side panel mode system with selected mode (`sidePanelMode`) and resolved mode (`sidePanelModeResolved`).
- Viewport-driven `auto` resolution with explicit available-state publishing.
- Overlay-only control behavior for small viewports.
- Auto-hide behavior for header/footer/minimized controls on small viewports.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sidePanelPosition` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | `'auto'` | Selected side panel mode (`v-model:sidePanelPosition`) when side panel slot is present. |
| `autoBottomAspectRatioBreakpoint` | `number` | `0.9` | `availableHeight / viewportWidth` threshold used by `auto` to favor `bottom`. |
| `autoRightAspectRatioBreakpoint` | `number` | `3.2` | `viewportWidth / availableHeight` threshold used by `auto` to favor `right`. |
| `sidePanelBreakpoint` | `ScreenCSSUtilityStringLiteral` | `'md'` | Width breakpoint used in the in-between aspect-ratio branch. |
| `controlsOverlayOnly` | `ScreenCSSUtilityStringLiteral` | `'sm'` | Below this breakpoint, controls behave as overlay-only controls. |
| `autoHideTimeout` | `number` | `5000` | Inactivity timeout for auto-hide behavior. |
| `layoutDebounceMs` | `number` | `200` | Debounce duration for post-mount layout recalculation triggers. |
| `expectedMaxHeaderHeight` | `string` | `'3rem'` | Optional initial render estimate before measurement. |
| `expectedMaxFooterHeight` | `string` | `'8rem'` | Optional initial render estimate before measurement. |
| `sidePanelMinRight` | `string` | `'320px'` | Minimum side panel width in `right`. |
| `sidePanelMaxRight` | `string` | `'480px'` | Standard side panel width cap in `right`. |
| `sidePanelMaxRightWide` | `string` | `'40vw'` | Width cap when `auto` resolves to `right` from wide aspect ratio. |
| `sidePanelMinBottom` | `string` | `'200px'` | Minimum side panel height in `bottom`. |
| `sidePanelMaxBottom` | `string` | `'400px'` | Standard side panel height cap in `bottom`. |
| `sidePanelMaxBottomTall` | `string` | `'60vh'` | Height cap when `auto` resolves to `bottom` from tall aspect ratio. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `update:sidePanelPosition` | `SidePanelMode` | Emits selected mode changes and fallback-to-`auto` updates. |
| `sidePanelTransition` | `{ from, to, reason }` | Emitted when side panel transitions begin. V1 requires event presence; detailed per-path `reason` mapping is not locked. |
| `sidePanelAvailableStates` | `{ availableStates, sidePanelMode, sidePanelModeResolved, overlayOnly }` | Emits available-state contract changes for control rendering. |
| `defaultSlotResize` | `{ width, height }` | Emits default slot size changes when side panel slot is present. |

### Side Panel Modes (V1)

- `sidePanelMode` (selected): `'auto' | 'right' | 'bottom' | 'full' | 'minimized'` when slot exists; `'none'` when side panel slot is absent.
- `sidePanelModeResolved` (rendered): `'right' | 'bottom' | 'full' | 'minimized' | 'none'`.

`LiveFrame` owns `auto` resolution. Child components consume selected/resolved values and do not resolve `auto`.

### Auto Resolution (V1)

`auto` uses current viewport and measured available height:

1. `availableHeight = viewportHeight - headerHeight - footerHeight`
2. If `availableHeight / viewportWidth < autoBottomAspectRatioBreakpoint`:
   - resolve to `bottom`
   - available states: `['bottom', 'full', 'minimized']`
3. Else if `viewportWidth / availableHeight > autoRightAspectRatioBreakpoint`:
   - resolve to `right`
   - available states: `['right', 'full', 'minimized']`
4. Else:
   - if width is `>= sidePanelBreakpoint`, available states: `['right', 'bottom', 'full', 'minimized']` and default resolved is `right`
   - otherwise available states: `['full', 'minimized']`

Manual selections are viewport-constrained in V1. Recalculation can override manual choice based on current rules.

### Recalculation Timing (V1)

- Initial mount recalculation: immediate.
- Subsequent recalculations from resize/measurement updates: debounced using `layoutDebounceMs` (default `200ms`).
- Missing `header` or `footer` slots are treated as measured height `0`.

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `header` | ✓ | Top chrome. Height contributes to available space when present. |
| `default` |  | Main content area. |
| `sidePanel` | ✓ | Receives `sidePanelMode`, `sidePanelModeResolved`, `availableStates`, `overlayOnly`, `setSidePanelMode(mode)`, and `closeSidePanel()`. |
| `footer` | ✓ | Bottom chrome. Height contributes to available space when present. |

#### Side panel slot handler rules

- `setSidePanelMode(mode)`:
  - If mode is unavailable, fallback to `auto` and emit `update:sidePanelPosition` with `auto`.
- `closeSidePanel()`:
  - Valid only when `overlayOnly === true`.
  - Sets selected mode to `minimized`.
  - When `overlayOnly === false`, callers should use `setSidePanelMode('minimized')`.

### Availability Event Behavior (V1)

`sidePanelAvailableStates`:

- Emits once on initial mount when side panel slot is present.
- Emits only when payload values change.
- In `none` mode, emits once on entry to `none`, then suppresses updates while still in `none`.

### None Mode Behavior (V1)

When side panel slot is absent:

- `sidePanelMode = 'none'`
- `sidePanelModeResolved = 'none'`
- Incoming `sidePanelPosition` is accepted but ignored for layout logic.
- Side-panel-related emits are suppressed.
- `defaultSlotResize` is suppressed.
- `overlayOnly` remains breakpoint-derived for header/footer overlay behavior.

### Auto-Hide Rules (V1)

- Auto-hide applies to header/footer/minimized controls in overlay-only context.
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
- Initial immediate recalculation and debounced subsequent recalculations (`layoutDebounceMs` default and override).
- Missing header/footer slots treated as zero-height inputs.
- `sidePanelAvailableStates` emission behavior (initial emit + change-only emits + `none` entry behavior).
- None-mode suppression behavior for side-panel-related emits and `defaultSlotResize`.
- Auto-hide rules including tall-viewport entry/exit behavior.
- Event assertion strictness: presence-only for transition-related event checks.
