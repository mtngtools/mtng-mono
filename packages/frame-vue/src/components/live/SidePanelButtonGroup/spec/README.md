# SidePanelButtonGroup

Control cluster for selecting side panel modes.

Shared contracts are defined in `packages/frame-vue/src/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render one control per currently available selectable state.
- Reflect selected and resolved state for visual affordances.
- Request mode changes through parent wiring; do not resolve `auto`.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Selected mode (source for active selected control). |
| `sidePanelModeResolved` | `'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Resolved mode (source for resolved-state cues). |
| `availableStates` | `Array<'right' \| 'bottom' \| 'full' \| 'minimized'>` | `[]` | User-selectable modes in this viewport/context. Does not include `'auto'`; no Auto button is ever shown. |
| `overlayOnly` | `boolean` | `false` | Overlay-only behavior hint used by default control rendering. |
| `hideIcons` | `boolean` | `false` | Passes down instruction to suppress control icons. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `setSidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Requests selected mode change. |
| `closeSidePanel` | none | Optional close helper for custom controls/slots. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `default` | ✓ | Override group rendering and custom control composition. |

## Behavior Rules (V1)

- `availableStates` never contains `'auto'`; no Auto control is rendered. Expanding from minimized is done via the header title button, which requests `'auto'` from the parent.
- `LiveFrame` owns `auto` resolution; group only sends requests.
- Controls for unavailable states should not be rendered (or should be disabled if explicitly configured).
- In resolved `none` mode, group should not render panel mode controls.
- Default rendering behavior: when `overlayOnly === true` and `sidePanelModeResolved === 'full'`, render only the `minimized` control (if available) so the single visible action is `Close`.
- Default rendering does not include a separate hard-coded close button.

## Testing Requirements (V1)

- Renders exactly the controls represented by `availableStates` (no Auto button).
- In overlay-only full mode, default rendering collapses to only the `minimized` (`Close`) control.
- Emits requested mode on interaction.
- Honors resolved `none` mode by suppressing panel control rendering.
