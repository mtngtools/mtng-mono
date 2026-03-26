import { createRecipeBuilder, type RecipeBuilder } from "./recipe-builder";
import { materializeRoomsSessionsPresSpeakers } from "./materialize";
import { applyRulesAndConstraints, normalizeRecipe, planTimeBlocksByDayRoom } from "./planner";
import type { MockMeetingData, RecipeConfig } from "./recipe-types";

export const createMockMeetingFromRecipe = (recipe: RecipeConfig): MockMeetingData => {
  const normalized = normalizeRecipe(recipe);
  const planned = planTimeBlocksByDayRoom(normalized);
  const constrained = applyRulesAndConstraints(planned, normalized);
  return materializeRoomsSessionsPresSpeakers(normalized, constrained);
};

export const createMockMeetingFromBuilder = (
  build: (builder: RecipeBuilder) => RecipeBuilder | void,
): MockMeetingData => {
  const builder = createRecipeBuilder();
  const configuredBuilder = build(builder) ?? builder;
  return createMockMeetingFromRecipe(configuredBuilder.build());
};
