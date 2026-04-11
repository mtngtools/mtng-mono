# Specifications: compose-attend-ref-1a-aws-nuxt-mux

- Spec for the reference attendee Nuxt app (AWS, Nitro, Mux).
- Phases: [dev-plan.md](./dev-plan.md).

## Purpose

- Reference app others can copy and deploy with little custom code.
- Layering follows [README.md](../../../README.md) and [package-directory.md](../../../package-directory.md) (UTILS, CORE, FRAME, PROVIDE, COMPOSE, DEVELOP, DEPLOY, BUILD).

## Out of scope

- Built-in Q&A, chat, or polling (only external links from data).
- Admin, ingest, or Mux asset workflows.
- Hardcoded meeting IDs, titles, or stream mappings in source.

## Meeting context (Nitro)

- A **Nitro server plugin** provides **meeting-level dependency injection** so handlers use a per-meeting context (from `**mtSlug`**) instead of ad hoc wiring.
- The context exposes implementations such as:
  - `**getMeeting**` — meeting-level data (shape and options **TBD**).
  - `**getSession`** — session payload for a `**ssSlug**`.
  - `**getSessionState**` — session state for a `**ssSlug**`.
- Types, optional modules, `**applName**` / `**roleName**` for this app, storage mapping, and plugin vs other wiring: [meeting-context.md](./meeting-context.md).

## User HTTP entry points (Nuxt page routes)

#### Common to all pages below

- Nuxt app **pages**
- `use[PAGETYPE]Page` composables to setup page
  - Loading data from [API (Nitro server routes)](#api-nitro-server-routes) via `useFetch` (or equivalent) with types from shared packages.
- Session flows use `**mtSlug`** and `**ssSlug`** in the path (same meaning as in API path params).
- Meeting title and other display copy from `runtimeConfig` / `app.config`, not literals in components.
- Each page uses subsections **Data** (what loads from the server) and **UI** (what the user sees).

### `PAGE /[mtSlug]/session/[ssSlug]`

#### Page setup

`**useSessionPage`**: composable providing:

- top level Vue computed values for the page: 
  - `pageTitle` 
  - `session` 
    - satisfies `SessionWithPres`.
    - from `**GET /api/:mtSlug/session/:ssSlug`**.
  - `sessionState` 
    - satisfies `SessionBaseState`.
    - from `**GET /api/:mtSlug/state/session/:ssSlug`**.
  - `timeline`: top level returning value from sessionState.timeline
  - computed from `timeline`:
    - `isUnknown`
    - `isLive`
    - `isPreLive`
    - `isPostLive`
    - `isArchive`
    - `isRetired`

#### UI

- Top Level Layout Component for each timeline:
  - `UnknownSessionPage`
  - `LiveSessionPage`
  - `PreLiveSessionPage`
  - `PostLiveSessionPage`
  - `ArchiveSessionPage`
  - `RetiredSessionPage`

---

### `PAGE /[mtSlug]/session/[ssSlug]/presentation/[plSlug]`

#### Data

- `**useSessionPage`** (or a small wrapper around it) supplies session payload and state so `plSlug` and archive playback resolve the same way as on the session page; the page stays mostly template + composable.

#### UI

- Archive Mux for `plSlug` when timeline and state allow; navigation back to session page.

---

### `PAGE /lv/mux/[id]` (optional)

#### UI

- Mux playback for quality checks; off or non-prod-only via config.

---

## API (Nitro server routes)

#### Common to all handlers below

- Paths from the site origin. First segment after `/api/` is `**mtSlug`** (meeting segment; pairs with `mtDir` in server context). `**ssSlug`** is the session segment in the path.
- `**200`:** JSON body unless noted.
- `**404`:** use when required S3 object is missing or the payload cannot be used to build the response (per-route detail only if something differs).
- Each handler uses subsections **Query**, **Response (200)**, **Backend**; add **Response (errors)** only when not covered above.

---

### `GET /api/:mtSlug/session/:ssSlug`

#### Response (200)

- Type `SessionWithPres`.
- Session title, id, presentation list when applicable.

#### Backend

- Handler resolves `**mtSlug`** → meeting context → `**getSession**` (see [meeting-context.md](./meeting-context.md)).
- This reference app will provide implementation for `**getSessionState**` loading objects from the AWS S3 buckets.

---

### `GET /api/:mtSlug/state/session/:ssSlug`

#### Query parameters

- Optional `ovrd`, `version` — test overrides or alternate state path (e.g. non-public scope/version).
- Default: omit query; load public state.

#### Response (200)

- Type `SessionBaseState`.
  - Timeline
  - Playback-related fields.

#### Backend

- Handler resolves `**mtSlug**` → meeting context → `**getSessionState**` with query-derived options (e.g. `**ovrd**`, `**version**`); see [meeting-context.md](./meeting-context.md).
- This reference app will provide implementation for `**getSessionState**` loading objects from the AWS S3 buckets.

---

#### Client

- `useFetch` (or equivalent) to the APIs; types from shared packages.
- `mux-player` as custom element; load script via `@nuxt/scripts` (or equivalent).
- Tailwind (or same stack as other mtng Nuxt apps). Layout fits large screens for live video.
- Autoplay: optional `@nuxtjs/device` (or similar); rule TBD when implemented.

---

#### Runtime configuration

- **AWS / Nitro:** data, resources, cache buckets if used; Lambda-style Nitro preset.
- **Public:** `orgDir`, `opEnv`, CDN base for static.
- **App:** optional CDN URL; meeting title / metadata.
- **Secrets:** env → `runtimeConfig`; keep secrets out of public client config.
- List concrete env names here when fixed.

---

#### S3

- S3 objects used by this reference app will be populated by a separate admin app or dev setup process.
- Key layout and bucket choice live in the meeting-context implementation ([meeting-context.md](./meeting-context.md)); expand this section when that layout is finalized.

---

#### Deployment

- Nitro preset for AWS Lambda (or similar); `inlineDynamicImports`; AWS SDK externals as needed.
- Configurable CDN for static/app assets.
- Document IAM: S3 read on data + resources buckets used by these routes.

---

#### Security

- No end-user auth.
  - Other reference app with provide implementations including auth.
- Avoid logging PII.

---

#### See also

- [Repo README.md](../../../README.md), [Repo GLOSSARY.md](../../../GLOSSARY.md), [Repo package-directory.md](../../../package-directory.md)
- [Spec dev-plan.md](./dev-plan.md), [Spec meeting-context.md](./meeting-context.md)

