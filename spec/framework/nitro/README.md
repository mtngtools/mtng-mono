# Nitro / h3

Specs for **`frame-nitro`**:

- **Belongs here:** event handlers, server middleware patterns, adapters to CORE types, Nitro/h3-only utilities.
- **Not here:** 
    - Vue component and composables (see [Vue](./../vue/README.md))
    - Nuxt module UI wiring (see [Nuxt](./../nuxt/README.md))
    - Platform specific code (e.g. AWS, Mux, etc..)
        - Nitro code specific to a platform should live in the platform specific package (e.g. `@mtngtools/provide-aws-nitro`, `@mtngtools/provide-mux-nitro`, etc..)
- **Why:** server bundle, secrets, and Node APIs stay out of client packages.
