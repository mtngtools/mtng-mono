# SidePanelControlButton

Individual button representing a single side panel state. Rendered within `SidePanelButtonGroup`.

## Responsibilities

- Displays an icon or label for its target state.
- Emits a click event to switch to that state.
- Visually indicates when it is the active state.

## API

### Props

| Name     | Type                                                                  | Default | Description                            |
| :------- | :-------------------------------------------------------------------- | :------ | :------------------------------------- |
| `state`  | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'`              | —       | The state this button represents.      |
| `active` | `boolean`                                                             | `false` | Whether this is the currently active state. |

### Emits

- `click` — When the button is pressed.

### Slots

| Name | Optional | Behavior |
| :--- | :------: | :--- |
| **`icon`** | ✓ | Override the default icon for this state. |
| **`label`** | ✓ | Override the default label text for this state. |

### Icons & Labels

Each state has a default icon and label. Options for rendering icons:
- [Nuxt Icon](https://nuxt.com/modules/icon) module (e.g., `<Icon name="..." />`)
- Custom inline SVG elements if a precise design is needed

Default mapping:

| State | Icon Concept | Default Label |
| :--- | :--- | :--- |
| `auto` | Auto / smart layout | Auto |
| `right` | Panel docked right | Right |
| `bottom` | Panel docked bottom | Bottom |
| `full` | Expand / maximize | Full |
| `minimized` | Collapse / minimize | Minimize |

### Responsive Display

How the icon and label render should adapt based on viewport size and current control state:

- **Large viewport / expanded controls**: Icon + visible label text.
- **Medium viewport / compact controls**: Icon only; label as tooltip on hover.
- **Small viewport / overlay mode**: Icon only; label as tooltip on tap/hover.
  - **Note**: The visual treatment may differ significantly between "open" (expand) and "close" (minimize) actions in overlay mode.
  - **Minimized**: May appear as a floating action button (FAB) or distinct toggle.
  - **Full**: Should be clearly a "Close" or "Minimize" action (e.g., top-right 'X'), distinct from the navigation controls.
- Label visibility may also depend on the button group's own layout constraints (e.g., vertical vs. horizontal arrangement).
