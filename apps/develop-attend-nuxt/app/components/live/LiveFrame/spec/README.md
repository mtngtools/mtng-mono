# LiveFrame

A full-screen application frame designed to wrap a live video player or similar immersive content. It provides a fixed layout with slots for a header, footer, a user-controllable `sidePanel` (for polling/questions), and a main content area.

## Features

- **Full Screen**: Fixed positioning filling the viewport (`inset-0`).
- **Layout Logic**:
  - **Header/Footer**: Fixed Top/Bottom, full width, content-sized. Respects **Safe Area Insets** (`safe-area-inset-top/bottom`).
  - **Middle Area**: Fills remaining space. Uses **Dynamic Viewport Height** (`dvh`) to avoid mobile address bar issues.
  - **Side Panel**: User-controllable position/state. Respects **Safe Area Insets** (`safe-area-inset-right/left`) in `right`/`full` modes.
- **Small Viewport Behavior**:
  - At very small viewports, header, footer, and the **side panel toggle button** overlay the main content.
  - **Auto-Hide**: Only the **minimized** side panel controls (and header/footer) auto-hide after user inactivity.
  - **Full Mode**: If the user opens the side panel to `full` (overlay), it **does not** auto-hide. It remains visible until explicitly closed/minimized.
  - Elements reappear on any user interaction.

## API

### Props

| Name                              | Type                                             | Default     | Description                                                                 |
| :-------------------------------- | :----------------------------------------------- | :---------- | :-------------------------------------------------------------------------- |
| `sidePanelPosition`               | `'auto' \| 'right' \| 'bottom' \| 'full' \| 'minimized'` | `'auto'`    | Controls the layout mode of the side panel.                                 |
| `autoBottomAspectRatioBreakpoint` | `number`                                         | `0.9`       | Viewport aspect ratio (h/w) below which `bottom` is supported regardless of width. Allows customization for different video aspect ratios. |
| `autoRightAspectRatioBreakpoint`  | `number`                                         | `3.2`       | Viewport aspect ratio (w/h) above which `right` is supported regardless of width. Allows customization for different video aspect ratios. |
| `sidePanelBreakpoint`             | `ScreenCSSUtilityStringLiteral`                  | `'md'`      | CSS utility breakpoint name (maps to Tailwind breakpoints configured in project). When viewport aspect ratio is between the two aspect ratio breakpoints, this width-based threshold determines if `right`/`bottom` are available. |
| `controlsOverlayOnly`             | `ScreenCSSUtilityStringLiteral`                  | `'sm'`      | CSS utility breakpoint name (maps to Tailwind breakpoints configured in project). Below this, minimized side panel toggle button only appears in overlay mode with auto-hide. Above this, toggle is always visible. |
| `autoHideTimeout`                 | `number`                                         | `5000`      | Duration in milliseconds before header, footer, and side panel toggle auto-hide on small viewports. Any user interaction re-shows them. |
| `expectedMaxHeaderHeight`         | `string`                                         | `'3rem'`    | Expected maximum header height for initial render calculations before actual measurement. Optional. |
| `expectedMaxFooterHeight`         | `string`                                         | `'8rem'`    | Expected maximum footer height for initial render calculations before actual measurement. Optional. |
| `sidePanelMinRight`               | `string`                                         | `'320px'`   | Minimum width when position is 'right'.                                     |
| `sidePanelMaxRight`               | `string`                                         | `'480px'`   | Maximum width when position is 'right' in normal viewports or when manually selected. |
| `sidePanelMaxRightWide`           | `string`                                         | `'40vw'`    | Maximum width when `auto` resolves to `right` due to wide aspect ratio (aspect ratio > `autoRightAspectRatioBreakpoint`). |
| `sidePanelMinBottom`              | `string`                                         | `'200px'`   | Minimum height when position is 'bottom'.                                   |
| `sidePanelMaxBottom`              | `string`                                         | `'400px'`   | Maximum height when position is 'bottom' in normal viewports or when manually selected. |
| `sidePanelMaxBottomTall`          | `string`                                         | `'60vh'`    | Maximum height when `auto` resolves to `bottom` due to tall aspect ratio (aspect ratio < `autoBottomAspectRatioBreakpoint`). |

### Emits

| Event | Payload | Description |
| :--- | :--- | :--- |
| `update:sidePanelPosition` | `SidePanelPosition` | Fired when the user changes the side panel state. Supports `v-model:sidePanelPosition`. |
| `sidePanelTransition` | `{ from, to, reason }` | Fired when the side panel begins a state transition. `reason` is `'user'`, `'breakpoint'`, or `'auto'`. |
| `defaultSlotResize` | `{ width, height }` | Fired when the default slot content (video) changes size. Allows developer to handle with custom code. |

