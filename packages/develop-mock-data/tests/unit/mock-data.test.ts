import { describe, expect, it } from "vitest";
import {
  createMockMeetingFromBuilder,
  createMockMeetingFromRecipe,
  createRecipeBuilder,
  RoomType,
  SessionType,
  VenueType,
  type RecipeConfig,
} from "../../src";

describe("@mtngtools/develop-mock-data", () => {
  const buildConventionRecipe = (): RecipeConfig => ({
    meeting: {
      mtDir: "conv-demo",
      mtName: "Convention Demo",
      startDate: "2026-05-01",
      dayCount: 3,
    },
    venues: [
      { venueId: "conv", venueName: "Convention Center", venueType: VenueType.ConventionCenter },
      { venueId: "hotelA", venueName: "Hotel A", venueType: VenueType.OffsiteHotel },
    ],
    rooms: [
      { roomId: "hallA", roomName: "Hall A", roomType: RoomType.GeneralSession, venueId: "conv", isMain: true },
      { roomId: "ballroomA", roomName: "Ballroom A", roomType: RoomType.Ballroom, venueId: "conv" },
      { roomId: "ballroomB", roomName: "Ballroom B", roomType: RoomType.Ballroom, venueId: "conv" },
      { roomId: "room101", roomName: "Room 101", roomType: RoomType.Breakout, venueId: "conv" },
      { roomId: "room102", roomName: "Room 102", roomType: RoomType.Breakout, venueId: "conv" },
      { roomId: "theaterA", roomName: "Theater A", roomType: RoomType.Theater, venueId: "conv" },
      { roomId: "hotelSalon", roomName: "Hotel Salon", roomType: RoomType.Offsite, venueId: "hotelA" },
    ],
    roomGroups: [
      { groupId: "floor100", roomIds: ["room101", "room102"] },
    ],
    roomLifecycles: [
      {
        dayIndex: 2,
        mergeRoomIds: ["ballroomA", "ballroomB"],
        intoRoomId: "ballroomAB",
        intoRoomName: "Ballroom AB",
        intoRoomType: RoomType.Ballroom,
        venueId: "conv",
      },
    ],
    dayPlans: [
      {
        dayIndex: 0,
        blocks: [
          {
            blockId: "d0-plenary",
            startTime: "08:00",
            endTime: "09:00",
            roomIds: ["hallA"],
            sessionType: SessionType.Plenary,
            tags: ["plenary-unopposed"],
          },
          {
            blockId: "d0-breakouts-overlap",
            startTime: "08:00",
            endTime: "09:00",
            roomGroupIds: ["floor100"],
            sessionType: SessionType.Breakout,
          },
        ],
      },
      {
        dayIndex: 1,
        blocks: [
          {
            blockId: "d1-breakout-group",
            startTime: "10:00",
            endTime: "11:00",
            roomGroupIds: ["floor100"],
            sessionType: SessionType.Workshop,
          },
          {
            blockId: "d1-custom-sponsored",
            startTime: "12:00",
            endTime: "13:00",
            roomIds: ["hotelSalon"],
            sessionType: SessionType.Sponsored,
            sessionCountPerRoom: 1,
            presentationsPerSession: 1,
            speakersPerPresentation: 1,
            sessionRecipe: {
              sessionFactory: ({ createDefaultSession, seed }) => {
                const session = createDefaultSession();
                return {
                  ...session,
                  ssTitle: `${session.ssTitle} (${seed.roomId})`,
                };
              },
            },
            sessionOverrides: {
              ssTitle: "Custom Sponsored Session",
            },
            presentationOverrides: {
              prTitle: "Custom Presentation",
            },
            speakerOverrides: {
              spFullName: "Dr Custom Speaker",
            },
            sessionPatch: (session) => ({
              ...session,
              ssTitle: `${session.ssTitle} [Patched]`,
            }),
          },
        ],
      },
      {
        dayIndex: 2,
        blocks: [
          {
            blockId: "d2-custom-plenary-shape",
            startTime: "08:15",
            endTime: "09:00",
            roomIds: ["hallA"],
            sessionType: SessionType.Plenary,
            tags: ["plenary-unopposed"],
            sessionRecipe: {
              presentationPlan: [
                { kind: "introduction", durationMin: 5, speakersPerPresentation: 1 },
                { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
                { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
                { kind: "panel", durationMin: 20, speakersPerPresentation: 4 },
              ],
            },
          },
          {
            blockId: "d2-ballroom-merge-slot",
            startTime: "09:30",
            endTime: "10:30",
            roomIds: ["ballroomA", "ballroomB"],
            sessionType: SessionType.Symposium,
          },
        ],
      },
    ],
    rules: {
      enforcePlenaryUnopposed: true,
      unopposedBlockTags: ["plenary-unopposed"],
      enforceRoomLifecycle: true,
    },
    defaults: {
      sessionCountPerRoom: 1,
      presentationsPerSession: 2,
      speakersPerPresentation: 2,
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
    },
  });

  it("enforces unopposed plenary windows", () => {
    const data = createMockMeetingFromRecipe(buildConventionRecipe());
    const blocked = data.sessions.filter((session) => session.blockId === "d0-breakouts-overlap");
    const plenary = data.sessions.filter((session) => session.blockId === "d0-plenary");

    expect(blocked).toHaveLength(0);
    expect(plenary.length).toBeGreaterThan(0);
    expect(plenary.every((session) => session.ssType === SessionType.Plenary)).toBe(true);
  });

  it("applies ballroom merge lifecycle on day 3", () => {
    const data = createMockMeetingFromRecipe(buildConventionRecipe());
    const mergedBlockSessions = data.sessions.filter((session) => session.blockId === "d2-ballroom-merge-slot");

    expect(data.rooms.some((room) => room.rmId === "ballroomAB")).toBe(true);
    expect(mergedBlockSessions.length).toBeGreaterThan(0);
    expect(mergedBlockSessions.every((session) => session.rmId === "ballroomAB")).toBe(true);
  });

  it("assigns room-group blocks to each room in the group", () => {
    const data = createMockMeetingFromRecipe(buildConventionRecipe());
    const roomIds = data.sessions
      .filter((session) => session.blockId === "d1-breakout-group")
      .map((session) => session.rmId)
      .sort();

    expect(roomIds).toEqual(["room101", "room102"]);
  });

  it("supports partial custom overrides and patch callbacks", () => {
    const data = createMockMeetingFromRecipe(buildConventionRecipe());
    const session = data.sessions.find((item) => item.blockId === "d1-custom-sponsored");

    expect(session).toBeTruthy();
    expect(session?.ssTitle).toContain("Custom Sponsored Session");
    expect(session?.ssTitle).toContain("[Patched]");
    expect(session?.ssPresentations[0]?.prTitle).toBe("Custom Presentation");
    expect(session?.ssPresentations[0]?.prSpeakers[0]?.spFullName).toBe("Dr Custom Speaker");
    expect(session?.venueId).toBe("hotelA");
    expect(session?.ssTitle).toContain("(hotelSalon)");
  });

  it("uses session-type default recipe for plenary session structure", () => {
    const data = createMockMeetingFromRecipe(buildConventionRecipe());
    const plenary = data.sessions.find((session) => session.blockId === "d0-plenary");
    expect(plenary).toBeTruthy();
    expect(plenary?.ssPresentations.length).toBe(5);
    expect(plenary?.ssPresentations[0]?.prSpeakers.length).toBe(1);
  });

  it("allows block-level sessionRecipe to override session-type defaults", () => {
    const data = createMockMeetingFromRecipe(buildConventionRecipe());
    const customPlenary = data.sessions.find((session) => session.blockId === "d2-custom-plenary-shape");
    expect(customPlenary).toBeTruthy();
    expect(customPlenary?.ssPresentations.length).toBe(4);
    expect(customPlenary?.ssPresentations[3]?.prSpeakers.length).toBe(4);
  });

  it("keeps declarative and builder APIs in parity", () => {
    const declarative = buildConventionRecipe();
    const fromRecipe = createMockMeetingFromRecipe(declarative);
    const firstRoomGroup = declarative.roomGroups ? declarative.roomGroups[0] : undefined;
    const firstLifecycle = declarative.roomLifecycles ? declarative.roomLifecycles[0] : undefined;
    if (!firstRoomGroup || !firstLifecycle) {
      throw new Error("Convention recipe must include roomGroups and roomLifecycles.");
    }

    const fromBuilder = createMockMeetingFromBuilder((builder) =>
      builder
        .meeting(declarative.meeting)
        .defaults(declarative.defaults ?? {})
        .ruleConfig(declarative.rules ?? {})
        .venue(declarative.venues[0]!)
        .venue(declarative.venues[1]!)
        .room(declarative.rooms[0]!)
        .room(declarative.rooms[1]!)
        .room(declarative.rooms[2]!)
        .room(declarative.rooms[3]!)
        .room(declarative.rooms[4]!)
        .room(declarative.rooms[5]!)
        .room(declarative.rooms[6]!)
        .roomGroup(firstRoomGroup)
        .roomLifecycle(firstLifecycle)
        .day(0, (day) =>
          day
            .block(declarative.dayPlans[0]!.blocks[0]!)
            .block(declarative.dayPlans[0]!.blocks[1]!),
        )
        .day(1, (day) =>
          day
            .block(declarative.dayPlans[1]!.blocks[0]!)
            .block(declarative.dayPlans[1]!.blocks[1]!),
        )
        .day(2, (day) =>
          day
            .block(declarative.dayPlans[2]!.blocks[0]!)
            .block(declarative.dayPlans[2]!.blocks[1]!),
        ),
    );

    expect(fromBuilder).toEqual(fromRecipe);
  });

  it("can build via explicit builder and build() path", () => {
    const builder = createRecipeBuilder()
      .meeting({
        mtDir: "simple",
        mtName: "Simple One Day",
        startDate: "2026-01-01",
        dayCount: 1,
      })
      .venue({ venueId: "main", venueName: "Main Venue", venueType: VenueType.ConventionCenter })
      .room({ roomId: "room1", roomName: "Room 1", roomType: RoomType.MeetingRoom, venueId: "main" })
      .day(0, (day) =>
        day.block({
          blockId: "simple-block",
          startTime: "09:00",
          endTime: "10:00",
          roomIds: ["room1"],
          sessionType: SessionType.Symposium,
        }),
      );

    const data = createMockMeetingFromRecipe(builder.build());
    expect(data.rooms).toHaveLength(1);
    expect(data.sessions).toHaveLength(1);
    expect(data.sessions[0]?.rmId).toBe("room1");
  });
});
