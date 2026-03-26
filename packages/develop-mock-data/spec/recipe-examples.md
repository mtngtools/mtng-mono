# Recipe Examples

Canonical examples for recipe-driven meeting generation.

## Example files in source

Actual TypeScript examples live in:

- `src/recipes/examples/1-day__1-room__recipeA__dayPlans.ts`
- `src/recipes/examples/1-day__1-room__recipeA__roomBlocks.ts`
- `src/recipes/examples/3-day__1-main-room__3-breakouts__recipeA__dayPlans.ts`
- `src/recipes/examples/3-day__1-main-room__3-breakouts__recipeA__roomBlocks.ts`
- `src/recipes/examples/5-day__30-conv-center-room__3offsite__recipeA__dayPlans.ts`
- `src/recipes/examples/5-day__30-conv-center-room__3offsite__recipeA__roomBlocks.ts`

These are exported through the named recipe catalog in `src/recipes/examples/index.ts`.

## 1) Simple Recipe (1 room, 1 day)

- one venue,
- one room,
- a few time blocks,
- useful for smoke tests.

## 2) Medium Recipe (3 days, main + breakouts)

- main room with opening and closing sessions,
- breakout rooms used in selected blocks each day,
- optional unopposed plenary blocks.

## 3) Convention Center Recipe

Includes the requested high-complexity patterns:

- `HallA` as a general session room.
- Plenary and symposium sessions in `HallA`.
- Plenary windows tagged unopposed across the meeting.
- Ballrooms `BallroomA` and `BallroomB` active on early days.
- Ballroom lifecycle merge: `BallroomA + BallroomB -> BallroomAB` on day 3.
- Multi-floor breakout rooms:
  - `Room101`-`Room108`
  - `Room200`-`Room210`
  - `Room300A`, `Room300B`, `Room300C`
- `TheaterA` included for designated session types.
- Offsite venue with hotel-sponsored sessions (different venue id).

## Suggested Declarative Skeleton

```ts
const recipe: RecipeConfig = {
  meeting: { mtDir: "demo", mtName: "Convention Demo", startDate: "2026-03-01", dayCount: 4 },
  venues: [
    { venueId: "conv", venueName: "Convention Center" },
    { venueId: "hotelA", venueName: "Hotel A", venueType: VenueType.OffsiteHotel },
  ],
  rooms: [
    { roomId: "hallA", roomName: "Hall A", roomType: RoomType.GeneralSession, venueId: "conv" },
    { roomId: "ballroomA", roomName: "Ballroom A", roomType: RoomType.Ballroom, venueId: "conv" },
    { roomId: "ballroomB", roomName: "Ballroom B", roomType: RoomType.Ballroom, venueId: "conv" },
    { roomId: "theaterA", roomName: "Theater A", roomType: RoomType.Theater, venueId: "conv" },
    // ... room101-room108, room200-room210, room300A-room300C
  ],
  roomGroups: [
    { groupId: "floor100", roomIds: ["room101", "room102", "room103", "room104", "room105", "room106", "room107", "room108"] },
  ],
  roomLifecycles: [
    { dayIndex: 2, mergeRoomIds: ["ballroomA", "ballroomB"], intoRoomId: "ballroomAB", intoRoomName: "Ballroom AB" },
  ],
  dayPlans: [
    {
      dayIndex: 0,
      blocks: [
        {
          blockId: "d1-opening-plenary",
          startTime: "08:00",
          endTime: "09:30",
          roomIds: ["hallA"],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
      ],
    },
  ],
  rules: {
    enforcePlenaryUnopposed: true,
    unopposedBlockTags: ["plenary-unopposed"],
  },
};
```

## Suggested Builder Skeleton

```ts
const data = createMockMeetingFromBuilder((b) =>
  b
    .meeting({ mtDir: "demo", mtName: "Convention Demo", startDate: "2026-03-01", dayCount: 4 })
    .venue({ venueId: "conv", venueName: "Convention Center" })
    .room({ roomId: "hallA", roomName: "Hall A", roomType: RoomType.GeneralSession, venueId: "conv" })
    .day(0, (d) =>
      d.block({
        blockId: "d1-opening-plenary",
        startTime: "08:00",
        endTime: "09:30",
        roomIds: ["hallA"],
        sessionType: SessionType.Plenary,
        tags: ["plenary-unopposed"],
      }),
    )
    .ruleConfig({ enforcePlenaryUnopposed: true, unopposedBlockTags: ["plenary-unopposed"] }),
);
```

## Visualizing what a recipe builds

Use helpers from `src/recipes/visualize.ts`:

```ts
import { visualizeNamedRecipe, visualizeAllNamedRecipes } from "@mtngtools/develop-mock-data";

const single = visualizeNamedRecipe("3-day__1-main-room__3-breakouts__recipeA__roomBlocks");
console.log(single.markdown);

const all = visualizeAllNamedRecipes();
for (const item of all) {
  console.log(item.recipeId, item.droppedPlannedBlocks);
}
```

The visualization output includes:

- generated room/session counts,
- planned room-blocks vs constrained room-blocks,
- dropped blocks due constraints,
- day-by-day session listings with time, room, type, and title.

## Session-type recipe defaults and block overrides

Use meeting-level defaults to define per-session-type construction:

```ts
defaults: {
  sessionTypeRecipes: {
    [SessionType.Plenary]: {
      presentationPlan: [
        { kind: "introduction", durationMin: 6, speakersPerPresentation: 1 },
        { kind: "presentation", durationMin: 11, speakersPerPresentation: 2 },
        { kind: "presentation", durationMin: 11, speakersPerPresentation: 2 },
        { kind: "presentation", durationMin: 11, speakersPerPresentation: 2 },
        { kind: "presentation", durationMin: 11, speakersPerPresentation: 2 },
      ],
    },
  },
}
```

Then override for a specific block when needed:

```ts
{
  blockId: "special-plenary",
  sessionType: SessionType.Plenary,
  startTime: "08:00",
  endTime: "09:00",
  roomIds: ["hallA"],
  sessionRecipe: {
    presentationPlan: [
      { kind: "introduction", durationMin: 6, speakersPerPresentation: 1 },
      { kind: "presentation", durationMin: 12, speakersPerPresentation: 2 },
      { kind: "presentation", durationMin: 12, speakersPerPresentation: 2 },
      { kind: "panel", durationMin: 30, speakersPerPresentation: 4 },
    ],
  },
}
```

And optionally replace generation for that scope with a custom factory:

```ts
sessionRecipe: {
  sessionFactory: ({ createDefaultSession, seed }) => {
    const session = createDefaultSession();
    return { ...session, ssTitle: `Custom Session (${seed.roomId})` };
  },
}
```

## Reimagined Room-Blocks Hierarchy Example

For repeated schedules across the same room set, use `roomBlocks`:

```ts
const offsiteRooms = ["hotelA-ballroom", "hotelB-ballroom", "hotelC-salon"];
const firstDay = [1];
const restOfDays = [2, 3, 4, 5];

roomBlocks: [
  {
    roomIds: offsiteRooms,
    sessionType: "default",
    dayBlocks: [
      {
        dayIndexes: firstDay,
        timeBlocks: [
          { startTime: "15:00", endTime: "16:30", sessionType: "default" },
        ],
      },
      {
        dayIndexes: restOfDays,
        timeBlocks: [
          { startTime: "09:00", endTime: "10:30", sessionType: "default" },
          { startTime: "13:00", endTime: "14:30", sessionType: "default" },
        ],
      },
    ],
  },
];
```

Set `defaults.defaultSessionType` to control what `"default"` means for that recipe.
