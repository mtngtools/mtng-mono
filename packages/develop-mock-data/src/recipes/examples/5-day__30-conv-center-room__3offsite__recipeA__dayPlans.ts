import { RoomType, SessionType, VenueType } from "../../constants";
import type { RecipeConfig, RecipeRoom, SessionRecipe } from "../../recipe-types";

const makeRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, offset) => start + offset);

const convRooms: RecipeRoom[] = [
  { roomId: "hallA", roomName: "Hall A", roomType: RoomType.GeneralSession, venueId: "conv", isMain: true },
  { roomId: "theaterA", roomName: "Theater A", roomType: RoomType.Theater, venueId: "conv" },
  { roomId: "ballroomA", roomName: "Ballroom A", roomType: RoomType.Ballroom, venueId: "conv" },
  { roomId: "ballroomB", roomName: "Ballroom B", roomType: RoomType.Ballroom, venueId: "conv" },
  { roomId: "ballroomC", roomName: "Ballroom C", roomType: RoomType.Ballroom, venueId: "conv" },
  { roomId: "ballroomD", roomName: "Ballroom D", roomType: RoomType.Ballroom, venueId: "conv" },
  ...makeRange(101, 108).map((roomNum) => ({
    roomId: `room${roomNum}`,
    roomName: `Room ${roomNum}`,
    roomType: RoomType.Breakout,
    venueId: "conv",
  })),
  ...makeRange(200, 210).map((roomNum) => ({
    roomId: `room${roomNum}`,
    roomName: `Room ${roomNum}`,
    roomType: RoomType.Breakout,
    venueId: "conv",
  })),
  { roomId: "room300A", roomName: "Room 300A", roomType: RoomType.Breakout, venueId: "conv" },
  { roomId: "room300B", roomName: "Room 300B", roomType: RoomType.Breakout, venueId: "conv" },
  { roomId: "room300C", roomName: "Room 300C", roomType: RoomType.Breakout, venueId: "conv" },
  { roomId: "room400A", roomName: "Room 400A", roomType: RoomType.Breakout, venueId: "conv" },
  { roomId: "room400B", roomName: "Room 400B", roomType: RoomType.Breakout, venueId: "conv" },
];

const offsiteRoomDefs: RecipeRoom[] = [
  { roomId: "hotelA-ballroom", roomName: "Hotel A Ballroom", roomType: RoomType.Offsite, venueId: "hotelA" },
  { roomId: "hotelB-ballroom", roomName: "Hotel B Ballroom", roomType: RoomType.Offsite, venueId: "hotelB" },
  { roomId: "hotelC-salon", roomName: "Hotel C Salon", roomType: RoomType.Offsite, venueId: "hotelC" },
];

const offsiteSessionRecipe: SessionRecipe = {
  presentationsPerSession: 1,
  speakersPerPresentation: 1,
  sessionFactory: ({ createDefaultSession, seed }) => {
    const session = createDefaultSession();
    return {
      ...session,
      ssTitle: `Sponsored Session (${seed.roomId})`,
    };
  },
};

const offsiteHotels = ["hotelA-ballroom", "hotelB-ballroom", "hotelC-salon"];

