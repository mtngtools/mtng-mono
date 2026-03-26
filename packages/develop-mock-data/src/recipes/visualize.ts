import { createMockMeetingFromRecipe } from "../api";
import { applyRulesAndConstraints, normalizeRecipe, planTimeBlocksByDayRoom } from "../planner";
import type { MockSession, RecipeConfig } from "../recipe-types";
import { getNamedRecipe, listNamedRecipeIds, type NamedRecipeId } from "./examples";

export type RecipeVisualization = {
  markdown: string;
  droppedPlannedBlocks: number;
  totalPlannedBlocks: number;
  totalConstrainedBlocks: number;
};

const formatHm = (value: number) =>
  new Date(value).toISOString().slice(11, 16);

const summarizeSession = (session: MockSession) =>
  `${formatHm(session.ssStart)}-${formatHm(session.ssEnd)} | ${session.rmId} | ${session.ssType} | ${session.ssTitle}`;

export const visualizeRecipe = (recipe: RecipeConfig): RecipeVisualization => {
  const normalized = normalizeRecipe(recipe);
  const planned = planTimeBlocksByDayRoom(normalized);
  const constrained = applyRulesAndConstraints(planned, normalized);
  const data = createMockMeetingFromRecipe(recipe);
  const droppedPlannedBlocks = planned.length - constrained.length;

  const dayLines = Array.from({ length: recipe.meeting.dayCount }, (_, dayIndex) => {
    const daySessions = data.sessions
      .filter((session) => session.dayIndex === dayIndex)
      .sort((a, b) => a.ssStart - b.ssStart || a.rmId.localeCompare(b.rmId));
    const sessionLines = daySessions.length
      ? daySessions.map((session) => `  - ${summarizeSession(session)}`).join("\n")
      : "  - (no sessions)";
    return `## Day ${dayIndex + 1}\n${sessionLines}`;
  }).join("\n\n");

  const markdown = [
    `# Recipe Visualization: ${recipe.meeting.mtName}`,
    "",
    `- Meeting days: ${recipe.meeting.dayCount}`,
    `- Rooms generated: ${data.rooms.length}`,
    `- Sessions generated: ${data.sessions.length}`,
    `- Planned room-blocks: ${planned.length}`,
    `- Constrained room-blocks: ${constrained.length}`,
    `- Dropped by constraints: ${droppedPlannedBlocks}`,
    "",
    dayLines,
  ].join("\n");

  return {
    markdown,
    droppedPlannedBlocks,
    totalPlannedBlocks: planned.length,
    totalConstrainedBlocks: constrained.length,
  };
};

export const visualizeNamedRecipe = (recipeId: NamedRecipeId): RecipeVisualization =>
  visualizeRecipe(getNamedRecipe(recipeId));

export const visualizeAllNamedRecipes = () =>
  listNamedRecipeIds().map((recipeId) => ({
    recipeId,
    ...visualizeNamedRecipe(recipeId),
  }));
