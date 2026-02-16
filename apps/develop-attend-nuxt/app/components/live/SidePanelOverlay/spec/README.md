# SidePanelOverlay

Backdrop for full-mode side panel presentation.

Shared contracts are defined in `app/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render a scrim behind side panel UI when resolved mode is `full`.
- Provide close interaction for overlay-only workflow.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `visible` | `boolean` | `false` | Whether overlay is shown. |
| `overlayOnly` | `boolean` | `false` | Whether close behavior should use overlay-only semantics. |
| `sidePanelModeResolved` | `'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Current resolved mode for visibility guards. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `closeSidePanel` | none | Requests minimize/close action (mapped by parent/`LiveFrame`). |

## Behavior Rules (V1)

- Overlay should only render as interactive when resolved mode is `full` and `visible` is true.
- Close interaction is intended for overlay-only contexts.
- In resolved `none` mode, overlay must not render.

## Testing Requirements (V1)

- Renders only in full-mode visible state.
- Emits close request on overlay click/tap.
- Does not render in resolved `none` mode.
