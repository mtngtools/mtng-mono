# Mock Data Contract

This document defines the contract for `@mtngtools/develop-mock-data` as a recipe compiler for deterministic meeting schedules.

## Goals

1. Construct realistic meetings from explicit recipe intent.
2. Keep generated content deterministic and compact.
3. Preserve referential integrity across rooms, sessions, presentations, and speakers.
4. Support both declarative and builder authoring styles with equivalent behavior.

## Primary API

- `createMockMeetingFromRecipe(recipe): MockMeetingData`
- `createMockMeetingFromBuilder(build): MockMeetingData`
- `createRecipeBuilder(): RecipeBuilder`

`MockMeetingData` returns:

- `rooms: Room[]`
- `sessions: (SessionWithPres & { rmId: string; ssType: SessionType; venueId: string; dayIndex: number; blockId: string })[]`

## Recipe Compiler Stages

1. `normalizeRecipe`:
   - validates and normalizes dates, room groups, room-block hierarchy, and block definitions.
2. `planTimeBlocksByDayRoom`:
   - expands room-group blocks into per-day, per-room planned blocks.
3. `applyRulesAndConstraints`:
   - enforces global rules (e.g., plenary unopposed windows).
4. `materializeRoomsSessionsPresSpeakers`:
   - materializes deterministic entities from planned blocks.

## Session Recipe Resolution

Session construction defaults are hierarchical:

- meeting-level `defaults.defaultSessionRecipe`,
- meeting-level per-session-type recipes in `defaults.sessionTypeRecipes`,
- block-level `sessionRecipe`,
- block-level direct override fields.

This enables a plenary-specific shape (for example intro + 4 presentations) while allowing block-specific variants (for example intro + 3 presentations + panel with custom timing).

## Deterministic Rules

- No random source in default execution path.
- Stable IDs/slugs generated from normalized recipe coordinates:
  - day index,
  - block index,
  - room identity.
- Time calculations derive from recipe day + block windows only.
- Dictionary-based name/title generation is index-composed and deterministic.

## Rule Contracts

- **Plenary Unopposed**:
  - any block tagged as plenary-unopposed must emit only plenary sessions and suppress other room blocks in that window.
- **Room Lifecycle Merge**:
  - recipes can define transitions such as `BallroomA + BallroomB -> BallroomAB` starting on a specific day.
  - merged room output uses new room identity and receives subsequent assignments.
- **Venue-aware Blocks**:
  - blocks can target on-site rooms or off-site venue rooms (e.g., hotel-sponsored sessions).

## Custom Injection Contracts

Each planned block may provide partial customization:

- `sessionOverrides`,
- `presentationOverrides`,
- `speakerOverrides`,
- optional callbacks for custom patching.

Overrides are applied after deterministic base generation so custom edits are localized.

Custom session generation may be provided via `sessionFactory({ seed, createDefaultSession })` at recipe scope, session-type scope, or block scope. The factory may:

- return a fully custom session,
- call `createDefaultSession()` and post-process it.

## Constants Contract

The package exports stable enum-like constants for recipe inputs:

- `RoomType`
- `SessionType`
- `VenueType`

These constants are the canonical values for recipe authoring and tests.

## Testing Requirements

- Declarative and builder parity tests.
- Plenary unopposed rule tests.
- Ballroom merge lifecycle tests.
- Room-group block assignment tests.
- Off-site venue block tests.
- Partial override behavior tests.
- Deterministic repeatability tests for full recipe outputs.
