# mtngTOOLS glossary

Definitions aligned with [README.md](README.md) and the [`core`](packages/core) package (plus [`core-admin`](packages/core-admin) where noted). 

## Solution Domains

- **Watch**: Delivering session video to attendees (live and on-demand). Current emphasis in README: virtual attendees; planned: on-site viewing.
- **Produce**: Organizer-side run-of-show support (README: data-driven run-of-show, presentation timers, digital displays). Planned in the README’s “Planned and Future” list.
- **Interact**: Attendee and presenter engagement (Q&A, polling, chat). In README: handled via integrations with external providers, not as native mtngTOOLS product surface.

## Product Surfaces

- **Attendee Portal**: End-user application for streaming and VOD; README notes possible expansion beyond that later.
- **Administration**: Organizer-facing tools for schedules and assets, resource assignment, live/archived video workflows, and vendor integrations (e.g. Mux).
- **On-site Tools**: In-venue tooling such as speaker timers and digital displays.
- **Logistics**: Staff-facing data views and workflows (under on-site in README).

## Environment and Roles (`core` / `app-env`)

- **Organization directory (`orgDir`)**: Stable org-scoped path segment used in keys and config. For example `acme`.
- **Meeting directory (`mtDir`)**: Stable meeting-scoped directory segment; short string identifier for a meeting. For example `2026demo`.
- **Operation environment (`opEnv`)**: Deployment lifecycle environment. For example, `rnd`, `dev`, `qa`, `review`, `prod`.
- **Application role (`applRole`)**: Primary access audience for that application. For example, `admin`, `attendee`, `integration` (`ROLE_NAME_*`).
- **Application name (`applName`)**: Used when multiple variants serving the same role need to be deployed for an organization. For example, an `admin` site for `watch` and a different one for `produce`.

## Meeting Model (`core` / `data/meeting`)

- **Meeting (`mt*`)**: An organized event, usually centered on one main site (sometimes with additional supporting venues). In this glossary, **conference** means the same thing. The core program is a series of **sessions** held in **rooms** to impart knowledge and/or discuss a topic. Many meetings also include exhibition or poster programming (see **Exhibition Hall**, **Poster Hall**).
- **Room (`rm*`)**: Physical or logical location for sessions; identifiers and optional venue metadata.
- **Session (`ss*`)**: A scheduled block (title, start/end, optional room link `rmId`, optional `qaLink`, contains presentations).
- **Presentation (`pr*`)**: A talk or segment within a session, contains **speakers**.
- **Speaker (`sp*`)**: Person associated with a presentation or session.
- **Resolved variations** (`ResolvedMeeting`, `ResolvedSession`, etc.): Variants where optional fields are resolved from other fields or configurable defaults.
- **Exhibition Hall**: An area where organizations display products or services to meeting attendees.
- **Poster Hall**: An area—common at scientific and technical meetings—where work is presented on posters, often linked to an abstract or published paper.

Entity fields use two-letter prefixes (`mt`, `rm`, `ss`, `pr`, `sp`, `tz`) when types are composed—see the spec README table.

## Session Playback and Timeline (`core` / `state/session`, `media`)

- **Live Player**: Interface and data to watch the live stream of a session.
- **Archive Player**: Interface and data to watch the archived version of a session. Archive players could either include the entire session or a portion of the session. If a portion, it would often be a single presentation within the session.
- **Session Timeline**: Session lifecycle: `unknown`, `prelive`, `live` (using live player), `postlive`, `archive` (using archive player), `retired`.
- **Playback**: Resource details required to play a live or archive media file in a player. Various playback providers may require different fields.

## Code Organization (Layer Names)

Short names from README; each maps to packages or apps in the monorepo.

- **UTILS**: Domain-agnostic helpers (e.g. `utils-core`, `utils-hls`, `utils-unstorage`).
- **CORE**: Shared meeting-domain types and logic (`core`; README also mentions `core-types`, `core-plus` as part of the intended split—this repo may ship a subset).
- **FRAME**: Framework-facing shared UI and patterns (`frame-vue`, `frame-nuxt`).
- **PROVIDE**: Service implementations of core interfaces (`provide-aws`, `provide-mux`, etc.).
- **COMPOSE**: Reference applications composing the layers.
- **DEVELOP**: Sandboxes, mocks, and dev aids.
- **BUILD**: Workspace and build wiring (pnpm, turbo, submodules).
