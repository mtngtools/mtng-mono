# @mtngtools/frame-nuxt

Nuxt module and layer library for mtngTOOLS. This package provides **multiple Nuxt modules** and **multiple Nuxt layers**; use only the ones you need.

**Nuxt:** 4.3.0 (peer `>=4.0.0`; dev/build use 4.3.0).

## Layout

- **`src/modules/`** — Nuxt module source; built to `dist/modules/`.
- **`layers/`** — Nuxt layers (source, no build). Each layer is a directory with its own `nuxt.config.ts`.

## Modules

| Subpath | Description |
| :--- | :--- |
| `@mtngtools/frame-nuxt/modules/frame-vue` | Registers `@mtngtools/frame-vue` components and composables (e.g. `SampleGreeting`, `useCounter`) for auto-import. |

### Usage (frame-vue module)

In your Nuxt app’s `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@mtngtools/frame-nuxt/modules/frame-vue'],
  // Optional: frameVue: { prefix: 'Mtng' } for prefixed component names
});
```

Ensure `@mtngtools/frame-vue` is installed (the module adds it as a dependency).

## Layers

| Path | Description |
| :--- | :--- |
| `@mtngtools/frame-nuxt/layers/base` | Base layer with shared defaults for mtngTOOLS Nuxt apps. |
| `@mtngtools/frame-nuxt/layers/admin` | Admin layer for admin apps. |

### Usage (layers)

In your Nuxt app’s `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: ['@mtngtools/frame-nuxt/layers/base'],
  // or for admin: extends: ['@mtngtools/frame-nuxt/layers/admin']
});
```

## Adding more modules or layers

- **New module**: Add `src/modules/<name>.ts`, add a lib entry in `vite.config.ts`, and export `./modules/<name>` in `package.json`.
- **New layer**: Add `layers/<name>/nuxt.config.ts` (and any layer-specific dirs). Include `layers` in `package.json` `files` (already there).

## Scripts

- `pnpm run build` — build modules to `dist/`
- `pnpm run dev` — watch build
- `pnpm run typecheck` — TypeScript check
- `pnpm run lint` — oxlint
