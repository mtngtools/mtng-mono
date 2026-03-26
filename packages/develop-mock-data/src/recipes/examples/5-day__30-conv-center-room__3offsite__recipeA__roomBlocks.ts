import { RoomType, SessionType, VenueType } from "../../constants";
import type { RecipeConfig, RecipeRoom } from "../../recipe-types";

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

const offsiteRooms = ["hotelA-ballroom", "hotelB-ballroom", "hotelC-salon"];
const day1 = [1];
const day2 = [2];
const day5 = [5];
const day2to4 = [2, 3, 4];
const day3to5 = [3, 4, 5];

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
    { groupId: "offsiteHotels", roomIds: offsiteRooms },
  ],
  roomBlocks: [
    {
      roomIds: ["hallA"],
      sessionType: SessionType.Plenary,
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "11:00",
              endTime: "11:45",
              tags: ["plenary-unopposed"],
            },
          ],
        },
        {
          dayIndexes: day2to4,
          timeBlocks: [
            {
              startTime: "09:00",
              endTime: "09:45",
              tags: ["plenary-unopposed"],
              sessionRecipe: {
                // Block-specific override: 3 talks + a panel with custom time slices.
                presentationPlan: [
                  { kind: "introduction", durationMin: 6, speakersPerPresentation: 1 },
                  { kind: "presentation", durationMin: 12, speakersPerPresentation: 2 },
                  { kind: "presentation", durationMin: 12, speakersPerPresentation: 2 },
                  { kind: "panel", durationMin: 30, speakersPerPresentation: 4 },
                ],
              },
            },
          ],
        },
        {
          dayIndexes: day5,
          timeBlocks: [
            {
              startTime: "09:00",
              endTime: "09:45",
              tags: ["plenary-unopposed"],
            },
          ],
        },
      ],
    },
    {
      roomIds: ["ballroomA", "ballroomB", "ballroomC", "ballroomD"],
      sessionType: SessionType.Symposium,
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "12:00",
              endTime: "13:00",
            },
          ],
        },
        {
          dayIndexes: day2,
          timeBlocks: [
            {
              startTime: "10:00",
              endTime: "11:00",
            },
          ],
        },
      ],
    },
    {
      roomGroupIds: ["allBreakouts"],
      sessionType: SessionType.Breakout,
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "13:00",
              endTime: "14:00",
            },
          ],
        },
      ],
    },
    {
      roomGroupIds: ["allBreakouts"],
      sessionType: SessionType.Breakout,
      dayBlocks: [
        {
          dayIndexes: day2to4,
          timeBlocks: [
            {
              startTime: "13:00",
              endTime: "14:00",
            },
          ],
        },
      ],
    },
    {
      roomIds: ["ballroomAB", "ballroomC", "ballroomD"],
      sessionType: SessionType.Symposium,
      dayBlocks: [
        {
          dayIndexes: day3to5,
          timeBlocks: [
            {
              startTime: "10:00",
              endTime: "11:00",
            },
          ],
        },
      ],
    },
    {
      roomIds: ["theaterA"],
      sessionType: SessionType.Symposium,
      dayBlocks: [
        {
          dayIndexes: day2to4,
          timeBlocks: [
            {
              startTime: "10:00",
              endTime: "11:00",
            },
          ],
        },
      ],
    },
    {
      roomIds: offsiteRooms,
      sessionType: "default",
      sessionRecipe: {
        presentationsPerSession: 1,
        speakersPerPresentation: 1,
        sessionFactory: ({ createDefaultSession, seed }) => {
          const session = createDefaultSession();
          return {
            ...session,
            ssTitle: `Sponsored Session (${seed.roomId})`,
          };
        },
      },
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "15:00",
              endTime: "16:30",
              sessionType: "default",
            },
          ],
        },
        {
          dayIndexes: day2to4,
          timeBlocks: [
            {
              startTime: "10:00",
              endTime: "11:30",
              sessionType: "default",
            },
            {
              startTime: "13:00",
              endTime: "14:30",
              sessionType: "default",
            },
          ],
        },
        {
          dayIndexes: day5,
          timeBlocks: [
            {
              startTime: "10:00",
              endTime: "11:30",
              sessionType: "default",
            },
          ],
        },
      ],
    },
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
  dayPlans: [],
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
        // Typical plenary shape: intro + 4 presentations.
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
