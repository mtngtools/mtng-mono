# VanillaIf

A Vue wrapper component around `v-if` designed to seamlessly handle deferred Vanilla JavaScript initialization. It delays rendering its slot content entirely until it can resolve its `show` condition.

## Use Case

When integrating Vue components into environments with plain Vanilla JavaScript (like standard HTML files or SSR frameworks), external vanilla scripts that define application state or authentication functions may load asynchronously or executing after the Vue application has already mounted. `VanillaIf` gracefully waits for these external dependencies to become available before deciding which slot to render.

## API

### Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `show` | `boolean \| (() => boolean) \| Ref<boolean>` | `undefined` | The condition to evaluate to determine slot visibility. |
| `showWindowFn` | `string` | `undefined` | Optional window function name. If provided, evaluates `window[showWindowFn]()` instead of `show`. |

### Slots

| Name | Optional | Behavior |
| :--- | :--- | :--- |
| `default` | | Mounted if `show` resolves to `true`. |
| `else` | ✓ | Mounted if `show` resolves to `false`. |

## Initialization & Polling Behavior (V1)

When `VanillaIf` mounts, it attempts to evaluate the `show` prop:

- **Boolean / Ref**: Resolves and renders immediately.
- **Function (`() => boolean`)**: The component executes the getter.
  - Because external vanilla scripts might not have populated the `window` or global scope yet, the function might throw a `ReferenceError` or `TypeError` (e.g., `window.myVanillaCheck is not a function`), or it might return `undefined`/`null`.
  - If the function throws an error or returns a non-boolean value, `VanillaIf` assumes the dependency is not yet ready.
  - It will immediately enter a rapid polling state (e.g., `setInterval` every 50ms), repeatedly evaluating the function.
  - As soon as the function successfully executes and returns a strict `boolean`, the interval is cleared, the value is locked in, and the appropriate slot is rendered.

While `VanillaIf` is in this "waiting/polling" state, **neither slot is mounted**. The component renders nothing or empty comments.

## Future Specifications (Post-V1)

- **Continued Polling**: Allow an opt-in behavior where the polling interval continues indefinitely even after the initial resolution, acting as an active watcher for vanilla state changes.
- **Refresh Method**: Expose a `refresh()` method on the component instance to manually force a re-evaluation of the `show` prop from external scripts.
- **Fallback / Loading Slot**: Introduce a `#loading` slot to display temporary UI while the component is locked in the polling state waiting for resolution.
