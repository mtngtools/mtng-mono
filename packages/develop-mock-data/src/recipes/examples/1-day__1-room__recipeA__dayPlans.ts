import { RoomType, SessionType, VenueType } from "../../constants";
import type { RecipeConfig } from "../../recipe-types";

const mainRoomId = "hallA";

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
  dayPlans: [
    {
      dayIndex: 0,
      blocks: [
        {
          blockId: "opening-plenary",
          startTime: "08:00",
          endTime: "09:00",
          roomIds: [mainRoomId],
          sessionType: SessionType.Plenary,
          tags: ["plenary-unopposed"],
        },
        {
          blockId: "late-morning-symposium",
          startTime: "10:00",
          endTime: "11:30",
          roomIds: [mainRoomId],
          sessionType: SessionType.Symposium,
        },
        {
          blockId: "afternoon-workshop",
          startTime: "13:00",
          endTime: "14:00",
          roomIds: [mainRoomId],
          sessionType: SessionType.Workshop,
        },
      ],
    },
  ],
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
