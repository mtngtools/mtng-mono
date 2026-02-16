# SidePanelFrame

Container component that wraps the side panel content. Provides the visual chrome (background, border, overflow) and manages its own positioning within the `LiveFrame` middle area based on the current `sidePanelPosition` state.

Intended to be placed into the `LiveFrame`'s `sidePanel` slot.

## Responsibilities

- Receives `position` state from `LiveFrame` (or internal composable).
- Applies correct CSS for each state (`right`, `bottom`, `full`, `minimized`).
- Handles sizing within `min`/`max` constraints (for `right` and `bottom`).
- Manages overflow/scroll of its slotted content.
- Composes sub-components (`SidePanelHeader`, `SidePanelButtonGroup`, `SidePanelOverlay`) with optional slot overrides.

## API

### Props

| Name       | Type                                                       | Default     | Description                          |
| :--------- | :--------------------------------------------------------- | :---------- | :----------------------------------- |
| `position` | `'right' \| 'bottom' \| 'full' \| 'minimized'`             | `'right'`   | Current resolved position state.     |
| `minWidth` | `string`                                                   | `'320px'`   | Min width in `right` mode.           |
| `maxWidth` | `string`                                                   | `'480px'`   | Max width in `right` mode.           |
| `minHeight`| `string`                                                   | `'200px'`   | Min height in `bottom` mode.         |
| `maxHeight`| `string`                                                   | `'400px'`   | Max height in `bottom` mode.         |

### Slots

| Name | Optional | Behavior |
| :--- | :------: | :--- |
| **`default`** | | Panel content (e.g., iframe, widget). |
| **`header`** | ✓ | Defaults to `SidePanelHeader`. Override to provide custom panel header/title bar. |
| **`buttonGroup`** | ✓ | Defaults to `SidePanelButtonGroup`. Override to provide custom control buttons. |
| **`overlay`** | ✓ | Defaults to `SidePanelOverlay`. Override to provide custom backdrop in `full` mode. |

## Design Constraints

> [!IMPORTANT]
> A future `MultiContentSidePanelFrame` will extend this pattern to support multiple switchable content areas (e.g., questions, polling, chat) with tab-like navigation. **Do not build this now**, but the current `SidePanelFrame` must not make it harder to build later.

To support this:
- The `default` slot should remain the **sole content insertion point**. `MultiContentSidePanelFrame` will manage its own internal content switching and pass it through.
- Props should stay focused on **frame concerns** (position, sizing) — not content-specific logic.
- Internal layout (header, content, overlay) should be composable, not tightly coupled.
- Avoid assumptions about the number or type of content areas.

### Planned

- **`MultiContentSidePanelFrame`** — Wraps or extends `SidePanelFrame` with tab/selector UI for switching between multiple content panels (questions, polling, chat, etc.). Avoid implementation that would make this more difficult in future. 
