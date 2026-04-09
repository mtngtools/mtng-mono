# Development plan: compose-attend-ref-1a-aws-nuxt-mux

How we build the app. Requirements: [README.md](./README.md). Meeting context (types, composition, wiring): [meeting-context.md](./meeting-context.md).

## Principles

1. Spec in `./spec/README.md`; code should map to it.
2. Phase 1: implement inside this app only (`apps/compose-attend-ref-1a-aws-nuxt-mux`), using existing packages; no required changes under `packages/*` for Phase 1.
3. Phase 2: move pages, components, composables, `server/api`, and plugins into FRAME (Nuxt layer in `@mtngtools/frame-nuxt`; Mux pieces may go to `frame-vue` or future `frame-vue-mux`). App left with mostly `nuxt.config`, env notes, and optional overrides.

### Meeting context — where types live

- **Phase 1:** define meeting-context interfaces and app constants under this app (e.g. `server/types/` or next to the plugin); use `SessionWithPres`, `SessionBaseState`, `BaseEnv` / meeting types from `@mtngtools/core`.
- **Phase 2:** promote stable pieces to `@mtngtools/core` (`MtContextBase`-style types, default `getMtDirFromSlug`, `APPL_NAME_WATCH`, `ROLE_NAME_ATTEND`, shared capability interfaces); admin-only extensions to `@mtngtools/core-admin`. Full sketch: [meeting-context.md](./meeting-context.md).

## Phase 1

### Goals

- Behavior matches [README.md](./README.md).
- Deps via pnpm workspace here (`apps/*`, `packages/*`).

### Dependencies (mtng-mono)

- `@mtngtools/core`, `@mtngtools/provide-aws`, `@aws-sdk/client-s3`; session parsing/keys in-app or from workspace helpers.
- Nuxt 4, `@mtngtools/frame-nuxt` (e.g. frame-vue module), `@mtngtools/frame-vue`, Tailwind.
- `@nuxt/scripts`, `@nuxt/icon`; optional `@nuxtjs/device` for autoplay.

Prefer `@mtngtools/*` imports. Extra packages from a consumer workspace: add only through this app’s `package.json`; don’t document paths outside mtng-mono in these specs.

### Checklist

- [ ] `nuxt.config.ts` — runtimeConfig, AWS Nitro preset, `mux-player` custom element, Tailwind/Vite; optional `extends: ['@mtngtools/frame-nuxt/layers/base']`.
- [ ] `server/plugins/` — meeting context per [meeting-context.md](./meeting-context.md): **`event.context`** exposes **`getMeetingContext(mtSlug)`** returning cached context with **`getMeeting`** (once specified), **`getSession`**, **`getSessionState`**; default implementation can be identical for every meeting; reference app backs these with object storage (S3), keeping bucket/key details inside that layer.
- [ ] `server/api/[mtSlug]/session/[ssSlug]/index.get.ts` — call **`getSession`** on meeting context; 404 if missing.
- [ ] `server/api/[mtSlug]/state/session/[ssSlug]/index.get.ts` — call **`getSessionState`** with query-derived options (`ovrd` / `version`); no hardcoded customer Mux ids (storage, env, or dev fixture only).
- [ ] Pages — `[mtSlug]/session/[ssSlug]/index.vue`, `.../presentation/[plSlug].vue`; optional `lv/mux/[id].vue`.
- [ ] Copy from config, not hardcoded conference strings.
- [ ] `package.json` aligned with other apps here.

### Layout (example)

| Path | Role |
|------|------|
| `server/plugins/<meeting-context>.ts` (name optional) | `getMeetingContext` + `getMeeting` / `getSession` / `getSessionState` (S3-backed in this app) |
| `server/api/.../session/.../index.get.ts` | Thin: meeting context → `getSession` |
| `server/api/.../state/session/.../index.get.ts` | Thin: meeting context → `getSessionState` |
| `app/pages/.../session/.../index.vue` | Live / archive / status UI |
| `app/pages/.../presentation/[plSlug].vue` | VOD |
| `nuxt.config.ts` | Env, Lambda, Mux, Tailwind |

### Local dev without S3

- Dev bucket + test keys in runtimeConfig, and/or
- `@mtngtools/develop-mock-data` or dev-only Nitro handlers (`import.meta.dev` or explicit env).

### Phase 1 done when

- README requirements work in workspace; no fork-specific ids in committed source.

## Phase 2

### Goals

- Mostly `nuxt.config.ts` with `extends` to one or more layers (name TBD, e.g. attend-aws-mux).
- Little or no extra under `app/`.
- Deploy/env notes in `spec/` or package README.
- Layer holds shared attendee UI and server routes for reuse.

### Moves (example)

| After Phase 1 | Toward |
|---------------|--------|
| `app/pages/**` | `frame-nuxt/layers/<layer>/app/pages/**` |
| `app/components/**` | layer or `frame-vue` |
| `app/composables/**` | layer or `frame-vue` |
| `server/**` | layer `server/**` |
| Mux load + wrapper | `frame-vue` or `frame-vue-mux` |

### Cleanup

- Shared S3/session logic → `@mtngtools/provide-aws` / `@mtngtools/core` (or small new package) instead of one-off code in the app.
- Update [package-directory.md](../../../package-directory.md) and [frame-nuxt/README.md](../../../packages/frame-nuxt/README.md) for the layer.

### Phase 2 done when

- New deploy uses config + layer extends; app folder stays small.