export const recipe = {
  meeting: {
    mtDir: "five-day-conv-center",
    mtName: "Five Day Convention Center Demo",
    startDate: "2026-08-10",
    dayCount: 5,
  },
  venues: [
    { venueId: "conv", venueName: "Convention Center", venueType: VenueType.ConventionCenter },
    { venueId: "hotelA", venueName: "Hotel A", venueType: VenueType.OffsiteHotel },
    { venueId: "hotelB", venueName: "Hotel B", venueType: VenueType.OffsiteHotel },
    { venueId: "hotelC", venueName: "Hotel C", venueType: VenueType.OffsiteHotel },
  ],
  rooms: [...convRooms, ...offsiteRoomDefs],
  roomGroups: [
    { groupId: "floor100", roomIds: makeRange(101, 108).map((roomNum) => `room${roomNum}`) },
    { groupId: "floor200", roomIds: makeRange(200, 210).map((roomNum) => `room${roomNum}`) },
    { groupId: "floor300", roomIds: ["room300A", "room300B", "room300C"] },
    { groupId: "floor400", roomIds: ["room400A", "room400B"] },
    {
      groupId: "allBreakouts",
      roomIds: [
        ...makeRange(101, 108).map((roomNum) => `room${roomNum}`),
        ...makeRange(200, 210).map((roomNum) => `room${roomNum}`),
        "room300A",
        "room300B",
        "room300C",
        "room400A",
        "room400B",
      ],
    },
    { groupId: "offsiteHotels", roomIds: offsiteHotels },
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
          blockId: "d1-plenary",
          startTime: "11:00",
          endTime: "11:45",
          roomIds: ["hallA"],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "d1-ballroom-track",
          startTime: "12:00",
          endTime: "13:00",
          roomIds: ["ballroomA", "ballroomB", "ballroomC", "ballroomD"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d1-breakout-track",
          startTime: "13:00",
          endTime: "14:00",
          roomGroupIds: ["allBreakouts"],
          sessionType: SessionType.Breakout,
        },
        {
          blockId: "offsite-sponsored-default-d1-t1",
          startTime: "15:00",
          endTime: "16:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
      ],
    },
    {
      dayIndex: 1,
      blocks: [
        {
          blockId: "d2-plenary",
          startTime: "09:00",
          endTime: "09:45",
          roomIds: ["hallA"],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "d2-ballroom-track",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["ballroomA", "ballroomB", "ballroomC", "ballroomD"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d2-theater-program",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["theaterA"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d2-breakout-track",
          startTime: "13:00",
          endTime: "14:00",
          roomGroupIds: ["allBreakouts"],
          sessionType: SessionType.Breakout,
        },
        {
          blockId: "offsite-sponsored-default-d2-t1",
          startTime: "10:00",
          endTime: "11:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
        {
          blockId: "offsite-sponsored-default-d2-t2",
          startTime: "13:00",
          endTime: "14:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
      ],
    },
    {
      dayIndex: 2,
      blocks: [
        {
          blockId: "d3-plenary",
          startTime: "09:00",
          endTime: "09:45",
          roomIds: ["hallA"],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
          sessionRecipe: {
            presentationPlan: [
              { kind: "introduction", durationMin: 6, speakersPerPresentation: 1 },
              { kind: "presentation", durationMin: 12, speakersPerPresentation: 2 },
              { kind: "presentation", durationMin: 12, speakersPerPresentation: 2 },
              { kind: "panel", durationMin: 30, speakersPerPresentation: 4 },
            ],
          },
        },
        {
          blockId: "d3-merged-ballroom",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["ballroomAB", "ballroomC", "ballroomD"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d3-theater-program",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["theaterA"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d3-breakout-track",
          startTime: "13:00",
          endTime: "14:00",
          roomGroupIds: ["allBreakouts"],
          sessionType: SessionType.Breakout,
        },
        {
          blockId: "offsite-sponsored-default-d3-t1",
          startTime: "10:00",
          endTime: "11:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
        {
          blockId: "offsite-sponsored-default-d3-t2",
          startTime: "13:00",
          endTime: "14:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
      ],
    },
    {
      dayIndex: 3,
      blocks: [
        {
          blockId: "d4-plenary",
          startTime: "09:00",
          endTime: "09:45",
          roomIds: ["hallA"],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "d4-merged-ballroom",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["ballroomAB", "ballroomC", "ballroomD"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d4-theater-program",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["theaterA"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "d4-breakout-track",
          startTime: "13:00",
          endTime: "14:00",
          roomGroupIds: ["allBreakouts"],
          sessionType: SessionType.Breakout,
        },
        {
          blockId: "offsite-sponsored-default-d4-t1",
          startTime: "10:00",
          endTime: "11:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
        {
          blockId: "offsite-sponsored-default-d4-t2",
          startTime: "13:00",
          endTime: "14:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
        },
      ],
    },
    {
      dayIndex: 4,
      blocks: [
        {
          blockId: "d5-final-plenary",
          startTime: "09:00",
          endTime: "09:45",
          roomIds: ["hallA"],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "d5-merged-ballroom",
          startTime: "10:00",
          endTime: "11:00",
          roomIds: ["ballroomAB", "ballroomC", "ballroomD"],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "offsite-sponsored-default-d5-t1",
          startTime: "10:00",
          endTime: "11:30",
          roomGroupIds: ["offsiteHotels"],
          sessionType: SessionType.Sponsored,
          sessionRecipe: offsiteSessionRecipe,
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
    defaultSessionType: SessionType.Sponsored,
    sessionCountPerRoom: 1,
    presentationsPerSession: 2,
    speakersPerPresentation: 2,
    sessionTypeRecipes: {
      [SessionType.Plenary]: {
        presentationPlan: [
          { kind: "introduction", durationMin: 6, speakersPerPresentation: 1 },
          { kind: "presentation", durationMin: 11, speakersPerPresentation: 1 },
          { kind: "presentation", durationMin: 11, speakersPerPresentation: 1 },
          { kind: "presentation", durationMin: 11, speakersPerPresentation: 1 },
          { kind: "presentation", durationMin: 11, speakersPerPresentation: 2 },
        ],
      },
      [SessionType.Symposium]: {
        presentationsPerSession: 3,
        speakersPerPresentation: 1,
      },
    },
  },
} satisfies RecipeConfig;

export default recipe;
