# Development plan: compose-admin-ref-1a-aws-nuxt-mux

How we build the app (when implementation starts). Requirements: [README.md](./README.md). Admin meeting context: [meeting-context.md](./meeting-context.md). Attendee counterpart: [compose-attend dev-plan](../../compose-attend-ref-1a-aws-nuxt-mux/spec/dev-plan.md).

## Principles

1. Spec in `./spec/README.md`; code should map to it.
2. Phase 1: implement inside this app only (`apps/compose-admin-ref-1a-aws-nuxt-mux`), using existing packages; avoid required `packages/*` changes unless unavoidable.
3. Phase 2: move shared admin UI, composables, `server/api`, and plugins toward FRAME (`frame-nuxt-admin`, `frame-vue-admin` when they exist; see [package-directory.md](../../../package-directory.md)).

### Meeting context — where types live

- **Phase 1:** compose admin context types next to the Nitro plugin; consume `SessionWithPres`, `SessionBaseState`, `ROLE_NAME_ADMIN`, env types from `@mtngtools/core`; admin-only shapes from `@mtngtools/core-admin`.
- **Phase 2:** promote stable admin context interfaces to `@mtngtools/core-admin` (or `@mtngtools/core` where truly shared); keep fork-specific wiring in the app or recipe.

## Phase 1

### Goals

- Behavior matches [README.md](./README.md).
- Deps via pnpm workspace (`apps/*`, `packages/*`).
- Read paths stay compatible with [attend APIs](../../compose-attend-ref-1a-aws-nuxt-mux/spec/README.md#api-nitro-server-routes) where this app exposes the same GET contracts.

### Dependencies (mtng-mono)

- `@mtngtools/core`, `@mtngtools/core-admin`, `@mtngtools/provide-aws`, `@aws-sdk/client-s3`; Mux SDK or `provide-mux` when available.
- Nuxt 4, `@mtngtools/frame-nuxt`, `@mtngtools/frame-vue`, Tailwind; `@nuxt/scripts` for `mux-player` where needed.

Prefer `@mtngtools/*` imports. Do not document consumer-only paths outside mtng-mono in these specs.

### Checklist

- [ ] `nuxt.config.ts` — runtimeConfig (AWS buckets, Mux secrets server-side, optional Lambda names), Nitro preset, Tailwind/Vite; optional `extends` from `frame-nuxt` base layer.
- [ ] `server/plugins/` — meeting context per [meeting-context.md](./meeting-context.md): **`getMeetingContext(mtSlug)`** with read + write capabilities as specified; S3 (and later Mux) details encapsulated.
- [ ] `GET .../session/:ssSlug` and `GET .../state/session/:ssSlug` — align with attend behavior for public reads; support preview/override query conventions as spec’d.
- [ ] POST (or PATCH) routes for preview state and preview → public promotion — thin handlers.
- [ ] Optional: Mux batch/asset routes, streams/record routes, transfer route — only if listed in README MVP/later for that milestone.
- [ ] Session admin page(s) + composables; titles and labels from config.
- [ ] Operator auth placeholder or real integration (**TBD** in README).
- [ ] `package.json` aligned with other apps in the workspace.

### Layout (example)

| Path | Role |
|------|------|
| `server/plugins/<meeting-context>.ts` | `getMeetingContext` + read/write session state + optional Mux/Lambda helpers |
| `server/api/.../session/.../index.get.ts` | Thin: → `getSession` |
| `server/api/.../state/session/.../index.get.ts` | Thin: → `getSessionState` |
| `server/api/.../state/session/.../preview*.ts` | Preview write / promote |
| `app/pages/.../admin/...` (paths TBD) | Operator UI |
| `nuxt.config.ts` | Env, Lambda, Mux, Tailwind |

### Local dev without full AWS

- Dev buckets + keys in runtimeConfig, and/or `@mtngtools/develop-mock-data`, and/or dev-only handlers.

### Phase 1 done when

- README MVP stories work in workspace; no fork-specific ids or titles in committed source.

## Phase 2

### Goals

- Mostly `nuxt.config.ts` with `extends` to admin-oriented layer(s).
- Shared admin routes and UI live in FRAME packages; this app stays thin.

### Moves (example)

| After Phase 1 | Toward |
|---------------|--------|
| `app/pages/**` | `frame-nuxt-admin` layer |
| `app/components/**` | `frame-vue-admin` or layer |
| `server/**` | layer `server/**` |
| Mux helpers | `provide-mux` / `frame-vue-mux` |

### Cleanup

- Shared S3/state/Mux logic → `provide-aws`, `provide-mux`, `core-admin` as appropriate.
- Update [package-directory.md](../../../package-directory.md) and frame package READMEs.

### Phase 2 done when

- New deploy uses config + layer extends; app folder stays small.
