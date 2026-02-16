# SidePanelFrame

Container/chrome for side panel content rendered inside the `LiveFrame` `sidePanel` slot.

Canonical shared types and contract rules are defined in `app/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render panel shell based on resolved mode from `LiveFrame`.
- Apply mode-specific sizing constraints.
- Compose optional sub-slots (`header`, `buttonGroup`, `overlay`) without owning mode-resolution logic.
- Expose a predictable structure that works with `LiveFrame` selected/resolved mode contracts.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Selected mode from `LiveFrame`. |
| `sidePanelModeResolved` | `'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Resolved render mode from `LiveFrame`. |
| `availableStates` | `Array<'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'>` | `[]` | Selectable states in current context. |
| `overlayOnly` | `boolean` | `false` | Whether controls should use overlay-only behavior. |
| `minWidth` | `string` | `'320px'` | Minimum width when resolved mode is `right`. |
| `maxWidth` | `string` | `'480px'` | Maximum width when resolved mode is `right`. |
| `minHeight` | `string` | `'200px'` | Minimum height when resolved mode is `bottom`. |
| `maxHeight` | `string` | `'400px'` | Maximum height when resolved mode is `bottom`. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `setSidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Requests a selected mode change via `LiveFrame` handler wiring. |
| `closeSidePanel` | none | Requests close action. Valid only when `overlayOnly === true`. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `default` |  | Panel content. |
| `header` | ✓ | Header region; defaults to `SidePanelHeader` behavior when implemented. |
| `buttonGroup` | ✓ | Controls region; defaults to `SidePanelButtonGroup` behavior when implemented. |
| `overlay` | ✓ | Overlay region for `full` mode interactions. |

## Behavior Rules (V1)

- Do not resolve `auto`; always use `sidePanelModeResolved` for layout classes and structure.
- Respect `overlayOnly` for control affordances and close behavior.
- In `none` resolved mode, frame chrome should not render side-panel structure.
- Keep component focused on frame/chrome concerns only.

## Testing Requirements (V1)

- Renders expected structure per `sidePanelModeResolved` value.
- Applies sizing props in `right` and `bottom`.
- No panel chrome render when resolved mode is `none`.
- Emits mode/close requests from user interactions without owning resolution.
