import type { Room } from "@mtngtools/core";
import type { RecipeRoom, RecipeVenue } from "../recipe-types";

export const createMockRoomFromRecipe = (
  recipeRoom: RecipeRoom,
  venue: RecipeVenue | undefined,
  roomIndex: number,
): Room => {
  const venueName = venue?.venueName ?? recipeRoom.venueId;
  const rmName = recipeRoom.roomName;
  const rmId = recipeRoom.roomId;

  return {
    rmId,
    rmSlug: rmId,
    rmName,
    rmFullName: `${venueName}, ${rmName}`,
    rmShortName: rmName,
    rmVenue: venueName,
    rmVenueSection: recipeRoom.roomType,
    isMain: recipeRoom.isMain ?? roomIndex === 0,
  };
};
