# Meeting context

Typed contract and composition for **meeting-scoped server context** (often keyed by **`mtSlug`**). High-level requirement: [README.md — Meeting context (Nitro)](./README.md#meeting-context-nitro). Where code and packages evolve over time: [dev-plan.md](./dev-plan.md).

This document is intentionally **implementation-agnostic**: a **Nitro plugin** is the expected wiring for this app today, but the same types can be satisfied other ways later.

---

#### Goals

- **`@mtngtools/core`** [`app-env.ts`](../../../packages/core/src/app-env.ts) and [`meeting.ts`](../../../packages/core/src/data/meeting.ts) remain the source for **`opEnv`**, **`orgDir`**, **`mtDir`**, meeting/session shapes unless this spec narrows them.

---

#### Composition model

- Each Nuxt app declares a **meeting context type** as **base capabilities** plus **optional capability modules** (loading meeting metadata, session, and session state).
- Handlers depend on the **intersection** the app exports so missing capabilities are a **type error**, not a runtime surprise.

---

#### Base context (typical for all `mt-context` usages)

- **`opEnv`** — operational environment (see `HasOp` in core).
- **`orgDir`** — organization directory segment (see `HasOrg` in core).
- **`mtSlug`** — meeting segment from the route.
- **`mtDir`** — directory used in storage keys; usually derived from **`mtSlug`**.
  - using **`getMtDirFromSlug(mtSlug: string): string`** — default implementation returns **`mtSlug`**; replace for per-deployment or per-meeting mapping without changing handlers.
- **`applName`** — application name for layout/storage conventions (core: `HasApplName`).
- **`roleName`** — audience for this app surface (core: **`ROLE_NAME_PUBLIC`**, **`ROLE_NAME_ADMIN`**, **`ROLE_NAME_INTEGRATION`**).

#### This reference app (`compose-attend-ref-1a-aws-nuxt-mux`)

- **`applName`:** **`"watch"`** — add **`APPL_NAME_WATCH`** to **`@mtngtools/core`** when promoting the constant.
- **`roleName`:** **`"attend"`** — add **`ROLE_NAME_ATTEND`** to **`@mtngtools/core`** for attendee-facing apps; keep distinct from **`ROLE_NAME_PUBLIC`** where that names a different surface.

---

#### Meeting data capability

- Narrow type (name TBD), e.g. **`HasMeetingAccess`**, with **`getMeeting(meetingDataOptions)`** (exact signature, return type, and options **to be defined** — likely a core **`Meeting`** or **`MeetingBase`** subset, possibly parameterized by options).
- Apps that do not need meeting metadata omit this module.

---

#### Session capability

- For apps that load published **sessions** and/or **session states**.
- Narrow type, e.g. **`HasSessionDataAccess`**, with:
  - **`getSession(ssSlug, sessionDataOptions)`** → **`SessionWithPres`** (or agreed subset).
  - **`getSessionState(ssSlug, sessionStateOptions)`** → **`SessionBaseState`** (or agreed superset); options may reflect query params (**`ovrd`**, **`version`**) without fixing storage mapping here.

---

#### Reference app shape

- **Attendee context** for this repo is expected to compose **base** + **meeting data** (**`getMeeting`**) + **session** (**`getSession`**, **`getSessionState`**). Exact TypeScript names are decided in implementation; behavior must match [README.md](./README.md) APIs and pages.
- **Admin or other apps** omit **`HasSessionDataAccess`** or **`HasMeetingAccess`** when not needed; they may add modules typed in **core-admin** or locally.

---

#### Nitro (typical wiring)

- A server plugin attaches **`getMeetingContext(mtSlug)`** on **`event.context`**; it returns an object satisfying the app’s composed type, **cached per `mtSlug` per process**.
- Pages and server api routes the need this context will either have a `mtSlug` path or query param or fallback to a configured default `mtSlug` .
- **`createMeetingContext(mtSlug)`** resolves **`mtDir`**, copies **`opEnv`** / **`orgDir`** from config, sets **`applName`** / **`roleName`**, and attaches **`getMeeting`** / **`getSession`** / **`getSessionState`** per the composed type.

---

#### See also

- [README.md](./README.md)
- [dev-plan.md](./dev-plan.md)
