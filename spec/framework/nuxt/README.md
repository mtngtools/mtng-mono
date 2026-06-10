# Nuxt

Specs for **`frame-nuxt`** (and Nuxt-shaped siblings): app integration on top of shared Vue pieces.

- **Belongs here:** modules, layers, Nuxt config hooks, auto-import registration, Nuxt-specific bridges to `frame-vue`.
- **Not here:** raw h3 route handlers (see [Nitro](./../nitro/README.md)); domain rules (CORE).
- **Why:** Nuxt-only concerns stay in one place; Vue library stays portable.

All examples here reference `frame-vue` as example only. Nuxt modules for other Vue packages should change reference as appropriate. 


## Nuxt pages


## Layers


## Modules 

Dedicated folder for each module always containing:
- `index.ts` file for exports
- `[MODULE_NAME].ts` for the module
- `demo.nuxt.config.ts` documenting example usage of the module in a Nuxt config (but not exported)
- `spec` folder
- tests: 
    - Vitest
    - either files (as `*.test.ts`) or `tests` folder

### Primary module

Primary module will need to:
- **Alias** — same ergonomics as [Vue](./../vue/README.md): e.g. `#mtngtools-vue` → the module’s `./runtime/imports` (apps always import through an alias when using the Nuxt module, never directly to location in Vue package).
- **Composable auto-import** — `addImportsDir` on `./runtime` with low `priority` (e.g. `-100`) so app code can override; Nuxt picks up named exports from `imports.ts` (and any other files under `runtime/` if added later).
- **`runtime/imports.ts` (in the Nuxt package)** — barrel that **re-exports** whatever the integration should expose (`@mtngtools/frame-vue/composables`, extra Nuxt-only helpers, etc.). Keeps resolution in one file; the module stays thin.
    - Example **`runtime/imports.ts`** (illustrative):
            ```ts
            export * from '@mtngtools/frame-vue/composables'
            ```
- **Component auto-import** — `addComponentsDir` per [Nuxt kit](https://nuxt.com/docs/api/kit/components) on Vue package's published `dist/` root (under `node_modules`), with **`pathPrefix: false`** so names match the library's flat dist layout. Low `priority` for overrides. Not duplicated inside `runtime/imports.ts` (SFCs are scanned directly from the Vue package).
- **Layers** — expose layers per [Layers](#layers) above so apps extend them via `nuxt.options.extends`.
- **Options & defaults** — typed module options; sensible defaults; document overrides in `demo.nuxt.config.ts`.

#### Example primary module `setup`:
```ts
import { addComponentsDir, addImportsDir, createResolver } from '@nuxt/kit'
import { join } from 'pathe'

setup(options, nuxt) {
  const { resolve } = createResolver(import.meta.url)

  nuxt.options.alias['#mtngtools-vue'] = resolve('./runtime/imports')

  addImportsDir(resolve('./runtime'), { priority: -100 })
  addComponentsDir({
    path: join(nuxt.options.rootDir, 'node_modules/@mtngtools/frame-vue/dist'),
    pathPrefix: false,
    priority: -100,
  })
}
```