### Side Panel States

- **`auto`** (default): Automatically determines position based on viewport aspect ratio and breakpoints (see logic below).
- **`right`**: Panel beside main content. Availability depends on aspect ratio and breakpoints.
- **`bottom`**: Panel below main content. Availability depends on aspect ratio and breakpoints.
- **`full`**: Panel overlays the main content. Always available. Stays open until user explicitly closes.
- **`minimized`**: Panel collapsed to a toggle button. Always available.

### Auto State Logic

The `auto` state resolves based on viewport aspect ratio and available space after header/footer:

1. **Available space calculation**: `viewportHeight - headerHeight - footerHeight`
2. **Aspect ratio calculation**: 
   - For bottom check: `availableHeight / viewportWidth`
   - For right check: `viewportWidth / availableHeight`
3. **Decision tree**:
   - **IF** aspect ratio (h/w) **< `autoBottomAspectRatioBreakpoint`** (tall viewport):
     - → `auto` resolves to **`bottom`**
     - → Available states: `['bottom', 'full', 'minimized']`
     - → Uses `sidePanelMaxBottomTall` for maximum height (generous viewport-relative sizing)
   - **ELSE IF** aspect ratio (w/h) **> `autoRightAspectRatioBreakpoint`** (wide viewport):
     - → `auto` resolves to **`right`**
     - → Available states: `['right', 'full', 'minimized']`
     - → Uses `sidePanelMaxRightWide` for maximum width (generous viewport-relative sizing)
   - **ELSE** (between aspect ratio breakpoints):
     - → Check viewport width against `sidePanelBreakpoint`
     - → **IF** width **≥ `sidePanelBreakpoint`**:
       - → `auto` resolves to **`right`** (default)
       - → Available states: `['right', 'bottom', 'full', 'minimized']`
       - → Uses standard `sidePanelMaxRight` / `sidePanelMaxBottom` for sizing
     - → **ELSE**:
       - → Available states: `['full', 'minimized']`

**Sizing behavior**: When the user **manually selects** `right` or `bottom` (overriding `auto`), the component uses the standard `sidePanelMaxRight` / `sidePanelMaxBottom` values, not the viewport-relative wide/tall variants. This ensures predictable sizing when users explicitly choose a position.

**Manual selection override**: When the viewport resizes or aspect ratio changes, the auto state logic **always recalculates** and may override the user's manual selection. This ensures optimal layout for the current viewport. The `sidePanelTransition` event will emit with `reason: 'breakpoint'` to indicate the change was viewport-driven, not user-initiated.

### Side Panel Controls

- The component renders a control button allowing the user to cycle between available states.
- Available states are determined by the auto state logic above.
- User can manually select any available state, overriding the `auto` resolution.

### Slots

| Name | Optional | Behavior |
| :--- | :------: | :--- |
| **`header`** | ✓ | Fixed top, full width, auto-height based on content. Content expected to be mostly static. |
| **`default`** | | Main content (Video). Receives all appropriate available space (viewport minus header, footer, and side panel). **Responsible for its own internal layout and aspect ratio**. The `LiveFrame` does not constrain or manage the content's aspect ratio. |
| **`sidePanel`** | ✓ | Pass a `SidePanelFrame` instance (or custom component supporting the same interface) here. The component will receive a `layoutMode` prop indicating current layout context (`'right'`, `'bottom'`, `'full'`, `'minimized'`). |
| **`footer`** | ✓ | Fixed bottom, full width, auto-height based on content. Content expected to be mostly static. |

When `header`, `footer`, or `sidePanel` slots are **not provided**, the `default` content area receives all available space.

### Small Viewport / Auto-Hide

- **Header/Footer**: Always displayed on initial load. On viewports below `controlsOverlayOnly`, header and footer move to overlay mode and auto-hide after `autoHideTimeout` ms of inactivity. **Exception**: If viewport aspect ratio is below `autoBottomAspectRatioBreakpoint` (tall), header/footer remain permanently visible.
- **Side panel toggle button**: Below `controlsOverlayOnly`, the minimized toggle button only appears in overlay mode with auto-hide. Above `controlsOverlayOnly`, the toggle is always visible.
- **Open side panel** (in `full` mode): Does **not** auto-hide. Remains open until user explicitly closes/minimizes.
- **Re-show trigger**: Any user interaction (mousemove, click, tap, scroll, keyboard) re-shows auto-hidden elements and resets the timer.
- **Implementation**: Use VueUse `useIdle` for inactivity detection, `ResizeObserver` for content size monitoring.

### Initial Render Behavior

- On first render, use `expectedMaxHeaderHeight` and `expectedMaxFooterHeight` (if provided) to calculate initial available space and aspect ratio.
- After DOM mount, measure actual header/footer heights with `ResizeObserver` and recalculate if needed.
- If actual measurements differ significantly from expected values, may trigger a state transition with `reason: 'auto'`.

