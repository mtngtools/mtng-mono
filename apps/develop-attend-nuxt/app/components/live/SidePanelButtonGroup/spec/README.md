# SidePanelButtonGroup

Groups `SidePanelControlButton` instances together. Handles layout and positioning of the button cluster, adapting which buttons are shown based on the current viewport (above/below `sidePanelBreakpoint`).

## Responsibilities

- Renders one `SidePanelControlButton` per available state.
- Above breakpoint: shows buttons for `right`, `bottom`, `full`, `minimized`.
- Below breakpoint: shows buttons for `full`, `minimized` only.
- Highlights the currently active state.

## API

### Props

| Name              | Type                                                       | Default     | Description                                  |
| :---------------- | :--------------------------------------------------------- | :---------- | :------------------------------------------- |
| `modelValue`      | `'right' \| 'bottom' \| 'full' \| 'minimized'`             | —           | Current active state (`v-model`).            |
| `availableStates` | `Array<string>`                                            | all states  | Which states are available at this viewport. |

### Emits

- `update:modelValue` — When user selects a new state.

### Slots

- **`default`**: Override with custom buttons if needed.
