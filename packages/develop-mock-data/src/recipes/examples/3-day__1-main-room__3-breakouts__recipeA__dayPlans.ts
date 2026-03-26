import { RoomType, SessionType, VenueType } from "../../constants";
import type { RecipeConfig } from "../../recipe-types";

const mainRoomId = "hallA";
const breakoutRoomIds = ["room101", "room102", "room103"];

export const recipe = {
  meeting: {
    mtDir: "three-day-main-plus-breakouts",
    mtName: "Three Day Main And Breakouts Demo",
    startDate: "2026-07-15",
    dayCount: 3,
  },
  venues: [
    { venueId: "conv", venueName: "Convention Center", venueType: VenueType.ConventionCenter },
  ],
  rooms: [
    { roomId: mainRoomId, roomName: "Hall A", roomType: RoomType.GeneralSession, venueId: "conv", isMain: true },
    { roomId: "room101", roomName: "Room 101", roomType: RoomType.Breakout, venueId: "conv" },
    { roomId: "room102", roomName: "Room 102", roomType: RoomType.Breakout, venueId: "conv" },
    { roomId: "room103", roomName: "Room 103", roomType: RoomType.Breakout, venueId: "conv" },
  ],
  roomGroups: [
    { groupId: "breakoutRooms", roomIds: breakoutRoomIds },
  ],
  dayPlans: [
    {
      dayIndex: 0,
      blocks: [
        {
          blockId: "d1-opening-plenary",
          startTime: "08:00",
          endTime: "09:00",
          roomIds: [mainRoomId],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "d1-midday-breakouts",
          startTime: "10:00",
          endTime: "11:00",
          roomGroupIds: ["breakoutRooms"],
          sessionType: SessionType.Breakout,
        },
        {
          blockId: "d1-late-symposium",
          startTime: "11:30",
          endTime: "12:30",
          roomIds: [mainRoomId],
          sessionType: SessionType.Symposium,
        },
      ],
    },
    {
      dayIndex: 1,
      blocks: [
        {
          blockId: "d2-plenary",
          startTime: "08:00",
          endTime: "08:45",
          roomIds: [mainRoomId],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
          sessionRecipe: {
            // This block overrides default plenary to use 3 talks and a panel.
            presentationPlan: [
              { kind: "introduction", durationMin: 5, speakersPerPresentation: 1 },
              { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
              { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
              { kind: "panel", durationMin: 20, speakersPerPresentation: 4 },
            ],
          },
        },
        {
          blockId: "d2-breakout-round1",
          startTime: "09:00",
          endTime: "10:00",
          roomGroupIds: ["breakoutRooms"],
          sessionType: SessionType.Workshop,
        },
        {
          blockId: "d2-breakout-round2",
          startTime: "10:30",
          endTime: "11:30",
          roomGroupIds: ["breakoutRooms"],
          sessionType: SessionType.Breakout,
        },
      ],
    },
    {
      dayIndex: 2,
      blocks: [
        {
          blockId: "d3-main-plenary",
          startTime: "08:30",
          endTime: "09:30",
          roomIds: [mainRoomId],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "d3-breakout-final",
          startTime: "10:00",
          endTime: "11:00",
          roomGroupIds: ["breakoutRooms"],
          sessionType: SessionType.Breakout,
        },
      ],
    },
  ],
  defaults: {
    sessionTypeRecipes: {
      [SessionType.Plenary]: {
        presentationPlan: [
          { kind: "introduction", durationMin: 7, speakersPerPresentation: 1 },
          { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
          { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
          { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
          { kind: "presentation", durationMin: 10, speakersPerPresentation: 2 },
        ],
      },
      [SessionType.Breakout]: {
        presentationsPerSession: 1,
        speakersPerPresentation: 1,
      },
    },
  },
} satisfies RecipeConfig;

export default recipe;
