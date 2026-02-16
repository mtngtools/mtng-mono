# SidePanelHeader

Header bar for `SidePanelFrame` containing title content and panel controls.

Shared contracts are defined in `app/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render title region for side panel context.
- Host control region (typically `SidePanelButtonGroup`).
- Surface close action only when overlay-only behavior is active.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `''` | Optional title text. |
| `sidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Selected mode for display/state cues. |
| `sidePanelModeResolved` | `'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Resolved layout mode for display/state cues. |
| `overlayOnly` | `boolean` | `false` | Whether close control should use overlay-only semantics. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `setSidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Requests selected mode change through parent wiring. |
| `closeSidePanel` | none | Valid only for `overlayOnly === true`; requests minimize/close. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `default` | ✓ | Custom title/content area. |
| `controls` | ✓ | Custom controls area. |

## Behavior Rules (V1)

- Header consumes selected/resolved values but never resolves `auto`.
- `closeSidePanel` affordance should be shown only when `overlayOnly` is true.
- In resolved `none` mode, header should not render panel-only controls.

## Testing Requirements (V1)

- Title and control regions render with default and slot overrides.
- Overlay-only close affordance visibility follows `overlayOnly`.
- Emits are forwarded correctly when controls are activated.
