import { describe, expect, it } from "vitest";
import {
  createMockMeetingFromRecipe,
  getNamedRecipe,
  listNamedRecipeIds,
  visualizeAllNamedRecipes,
  visualizeNamedRecipe,
} from "../../src";
import type { RecipeConfig } from "../../src";

describe("recipe catalog", () => {
  it("contains the requested named recipe ids", () => {
    const ids = listNamedRecipeIds();

    expect(ids).toContain("1-day__1-room__recipeA__dayPlans");
    expect(ids).toContain("1-day__1-room__recipeA__roomBlocks");
    expect(ids).toContain("3-day__1-main-room__3-breakouts__recipeA__dayPlans");
    expect(ids).toContain("3-day__1-main-room__3-breakouts__recipeA__roomBlocks");
    expect(ids).toContain("5-day__30-conv-center-room__3offsite__recipeA");
    expect(ids).toContain("5-day__30-conv-center-room__3offsite__recipeA__roomBlocks");
  });

  it("loads all named recipes as valid configs", () => {
    for (const recipeId of listNamedRecipeIds()) {
      const recipe = getNamedRecipe(recipeId);
      const recipeConfig: RecipeConfig = recipe;
      expect(recipe.meeting.mtName.length).toBeGreaterThan(0);
      expect(recipe.meeting.dayCount).toBeGreaterThan(0);
      expect(recipe.rooms.length).toBeGreaterThan(0);
      expect((recipeConfig.dayPlans?.length ?? 0) + (recipeConfig.roomBlocks?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  it("produces visualization output per recipe", () => {
    for (const recipeId of listNamedRecipeIds()) {
      const visualization = visualizeNamedRecipe(recipeId);
      expect(visualization.markdown).toContain("Recipe Visualization:");
      expect(visualization.totalPlannedBlocks).toBeGreaterThan(0);
      expect(visualization.totalConstrainedBlocks).toBeGreaterThan(0);
    }
  });

  it("can visualize all named recipes at once", () => {
    const all = visualizeAllNamedRecipes();
    expect(all.length).toBe(listNamedRecipeIds().length);
    expect(all.every((item) => item.markdown.includes("## Day 1"))).toBe(true);
  });

  it("expands roomBlocks day/time hierarchy for offsite schedule", () => {
    const recipe = getNamedRecipe("5-day__30-conv-center-room__3offsite__recipeA__roomBlocks");
    const data = createMockMeetingFromRecipe(recipe);
    const offsiteVenues = new Set(["hotelA", "hotelB", "hotelC"]);
    const offsite = data.sessions.filter((session) => offsiteVenues.has(session.venueId));
    const day4Sessions = offsite.filter((session) => session.dayIndex === 4);

    // Offsite schedule: day 1 (1 slot), days 2-4 (2 slots), day 5 (1 slot) across 3 venues.
    expect(offsite.length).toBe(24);
    expect(offsite.some((session) => session.dayIndex === 0)).toBe(true);
    expect(offsite.some((session) => session.dayIndex === 4)).toBe(true);
    expect(day4Sessions).toHaveLength(3);
  });
});
