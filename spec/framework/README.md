# Framework

Requirements for **where** code lives and **why** it is split across FRAME packages (Vue, Nuxt, Nitro).

- **Goal:** one obvious home per kind of framework coupling; apps compose instead of re-implementing glue.
- **Layer:** FRAME depends on UTILS + CORE only — see [package directory](../../package-directory.md).

## By surface

- **[Vue](./vue/README.md)** — components, composables, Vue-only helpers (`frame-vue`, …).
- **[Nuxt](./nuxt/README.md)** — modules, layers, Nuxt wiring (`frame-nuxt`, …).
- **[Nitro / h3](./nitro/README.md)** — server handlers, h3/Nitro runtime (`frame-nitro`, …).