### SSR & Hydration Strategy

- **Challenge**: Server lacks `window` dimensions; Client `auto` logic depends on them. Mismatch causes hydration errors/layout shifts.
- **Strategy**:
  - Default to a `minimized` state during SSR.
  - Use `onMounted` hook to perform the initial measurement and `auto` state resolution.


### Z-Index Strategy

Suggested stacking order (lowest to highest):

| Layer | Z-Index | Notes |
| :--- | :--- | :--- |
| Default content | `0` | Base layer — video player |
| Side panel (`right`/`bottom`) | `10` | Adjacent, not overlapping |
| Side panel (`full`) | `30` | Overlays content |
| Side panel overlay/scrim | `20` | Behind `full` panel, above content |
| Header/Footer (overlay mode) | `40` | Above everything when overlaying |
| Side panel toggle button | `40` | Same level as header/footer chrome |

> **Note**: Modals, tooltips, or popovers triggered from within the frame should be **teleported** to `body` to avoid z-index and clipping issues tailored to the frame's stacking context.

### State Persistence (Planned, do not implement yet)

- User's chosen `sidePanelPosition` can be persisted to `localStorage`.
- On load, restore the persisted preference **only if the current viewport supports it**.
- If the viewport is below `sidePanelBreakpoint` and the stored value is `right` or `bottom`, fall back to `auto` behavior.
- VueUse `useLocalStorage` is a good fit for this.

## Testing Requirements

Tests in `index.test.ts` (vitest) should verify:

- **Aspect ratio decision tree**: Mock viewport dimensions and header/footer heights to test all branches of the auto state logic. Verify correct state availability for:
  - Tall viewports (aspect ratio < 0.9)
  - Wide viewports (aspect ratio > 3.2)
  - In-between aspect ratios above and below `sidePanelBreakpoint`
- **Content area layout stability**: The `default` slot container must not change size when its inner content changes (e.g., video element loads, resizes, or swaps). Mount with dynamically sized content and assert the container dimensions remain constant.
- **Slot rendering**: Header/footer/sidePanel render only when slot content is provided.
- **Side panel states**: Each `sidePanelPosition` value produces the correct layout structure.
- **Auto-hide behavior**: Mock timers (`vi.useFakeTimers()`) to test:
  - Elements hide after `autoHideTimeout`
  - User interaction resets timer and re-shows elements
  - Exception: tall viewports keep header/footer visible
  - Exception: open side panel (`full` mode) never auto-hides
- **Event emissions**: Verify `sidePanelTransition` emits with correct `reason` field, and `defaultSlotResize` emits on content size changes.
- **State persistence**: Test localStorage save/restore with invalid state handling (e.g., saved `right` but viewport only supports `full`/`minimized`).

## Related Components

### Current

- **`SidePanelFrame`** — Container/chrome wrapping side panel content. Handles sizing and positioning per state.
- **`SidePanelButtonGroup`** — Groups control buttons; adapts available states based on viewport.
- **`SidePanelControlButton`** — Individual button for a single side panel state.
- **`SidePanelHeader`** — Title bar within the panel. Houses `SidePanelButtonGroup`.
- **`SidePanelOverlay`** — Backdrop/scrim behind the panel in `full` mode.

### Planned

- **`SidePanelDragHandle`** — Manual resize handle within min/max bounds. Persist custom sizes per position state.
- **`SidePanelTransition`** — Animation wrapper for state transitions. Specify transition properties, duration, easing. Respect `prefers-reduced-motion`.
- **Accessibility** — Keyboard navigation, ARIA attributes, focus trapping in `full` mode (use VueUse `useFocusTrap`), screen reader announcements, Escape key to close `full` mode.
- **Touch gestures** — Swipe to open/close side panel on mobile. Define gesture thresholds and conflict resolution with video player controls.

### Future Considerations

- **`videoAspectRatio` prop** — Allow configuring non-16:9 video aspect ratios to adjust auto state logic accordingly.
- **Transition definitions** — Specify exact animation types for layout changes when switching `bottom` ↔ `right` (slide, fade, resize timing).
- **Dynamic header/footer heights** — Handle responsive utility classes or dynamic content changes in header/footer that affect available space calculations. Would require debounced recalculation of aspect ratios.
- **Minimum viewport size** — Define minimum supported viewport dimensions and behavior when below threshold (e.g., warning, forced layout mode, scroll behavior).
- **Hybrid manual selection persistence** — Add configurable breakpoints for when viewport changes should override user's manual selection. Allow manual selection to persist for normal resizes but force change only on extreme aspect ratio threshold crossings. Would require additional props to control this behavior.
