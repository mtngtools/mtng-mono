# Vue

In general, all Vue code should be packaged in dedicated Vue packages, (e.g. `@mtngtools/frame-vue`, `@mtngtools/frame-vue-admin`, etc..). Vue code directly within a Nuxt app is not reusable and should be limited to examples showing library users how to override the defaults and and customize to their needs. This document focuses on **`frame-vue`** (and Vue-shaped siblings).

- **Belongs here:** components, composables, directives, Vue-only reactivity/helpers, types using Vue types.
- **Not here:** 
    - Nuxt specific code (modules,layers, useNuxtApp, etc..)
    - Nitro/h3 imports, server-only APIs
    - Code common to front-end and backend frameworks.
    - Platform specific code (e.g. AWS, Mux, etc..)
        - Vue code specific to a platform should live in the platform specific package (e.g. `@mtngtools/provide-aws-vue`, `@mtngtools/provide-mux-vue`, etc..)
- **Why:** 
    - Reuse where Vue runs without Nuxt
    - Support server-side frameworks other than Nuxt
    - Bundles free of server-only code

## Standards

- Vue composition api (never options api).
- Build outputs ESM only (no CJS) per stack guidance for Vue libraries.
- Often consumed via a Nuxt module; keep exports suitable for auto-import or direct import.

### Components

- Single-file components (SFCs) for components (absent compelling reason to use other formats).
- Dedicated folder for each component always containing:
    - `index.ts` file for exports
    - `[COMPONENT_NAME].vue` for the component
    - `demo.vue` documenting example usage of the component (but not exported)
    - `spec` folder
    - tests: 
        - Vitest
        - either files (as `*.test.ts`) or `tests` folder
        - if integration and end-to-end tests are needed, they will live outside the component folder in `tests/integration` or `tests/e2e` folders.
    - types:
        - if simple or props-only, can be in `*.vue` file with component
        - otherwise `types.ts`
- Styling:
    - Always use Tailwind CSS for styling.
    - Limit to default classes unless compelling reason for alternative in spec.
- Using composables:
    - Import composables using aliases to be defined in package `spec` (e.g. `import { useLivePlayer } from '#mtngtools-vue' `)
    - "Component Composable"
        - Most of the setup function code should live in a "Component Composables" named `use[COMPONENT_NAME].ts`
        - Imported using the alias (not just relative file reference) in the component file.
        - The goals of this composable is not to share code between different components, but to share code between the component and customized version meant to be a drop-in replacement for the component. Allowing library users to both:
            - Clone the component and customize template portion without having to duplicate and maintain most of the setup function code. 
            - Clone the component composable and customize the composable functions.
    - Code to be share between different components should live outside the components folder in a `composables` folder.

### Composables

- Dedicated folder for each composable always containing:
    - optional `index.ts` if exports are needed, see [Runtime Imports](#runtime-imports) below for more details on composable exports
    - `[COMPOSABLE_NAME].ts` for the composable
    - `demo.ts` documenting example usage of the composable (but not exported)
    - `spec` folder
    - types:
        - if simple or props-only, can be in `[COMPOSABLE_NAME].ts`
        - otherwise `types.ts`
    - tests: 
        - Vitest
        - either files (as `*.test.ts`) or `tests` folder

#### Runtime Imports

- `runtime/imports.ts` exporting all composables from this location in order to create a centralized that forces both the library and the end-user to resolve logic through the an alias (e.g. `#mtngtools-vue`) enabling total optimal Nuxt auto-importing.

