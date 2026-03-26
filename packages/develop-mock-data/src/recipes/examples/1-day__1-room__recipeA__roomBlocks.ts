import { RoomType, SessionType, VenueType } from "../../constants";
import type { RecipeConfig } from "../../recipe-types";

const mainRoomId = "hallA";
const day1 = [1];

export const recipe = {
  meeting: {
    mtDir: "one-day-one-room",
    mtName: "One Day One Room Demo",
    startDate: "2026-06-01",
    dayCount: 1,
  },
  venues: [
    { venueId: "mainVenue", venueName: "Main Venue", venueType: VenueType.ConventionCenter },
  ],
  rooms: [
    {
      roomId: mainRoomId,
      roomName: "Hall A",
      roomType: RoomType.GeneralSession,
      venueId: "mainVenue",
      isMain: true,
    },
  ],
  roomBlocks: [
    {
      roomIds: [mainRoomId],
      dayBlocks: [
        {
          dayIndexes: day1,
          timeBlocks: [
            {
              startTime: "08:00",
              endTime: "09:00",
              sessionType: SessionType.Plenary,
              tags: ["plenary-unopposed"],
            },
            {
              startTime: "10:00",
              endTime: "11:30",
              sessionType: SessionType.Symposium,
            },
            {
              startTime: "13:00",
              endTime: "14:00",
              sessionType: SessionType.Workshop,
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
          { kind: "introduction", durationMin: 8, speakersPerPresentation: 1 },
          { kind: "presentation", durationMin: 13, speakersPerPresentation: 2 },
          { kind: "presentation", durationMin: 13, speakersPerPresentation: 2 },
          { kind: "presentation", durationMin: 13, speakersPerPresentation: 2 },
          { kind: "presentation", durationMin: 13, speakersPerPresentation: 2 },
        ],
      },
      [SessionType.Symposium]: {
        presentationsPerSession: 3,
        speakersPerPresentation: 2,
      },
      [SessionType.Workshop]: {
        presentationsPerSession: 1,
        speakersPerPresentation: 1,
      },
    },
  },
} satisfies RecipeConfig;

export default recipe;
