# SidePanelButtonGroup

Control cluster for selecting side panel modes.

Shared contracts are defined in `app/components/live/spec/CONTRACTS.md`.

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
| `availableStates` | `Array<'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'>` | `[]` | Modes currently selectable in this viewport/context. |
| `overlayOnly` | `boolean` | `false` | Overlay-only behavior hint for control styling and close interactions. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `setSidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Requests selected mode change. |
| `closeSidePanel` | none | Optional close action for overlay-only contexts. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `default` | ✓ | Override group rendering and custom control composition. |

## Behavior Rules (V1)

- `auto` is included as a selectable state when present in `availableStates`.
- `LiveFrame` owns `auto` resolution; group only sends requests.
- Controls for unavailable states should not be rendered (or should be disabled if explicitly configured).
- In resolved `none` mode, group should not render panel mode controls.

## Testing Requirements (V1)

- Renders exactly the controls represented by `availableStates`.
- Supports `auto` control display and selection requests.
- Emits requested mode on interaction.
- Honors resolved `none` mode by suppressing panel control rendering.
