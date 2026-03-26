import { DAY_MS, MINUTE_MS, parseDateStartMs } from "./internal";
import { createMockRoomFromRecipe } from "./factories/room-factory";
import { createMockSessionFromSeed } from "./factories/session-factory";
import type { MockMeetingData, NormalizedRecipe, PlannedRoomBlock, SessionFactoryInput } from "./recipe-types";

export const materializeRoomsSessionsPresSpeakers = (
  normalized: NormalizedRecipe,
  plannedBlocks: PlannedRoomBlock[],
): MockMeetingData => {
  const venuesById = new Map(normalized.venues.map((venue) => [venue.venueId, venue]));
  const rooms = normalized.rooms.map((room, roomIndex) =>
    createMockRoomFromRecipe(room, venuesById.get(room.venueId), roomIndex),
  );

  const meetingStartMs = parseDateStartMs(normalized.meeting.startDate);
  const sessions = plannedBlocks.flatMap((planned, blockOrdinal) => {
    const blockDurationMinutes = Math.max(1, planned.endMinutes - planned.startMinutes);
    const slotDurationMinutes = Math.max(1, Math.floor(blockDurationMinutes / planned.sessionCountPerRoom));
    const dayStartMs = meetingStartMs + planned.dayIndex * DAY_MS;

    return Array.from({ length: planned.sessionCountPerRoom }, (_, sessionOrdinal) => {
      const startMinutes = planned.startMinutes + slotDurationMinutes * sessionOrdinal;
      const endMinutes =
        sessionOrdinal === planned.sessionCountPerRoom - 1
          ? planned.endMinutes
          : startMinutes + slotDurationMinutes;

      const startMs = dayStartMs + startMinutes * MINUTE_MS;
      const endMs = dayStartMs + endMinutes * MINUTE_MS;
      const seed = {
        dayIndex: planned.dayIndex,
        blockOrdinal,
        sessionOrdinal,
        blockId: planned.blockId,
        roomId: planned.roomId,
        venueId: planned.venueId,
        sessionType: planned.sessionType,
        startMs,
        endMs,
        presentationsPerSession: planned.presentationsPerSession,
        speakersPerPresentation: planned.speakersPerPresentation,
      };
      const hooks = {
        sessionOverrides: planned.sessionOverrides,
        presentationOverrides: planned.presentationOverrides,
        speakerOverrides: planned.speakerOverrides,
        sessionPatch: planned.sessionPatch,
        presentationPatch: planned.presentationPatch,
        speakerPatch: planned.speakerPatch,
      };
      const defaultSessionFactory = () => createMockSessionFromSeed(seed, hooks, planned.sessionRecipe);
      const customSessionFactory = planned.sessionRecipe?.sessionFactory;
      if (!customSessionFactory) {
        return defaultSessionFactory();
      }
      const customInput: SessionFactoryInput = {
        seed,
        createDefaultSession: defaultSessionFactory,
      };
      return customSessionFactory(customInput);
    });
  });

  return {
    rooms,
    sessions,
  };
};
