import { RoomType, SessionType, VenueType } from "../../constants";
import type { RecipeConfig } from "../../recipe-types";

const mainRoomId = "hallA";
const breakoutRoomIds = ["room101", "room102", "room103"];
const day1 = [1];
const day2 = [2];
const day3 = [3];
const days1And3 = [1, 3];

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
  roomBlocks: [
    {
      roomIds: [mainRoomId],
      sessionType: SessionType.Plenary,
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "08:00",
              endTime: "09:00",
              tags: ["plenary-unopposed"],
            },
          ],
        },
        {
          dayIndexes: day2,
          timeBlocks: [
            {
              startTime: "08:00",
              endTime: "08:45",
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
          ],
        },
        {
          dayIndexes: day3,
          timeBlocks: [
            {
              startTime: "08:30",
              endTime: "09:30",
              tags: ["plenary-unopposed"],
            },
          ],
        },
      ],
    },
    {
      roomIds: [mainRoomId],
      sessionType: SessionType.Symposium,
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "11:30",
              endTime: "12:30",
            },
          ],
        },
      ],
    },
    {
      roomGroupIds: ["breakoutRooms"],
      sessionType: SessionType.Workshop,
      dayBlocks: [
        {
          dayIndexes: day2,
          timeBlocks: [
            {
              startTime: "09:00",
              endTime: "10:00",
            },
          ],
        },
      ],
    },
    {
      roomGroupIds: ["breakoutRooms"],
      sessionType: SessionType.Breakout,
      dayBlocks: [
        {
          dayIndexes: days1And3,
          timeBlocks: [
            {
              startTime: "10:00",
              endTime: "11:00",
            },
          ],
        },
        {
          dayIndexes: day2,
          timeBlocks: [
            {
              startTime: "10:30",
              endTime: "11:30",
            },
          ],
        },
      ],
    },
  ],
  dayPlans: [],
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
