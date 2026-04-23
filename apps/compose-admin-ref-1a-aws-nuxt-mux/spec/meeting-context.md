# Meeting context (admin reference app)

Typed contract for **meeting-scoped server context** for `compose-admin-ref-1a-aws-nuxt-mux`. High-level requirements: [README.md — Meeting context](./README.md#meeting-context-nitro). Shared base concepts: [attend meeting-context](../../compose-attend-ref-1a-aws-nuxt-mux/spec/meeting-context.md). Evolution: [dev-plan.md](./dev-plan.md).

This document is **implementation-agnostic** about whether wiring is a Nitro plugin or another pattern, but a **Nitro plugin** matching the attend reference is the default expectation.

---

#### Goals

- **`@mtngtools/core`** remains the source for **`opEnv`**, **`orgDir`**, **`mtDir`**, and attendee-facing session/state shapes unless this spec narrows them.
- **`@mtngtools/core-admin`** holds or will hold admin-specific types (state drafts, media operations) that should not pollute attendee-only code paths.

---

#### Base context

Same as attend’s [base context](../../compose-attend-ref-1a-aws-nuxt-mux/spec/meeting-context.md#base-context-typical-for-all-mt-context-usages): **`opEnv`**, **`orgDir`**, **`mtSlug`**, **`mtDir`**, **`getMtDirFromSlug`**, **`applName`**, **`roleName`**.

#### This reference app (`compose-admin-ref-1a-aws-nuxt-mux`)

- **`roleName`:** **`ROLE_NAME_ADMIN`** (see [`app-env.ts`](../../../packages/core/src/app-env.ts)).
- **`applName`:** **TBD** — choose a stable string for storage/layout; add **`APPL_NAME_*`** to core when promoted (see [README](./README.md)).

---

#### Session read capability (public / operator view)

- Align with **`HasSessionDataAccess`** from the attend sketch: **`getSession`**, **`getSessionState`** returning **`SessionWithPres`** and **`SessionBaseState`** (or agreed supersets) so GET handlers can match the [attend API](../../compose-attend-ref-1a-aws-nuxt-mux/spec/README.md#api-nitro-server-routes) contracts.
- Options on **`getSessionState`** should continue to support query-driven **`ovrd`** / **`version`** where applicable.

---

#### Session state write capability (admin extension)

- Narrow type (name TBD), e.g. **`HasSessionStateWrite`**, with operations such as:
  - **`putSessionPreviewState(ssSlug, timelineOrScope, payload, options)`** — write preview branch of state (exact shape **TBD**; may map to croi-style `preview/[timeline].post`).
  - **`publishSessionState(ssSlug, options)`** — promote preview to public (maps conceptually to croi-style `preview-to-public`).
- Signatures, idempotency, and validation belong in **`@mtngtools/core-admin`** once stabilized; Phase 1 may define them locally next to the plugin.

---

#### Optional capability modules

- **`HasMuxAdmin`** — create/update assets, batch encode, fetch playback metadata; depends on server-only Mux credentials.
- **`HasStreamDiscovery`** — list live streams / room recordings from storage or APIs (operator aids).
- **`HasTransfer`** — invoke Lambda or similar for HLS/m3u8 transfer; **`transferM3u8ToS3LambdaName`**-style values from **`runtimeConfig`**, not literals.

Apps compose **base** + **session read** + **session write** + optional modules. Handlers depend on the intersection the app exports.

---

#### Nitro (typical wiring)

- **`event.context`** exposes **`getMeetingContext(mtSlug)`** returning a **cached** object per **`mtSlug`** per process.
- **`createMeetingContext(mtSlug)`** sets **`roleName`** to admin, sets **`applName`**, resolves **`mtDir`**, wires **`getSession`** / **`getSessionState`**, and attaches write/Mux/stream modules per the composed type.

---

#### See also

- [README.md](./README.md)
- [dev-plan.md](./dev-plan.md)
- [Attend meeting-context](../../compose-attend-ref-1a-aws-nuxt-mux/spec/meeting-context.md)
