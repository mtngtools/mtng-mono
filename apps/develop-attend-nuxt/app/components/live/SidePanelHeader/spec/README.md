# SidePanelHeader

Title bar rendered at the top of the side panel. Contains a label/title slot, the `SidePanelButtonGroup`, and optionally a close button.

## Responsibilities

- Provides a consistent top bar within the `SidePanelFrame`.
- Houses the `SidePanelButtonGroup` for state controls.
- Optionally renders a close/minimize action.

## API

### Props

| Name    | Type     | Default | Description                          |
| :------ | :------- | :------ | :----------------------------------- |
| `title` | `string` | `''`    | Optional title text for the panel.   |

### Slots

- **`default`**: Override title area with custom content.
- **`controls`**: Override or extend the button group area.
