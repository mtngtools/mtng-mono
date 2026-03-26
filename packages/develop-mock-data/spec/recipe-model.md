# Recipe Model

This document defines the canonical recipe schema used by both declarative input and builder compilation.

## Top-Level Recipe Shape

```ts
type RecipeConfig = {
  meeting: {
    mtDir: string;
    mtName: string;
    startDate: string; // YYYY-MM-DD
    dayCount: number;
    timezone?: string;
  };
  venues: RecipeVenue[];
  rooms: RecipeRoom[];
  roomGroups?: RecipeRoomGroup[];
  roomBlocks?: RecipeRoomBlock[];
  roomLifecycles?: RecipeRoomLifecycleRule[];
  blockTemplates?: RecipeBlockTemplate[];
  dayPlans: RecipeDayPlan[];
  rules?: RecipeRuleConfig;
  defaults?: RecipeDefaults;
};
```

`RecipeDefaults` includes:

```ts
type RecipeDefaults = {
  defaultSessionType?: SessionType;
  sessionCountPerRoom?: number;
  presentationsPerSession?: number;
  speakersPerPresentation?: number;
  defaultSessionRecipe?: SessionRecipe;
  sessionTypeRecipes?: Partial<Record<SessionType, SessionRecipe>>;
};
```

### Session construction hierarchy

Session generation is resolved in this order (later wins):

1. package/global defaults,
2. meeting-level `defaults.defaultSessionRecipe`,
3. meeting-level `defaults.sessionTypeRecipes[sessionType]`,
4. block-level `sessionRecipe`,
5. block-level direct fields (`sessionCountPerRoom`, `presentationsPerSession`, `speakersPerPresentation`, direct override hooks).

## Rooms and Groups

- `RecipeRoom` models a concrete room identity (`HallA`, `BallroomA`, `Room101`).
- `RecipeRoomGroup` provides named groups for block assignment (e.g., `breakoutFloor1`).
- `RecipeRoomLifecycleRule` allows split/merge transitions by day index.

## Day Plan and Blocks

`RecipeDayPlan` declares schedule intent for one day:

- `dayIndex`
- `blocks: RecipeBlock[]`

Each `RecipeBlock` specifies:

- time window (`startTime`, `endTime`),
- target rooms or room groups,
- `sessionType`,
- optional `sessionCountPerRoom`,
- optional per-block overrides and callbacks.
- optional `sessionRecipe` for type/block-specific session construction, including:
  - `presentationPlan` with item-level duration and speaker-count control,
  - optional `sessionFactory` for fully custom session construction.

## Room Blocks Hierarchy

`roomBlocks` provides a compact hierarchy for repeated schedules across room sets and day sets.

```ts
type RecipeRoomBlock = {
  roomIds?: string[];
  roomGroupIds?: string[];
  roomTypeFilter?: RoomType[];
  sessionType?: SessionType | "default";
  dayBlocks: Array<{
    dayIndexes: number[]; // one-based
    timeBlocks: Array<{
      startTime: string;
      endTime: string;
      sessionType?: SessionType | "default";
      // plus optional overrides/sessionRecipe hooks
    }>;
  }>;
};
```

`"default"` resolves to `defaults.defaultSessionType` (fallback: `SessionType.Symposium`).

## Rules

`RecipeRuleConfig` includes:

- `enforcePlenaryUnopposed: boolean`
- `plenarySessionTypes: SessionType[]`
- `unopposedBlockTags: string[]`
- `enforceRoomLifecycle: boolean`

## Customization Hooks

Every block can carry optional custom hooks:

- `sessionOverrides` and/or `sessionPatch(session, ctx)`,
- `presentationOverrides` and/or `presentationPatch(presentation, ctx)`,
- `speakerOverrides` and/or `speakerPatch(speaker, ctx)`.

`ctx` includes day index, room id, block id, session/presentation/speaker indices.

## Session Recipe Model

`SessionRecipe` supports:

- `sessionCountPerRoom`
- `presentationsPerSession`
- `speakersPerPresentation`
- `presentationPlan: SessionPresentationRecipeItem[]`
  - item-level `durationMin`
  - item-level `speakersPerPresentation`
  - item-level `presentationOverrides`
- optional `sessionFactory({ seed, createDefaultSession })` to replace/extend default session generation for that scope.

## Builder Parity Requirement

The builder API compiles to `RecipeConfig`. Any behavior available in declarative mode must be representable in builder mode and produce equivalent outputs.
