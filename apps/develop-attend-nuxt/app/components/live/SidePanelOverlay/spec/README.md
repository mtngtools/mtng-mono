# SidePanelOverlay

Backdrop/scrim rendered behind the side panel when in `full` mode. Clicking the overlay closes or minimizes the panel.

## Responsibilities

- Renders a semi-transparent backdrop over the main content area.
- Only visible when side panel is in `full` state.
- Emits a close event on click.

## API

### Props

| Name      | Type      | Default | Description                              |
| :-------- | :-------- | :------ | :--------------------------------------- |
| `visible` | `boolean` | `false` | Whether the overlay is shown.            |

### Emits

- `close` — When the overlay is clicked (signals panel should minimize/close).
