# SidePanelHeader

Header bar for `SidePanelFrame` containing title content and panel controls.

Shared contracts are defined in `packages/frame-vue/src/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render title region for side panel context.
- Host control region (typically `SidePanelButtonGroup`).
- Forward control actions without owning `auto` resolution.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `'Submit Questions'` | Header title text used by default-title rendering paths. |
| `showTitleLabel` | `boolean` | `true` | Whether non-minimized fallback title text label is rendered when no `default` slot is provided. |
| `sidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Selected mode for display/state cues. |
| `sidePanelModeResolved` | `'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Resolved layout mode for display/state cues. |
| `overlayOnly` | `boolean` | `false` | Overlay-only context hint forwarded to controls. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `setSidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Requests selected mode change through parent wiring. |
| `closeSidePanel` | none | Optional helper request for overlay close/minimize workflows. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `default` | ✓ | Custom left title/content region. |
| `controls` | ✓ | Custom right controls region. |

## Behavior Rules (V1)

- Header consumes selected/resolved values but never resolves `auto`.
- Default controls follow `SidePanelButtonGroup` behavior; in overlay-only + full mode, only `minimized` (`Close`) should be visible.
- If custom controls expose a dedicated close affordance, it should be limited to overlay-only usage.
- In resolved `none` mode, header should not render panel-only controls.
- Right controls region is right-aligned when rendered.
- `SidePanelButtonGroup` is hidden when resolved mode is `minimized`.
- Default-slot fallback behavior (when no `default` slot is provided):
  - If resolved mode is `minimized`, always render a centered title button that emits `setSidePanelMode('auto')`.
  - If `showTitleLabel` is `true` and resolved mode is not `minimized`, render a left-aligned text label with trailing colon (`${title}:`).
  - If `showTitleLabel` is `false` and resolved mode is not `minimized`, fallback text label is not rendered.

## Testing Requirements (V1)

- Title and control regions render with default and slot overrides.
- Default controls align with overlay-only/full minimized-only visibility behavior.
- Emits are forwarded correctly when controls are activated.
