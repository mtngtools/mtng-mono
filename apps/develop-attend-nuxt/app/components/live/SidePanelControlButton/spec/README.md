# SidePanelControlButton

Single mode control used by `SidePanelButtonGroup`.

Shared contracts are defined in `app/components/live/spec/CONTRACTS.md`.

## V1 Responsibilities

- Represent one selectable mode action.
- Show active/inactive visual state.
- Emit selection intent.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `state` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | — | Selectable mode this control targets. |
| `active` | `boolean` | `false` | Whether this control is active in selected-mode terms. |
| `activeResolved` | `boolean` | `false` | Whether this control matches current resolved mode. |
| `disabled` | `boolean` | `false` | Whether this control can currently be activated. |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `click` | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | Selection request payload for parent/group wiring. |

### Slots

| Name | Optional | Behavior |
| :--- | :---: | :--- |
| `icon` | ✓ | Override icon rendering. |
| `label` | ✓ | Override label rendering. |

## Default Label Mapping (V1)

| State | Label |
| :--- | :--- |
| `auto` | `Auto` |
| `right` | `Right` |
| `bottom` | `Bottom` |
| `full` | `Full` |
| `minimized` | `Minimize` |

## Behavior Rules (V1)

- If `disabled`, clicks must not emit.
- Visual distinction should support selected and resolved cues where both are provided.
- Accessibility and advanced responsive display variants are out of V1 scope for this spec pass.

## Testing Requirements (V1)

- Emits expected payload on click when enabled.
- Does not emit when disabled.
- Active/activeResolved visual state props are applied as expected.
