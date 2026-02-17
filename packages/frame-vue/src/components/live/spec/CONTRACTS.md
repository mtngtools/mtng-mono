# Live Component Contracts (V1)

Shared canonical contracts for components under `packages/frame-vue/src/components/live`.

## Mode Types

### Selectable mode (`SidePanelMode`)

Used for user-facing selection and `v-model` values when `sidePanelContent` is present.

- `'auto' | 'right' | 'bottom' | 'full' | 'minimized'`
- V1 default selected mode is `'minimized'` when `sidePanelContent` exists and caller does not pass an explicit `sidePanelPosition`.
- **User cannot select `'auto'`** from controls: no Auto button is shown. `'auto'` is still a valid mode (set automatically on viewport change, or when the user clicks the minimized header button to expand). The `sidePanelAvailableStates` payload and the `availableStates` prop passed to child components exclude `'auto'`.

When `sidePanelContent` is absent, `sidePanelMode` is `'none'`.

### Resolved mode (`SidePanelModeResolved`)

Used for rendered layout output after `auto` is resolved.

- `'right' | 'bottom' | 'full' | 'minimized' | 'none'`

## Ownership Rules

- `LiveFrame` owns `auto` resolution.
- Child components do not resolve `auto`; they consume selected and resolved values from `LiveFrame`.
- Child components can request mode changes through handlers, but `LiveFrame` is the source of truth.
- Top-level frame layout geometry is owned by `LiveFrame` and must not be driven by default slot content size.
- `LiveFrame` owns default-slot fit behavior: default content fills the allocated `main` region and is clipped when oversized.
- **No overlap unless**: (1) `overlayOnly === true`, or (2) user has chosen `full` (only the side panel frame is visible), or (3) minimized state where the side panel frame sits on top of main content at the bottom. In all other non-overlay states, main and side panel must not overlap.
- In non-overlay contexts (`overlayOnly === false`), `LiveFrame` must prevent default content from being visible behind side panel frame chrome. The default content region (and its bottom edge) must never extend below or behind the side panel frame; that overlap is allowed only when `overlayOnly === true` or in minimized/full as above.
- In non-overlay contexts, side-panel frame shell chrome should be opaque (non-translucent) to avoid content bleed-through.
- In non-overlay `full` mode, side-panel shell should render edge-to-edge without rounded-corner gaps.
- In non-overlay `right`/`bottom` states, `LiveFrame` must place `main` and side panel host in separate `article` tracks (no overlap). **Touch rules**: when stacked (bottom), the bottom of the main content frame must align with the top of the side panel frame (they touch). When side-by-side (right), the right of the main content frame must align with the left edge of the side panel frame (they touch).

## LiveFrame Side Panel Slot Contract (V1)

`LiveFrame` exposes one content-only slot:

- `sidePanelContent`: rendered into the default content area of an internally managed `SidePanelFrame`.

`LiveFrame` manages side panel frame/chrome, controls, and handlers internally in V1.
Future planned feature: `sidePanelFrame` slot for full frame customization.

## SidePanelHeader Default Rendering Contract (V1)

When no `default` slot is provided to `SidePanelHeader`:

- If `sidePanelModeResolved === 'minimized'`, render a title button that requests `setSidePanelMode('auto')` (expand to current auto-resolved layout). This is the only user action that sets selected mode to `'auto'`; there is no Auto control in the button group.
- In minimized fallback, center the title button in the header row.
- Otherwise, render left-aligned title text with trailing colon.
- `SidePanelButtonGroup` is hidden while minimized and shown in the right controls region for non-minimized states.
- `SidePanelFrame` may disable non-minimized fallback title text via `showTitleLabel`; V1 default for `SidePanelFrame` is `false` to avoid duplicate titles because side panel content commonly carries its own heading.
- Minimized title button remains visible regardless of `showTitleLabel`.

## Handler Behavior (V1)

- `setSidePanelMode(mode)`:
  - If requested mode is unavailable, fallback to `'auto'`.
  - Emit `update:sidePanelPosition` with `'auto'` on fallback.
- `closeSidePanel()`:
  - Intended only for `overlayOnly === true`.
  - Sets selected mode to `'minimized'`.
  - For non-overlay layouts, callers should use `setSidePanelMode('minimized')`.

## Default Control Visibility (V1)

- In default `SidePanelButtonGroup` rendering, there is no separate hard-coded close button.
- When `overlayOnly === true` and `sidePanelModeResolved === 'full'`, default controls render only the `minimized` control.
- The `minimized` control label is `Close` and serves as the default close action in that context.

## Availability Event Contract (V1)

`sidePanelAvailableStates` payload:

- `{ availableStates, sidePanelMode, sidePanelModeResolved, overlayOnly }`
- `availableStates` lists only **user-selectable** modes; it does **not** include `'auto'`. Control rendering must not show an Auto button.

Emission rules:

- Emit once on initial mount when `sidePanelContent` is present.
- Emit only when one or more payload values change.
- In `'none'` mode, emit once on entry to `'none'`, then suppress while still in `'none'`.

## None Mode Contract (V1)

When `sidePanelContent` is absent:

- `sidePanelMode` and `sidePanelModeResolved` are `'none'`.
- Incoming `sidePanelPosition` values are accepted but ignored for layout behavior.
- Side-panel-related emits are suppressed.
- `defaultSlotResize` is suppressed.
- `overlayOnly` remains breakpoint-derived (for header overlay behavior).
