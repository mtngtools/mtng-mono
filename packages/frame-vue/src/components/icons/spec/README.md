# Icons

A set of SVG icons to be used throughout the Vue components, specifically designed to be customized with CSS strings.

Shared contracts are defined in `packages/frame-vue/src/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render simple, scalable SVG imagery without complex internal logic.
- Accept customizable styling dimensions and colors.

## API

All icon components share the following properties.

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `borderSize` | `number` | `2` | Stroke width for the path borders. |
| `borderColor` | `string` | `'currentColor'` | Color of the stroke. |
| `backgroundColor` | `string` | `'currentColor'` | Background fill color behind or inside the main shape. (Defaults to `transparent` for `IconClose`). Maintains 30% opacity when set to `currentColor` for standard icons. |
| `foregroundColor` | `string` | `'currentColor'` | Main fill color for active shapes/regions. |

### Emits

(None)

### Slots

(None)

## Standard Icons (V1)

- `IconPanelRight`: Represents a right-side panel layout (approx right 1/4 filled).
- `IconPanelBottom`: Represents a bottom panel layout (approx bottom 1/3 filled).
- `IconPanelFull`: Represents a full window layout.
- `IconClose`: An X symbol to minimize or close.

## Behavior Rules (V1)

- Icons should inherit dimensions from their parent container (e.g., width="1em", height="1em") to allow sizing via CSS text size or explicit w/h utility classes.
- Attributes internally applied to `<svg>` should default intelligently so they render visibly out of the box.

## Testing Requirements (V1)

- Render correctly with default props.
- Applying color and size props correctly passes through to internal SVG nodes.
