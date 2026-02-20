# SidePanelFrame

Container/chrome for side panel content rendered by `LiveFrame` around the `sidePanelContent` slot.

Canonical shared types and contract rules are defined in `packages/frame-vue/src/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Render panel shell based on resolved mode from `LiveFrame`.
- Apply mode-specific sizing constraints.
- Compose optional sub-slots (`header`, `buttonGroup`) without owning mode-resolution logic.
- Expose a predictable structure that works with `LiveFrame` selected/resolved mode contracts.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Selected mode from `LiveFrame`. |
| `sidePanelModeResolved` | `'right' \| 'bottom' \| 'full' \| 'minimized' \| 'none'` | `'none'` | Resolved render mode from `LiveFrame`. |
| `availableStates` | `Array<'right' \| 'bottom' \| 'full' \| 'minimized'>` | `[]` | User-selectable states in current context (excludes `'auto'`). |
| `overlayOnly` | `boolean` | `false` | Whether controls should use overlay-only behavior. |
| `showTitleLabel` | `boolean` | `false` | Whether `SidePanelHeader` should render its non-minimized fallback title text label. Defaults `false` because side panel content typically carries its own heading. Minimized title button remains visible. |
| `hideIcons` | `boolean` | `false` | Passes down instruction to suppress control icons. |
| `minWidth` | `string` | `'320px'` | Minimum width when resolved mode is `right`. |
| `maxWidth` | `string` | `'30vw'` | Maximum width when resolved mode is `right`. |
| `minHeight` | `string` | `'200px'` | Minimum height when resolved mode is `bottom`. |
| `maxHeight` | `string` | `'30vh'` | Maximum height when resolved mode is `bottom`. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `setSidePanelMode` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Requests a selected mode change via `LiveFrame` handler wiring. |
| `closeSidePanel` | none | Optional helper request for overlay close/minimize workflows. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `default` |  | Panel content. |
| `header` | ✓ | Header region; defaults to `SidePanelHeader` behavior when implemented. |


## Behavior Rules (V1)

- Do not resolve `auto`; always use `sidePanelModeResolved` for layout classes and structure.
- Respect `overlayOnly` for control behavior.
- In non-overlay contexts, frame shell chrome should be opaque so default content cannot show through panel surface.
- In non-overlay `full` mode, frame shell should be edge-to-edge (no rounded-corner bleed path to underlying content).
- In overlay-only + full mode, default header controls should expose only the `minimized` (`Close`) action.
- In `none` resolved mode, frame chrome should not render side-panel structure.
- In `minimized` resolved mode, show only the top header row; panel body content is hidden.
- In `minimized` resolved mode, frame grid uses a single header row track (no second body row track).
- In `minimized` resolved mode, frame is anchored at the bottom-center of the article region.
- In `minimized` resolved mode, `SidePanelButtonGroup` is not shown; `SidePanelHeader` provides the title-button path to return to `auto`.
- Default controls are rendered in the top header row via `SidePanelHeader` (no separate bottom controls row in V1).
- Header non-minimized fallback text-label visibility is controlled by `showTitleLabel`; default is hidden to avoid duplicate headings when side panel content already includes a title.
- Minimized header title button remains visible regardless of `showTitleLabel`.
- Keep component focused on frame/chrome concerns only.
- Layout strategy: use `display: grid` with `place-items` (or align/justify) to position the frame shell. Avoid `display: flex` for structural layout.
- Header sizing must be organically driven by its content using `max-content` rows, allowing inner buttons and padding to naturally dictate the frame's height limits.

## Testing Requirements (V1)

- Renders expected structure per `sidePanelModeResolved` value.
- Applies sizing props in `right` and `bottom`.
- No panel chrome render when resolved mode is `none`.
- Overlay-only + full mode default header controls collapse to minimized-only (`Close`).
- Emits mode/close requests from user interactions without owning resolution.
