# Live Component Contracts (V1)

Shared canonical contracts for components under `app/components/live`.

## Mode Types

### Selectable mode (`SidePanelMode`)

Used for user-facing selection and `v-model` values when the `sidePanel` slot is present.

- `'auto' | 'right' | 'bottom' | 'full' | 'minimized'`

When the `sidePanel` slot is absent, `sidePanelMode` is `'none'`.

### Resolved mode (`SidePanelModeResolved`)

Used for rendered layout output after `auto` is resolved.

- `'right' | 'bottom' | 'full' | 'minimized' | 'none'`

## Ownership Rules

- `LiveFrame` owns `auto` resolution.
- Child components do not resolve `auto`; they consume selected and resolved values from `LiveFrame`.
- Child components can request mode changes through handlers, but `LiveFrame` is the source of truth.

## Shared Slot Props (V1)

`LiveFrame` `sidePanel` slot provides:

- `sidePanelMode`: selected mode (includes `'auto'`; `'none'` when slot absent)
- `sidePanelModeResolved`: resolved mode (never `'auto'`)
- `availableStates`: selectable states valid for current viewport/context
- `overlayOnly`: `boolean` indicating controls are overlay-only at current breakpoint
- `setSidePanelMode(mode)`: requests a selected mode update
- `closeSidePanel()`: valid only when `overlayOnly === true`; maps to minimize behavior

## Handler Behavior (V1)

- `setSidePanelMode(mode)`:
  - If requested mode is unavailable, fallback to `'auto'`.
  - Emit `update:sidePanelPosition` with `'auto'` on fallback.
- `closeSidePanel()`:
  - Intended only for `overlayOnly === true`.
  - Sets selected mode to `'minimized'`.
  - For non-overlay layouts, callers should use `setSidePanelMode('minimized')`.

## Availability Event Contract (V1)

`sidePanelAvailableStates` payload:

- `{ availableStates, sidePanelMode, sidePanelModeResolved, overlayOnly }`

Emission rules:

- Emit once on initial mount when `sidePanel` slot is present.
- Emit only when one or more payload values change.
- In `'none'` mode, emit once on entry to `'none'`, then suppress while still in `'none'`.

## None Mode Contract (V1)

When `sidePanel` slot is absent:

- `sidePanelMode` and `sidePanelModeResolved` are `'none'`.
- Incoming `sidePanelPosition` values are accepted but ignored for layout behavior.
- Side-panel-related emits are suppressed.
- `defaultSlotResize` is suppressed.
- `overlayOnly` remains breakpoint-derived (for header/footer overlay behavior).
