import type { RecipeConfig } from "../../recipe-types";
import recipe1Day1RoomRecipeADayPlans from "./1-day__1-room__recipeA__dayPlans";
import recipe1Day1RoomRecipeARoomBlocks from "./1-day__1-room__recipeA__roomBlocks";
import recipe3Day1Main3BreakoutsRecipeADayPlans from "./3-day__1-main-room__3-breakouts__recipeA__dayPlans";
import recipe3Day1Main3BreakoutsRecipeARoomBlocks from "./3-day__1-main-room__3-breakouts__recipeA__roomBlocks";
import recipe5Day30ConvCenter3OffsiteRecipeADayPlans from "./5-day__30-conv-center-room__3offsite__recipeA__dayPlans";
import recipe5Day30ConvCenter3OffsiteRecipeARoomBlocks from "./5-day__30-conv-center-room__3offsite__recipeA__roomBlocks";

export const namedRecipes = {
  "1-day__1-room__recipeA__dayPlans": recipe1Day1RoomRecipeADayPlans,
  "1-day__1-room__recipeA__roomBlocks": recipe1Day1RoomRecipeARoomBlocks,
  "3-day__1-main-room__3-breakouts__recipeA__dayPlans": recipe3Day1Main3BreakoutsRecipeADayPlans,
  "3-day__1-main-room__3-breakouts__recipeA__roomBlocks": recipe3Day1Main3BreakoutsRecipeARoomBlocks,
  "5-day__30-conv-center-room__3offsite__recipeA": recipe5Day30ConvCenter3OffsiteRecipeADayPlans,
  "5-day__30-conv-center-room__3offsite__recipeA__roomBlocks":
    recipe5Day30ConvCenter3OffsiteRecipeARoomBlocks,
} as const satisfies Record<string, RecipeConfig>;

export type NamedRecipeId = keyof typeof namedRecipes;

export const getNamedRecipe = (recipeId: NamedRecipeId) => namedRecipes[recipeId];

export const listNamedRecipeIds = (): NamedRecipeId[] => Object.keys(namedRecipes) as NamedRecipeId[];
