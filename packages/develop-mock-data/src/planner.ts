import { DEFAULT_UNOPPOSED_TAG, SessionType } from "./constants";
import type { SessionType as SessionTypeValue } from "./constants";
import { idFromParts, overlaps, parseTimeToMinutes, toPositiveInt, uniqueStrings } from "./internal";
import type {
  NormalizedRecipe,
  PlannedRoomBlock,
  RecipeBlock,
  RecipeBlockTemplate,
  RecipeConfig,
  RecipeDayPlan,
  RecipeRoomBlock,
  RecipeRoom,
  RecipeRuleConfig,
  SessionRecipe,
} from "./recipe-types";

const defaultRules = (rules: RecipeRuleConfig | undefined): Required<RecipeRuleConfig> => ({
  enforcePlenaryUnopposed: rules?.enforcePlenaryUnopposed ?? true,
  plenarySessionTypes: rules?.plenarySessionTypes ?? [SessionType.Plenary],
  unopposedBlockTags: rules?.unopposedBlockTags ?? [DEFAULT_UNOPPOSED_TAG],
  enforceRoomLifecycle: rules?.enforceRoomLifecycle ?? true,
});

const mergeSessionRecipes = (
  ...recipes: Array<SessionRecipe | undefined>
): SessionRecipe | undefined => {
  let merged: SessionRecipe | undefined;
  for (const recipe of recipes) {
    if (!recipe) {
      continue;
    }
    merged = {
      ...merged,
      ...recipe,
      sessionOverrides: { ...merged?.sessionOverrides, ...recipe.sessionOverrides },
      presentationOverrides: {
        ...merged?.presentationOverrides,
        ...recipe.presentationOverrides,
      },
      speakerOverrides: { ...merged?.speakerOverrides, ...recipe.speakerOverrides },
      // If provided, a recipe-level plan fully replaces prior plan.
      presentationPlan: recipe.presentationPlan ?? merged?.presentationPlan,
      // Keep latest callback/factory when specified.
      sessionPatch: recipe.sessionPatch ?? merged?.sessionPatch,
      presentationPatch: recipe.presentationPatch ?? merged?.presentationPatch,
      speakerPatch: recipe.speakerPatch ?? merged?.speakerPatch,
      sessionFactory: recipe.sessionFactory ?? merged?.sessionFactory,
    };
  }
  return merged;
};

const toMaybeObject = <T extends object>(value: T | undefined): T | undefined => {
  if (!value) {
    return undefined;
  }
  return Object.keys(value).length > 0 ? value : undefined;
};

const resolveDefaultableSessionType = (
  value: SessionTypeValue | "default" | undefined,
  fallback: SessionTypeValue,
): SessionTypeValue => (value && value !== "default" ? value : fallback);

const normalizeRoomBlockDayIndex = (oneBasedDayIndex: number, dayCount: number) => {
  if (!Number.isInteger(oneBasedDayIndex)) {
    throw new Error(`roomBlocks day index "${oneBasedDayIndex}" must be an integer.`);
  }
  if (oneBasedDayIndex < 1 || oneBasedDayIndex > dayCount) {
    throw new Error(
      `roomBlocks day index "${oneBasedDayIndex}" is outside 1..${dayCount}.`,
    );
  }
  return oneBasedDayIndex - 1;
};

const mergeDayPlans = (dayPlans: RecipeDayPlan[]): RecipeDayPlan[] => {
  const byDay = new Map<number, RecipeBlock[]>();
  for (const dayPlan of dayPlans) {
    const existing = byDay.get(dayPlan.dayIndex) ?? [];
    existing.push(...dayPlan.blocks);
    byDay.set(dayPlan.dayIndex, existing);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([dayIndex, blocks]) => ({ dayIndex, blocks }));
};

const expandRoomBlocksToDayPlans = (
  roomBlocks: RecipeRoomBlock[],
  dayCount: number,
  defaultSessionType: SessionTypeValue,
): RecipeDayPlan[] => {
  const expanded: RecipeDayPlan[] = [];
  for (const [roomBlockIndex, roomBlock] of roomBlocks.entries()) {
    const roomBlockId = roomBlock.roomBlockId ?? `room-block-${roomBlockIndex + 1}`;
    for (const dayBlock of roomBlock.dayBlocks) {
      for (const oneBasedDayIndex of dayBlock.dayIndexes) {
        const dayIndex = normalizeRoomBlockDayIndex(oneBasedDayIndex, dayCount);
        const blocks: RecipeBlock[] = dayBlock.timeBlocks.map((timeBlock, timeBlockIndex) => {
          const sessionType = resolveDefaultableSessionType(
            timeBlock.sessionType ?? roomBlock.sessionType,
            defaultSessionType,
          );
          const mergedSessionRecipe = mergeSessionRecipes(roomBlock.sessionRecipe, timeBlock.sessionRecipe);
          const mergedSessionOverrides = toMaybeObject({
            ...roomBlock.sessionOverrides,
            ...timeBlock.sessionOverrides,
          });
          const mergedPresentationOverrides = toMaybeObject({
            ...roomBlock.presentationOverrides,
            ...timeBlock.presentationOverrides,
          });
          const mergedSpeakerOverrides = toMaybeObject({
            ...roomBlock.speakerOverrides,
            ...timeBlock.speakerOverrides,
          });
          const tags = uniqueStrings([...(roomBlock.tags ?? []), ...(timeBlock.tags ?? [])]);

          return {
            blockId: timeBlock.blockId ?? `${roomBlockId}-d${oneBasedDayIndex}-t${timeBlockIndex + 1}`,
            startTime: timeBlock.startTime,
            endTime: timeBlock.endTime,
            roomIds: roomBlock.roomIds,
            roomGroupIds: roomBlock.roomGroupIds,
            roomTypeFilter: roomBlock.roomTypeFilter,
            sessionType,
            sessionCountPerRoom: timeBlock.sessionCountPerRoom ?? roomBlock.sessionCountPerRoom,
            presentationsPerSession:
              timeBlock.presentationsPerSession ?? roomBlock.presentationsPerSession,
            speakersPerPresentation:
              timeBlock.speakersPerPresentation ?? roomBlock.speakersPerPresentation,
            sessionRecipe: mergedSessionRecipe,
            tags: tags.length > 0 ? tags : undefined,
            venueIdOverride: timeBlock.venueIdOverride ?? roomBlock.venueIdOverride,
            sessionOverrides: mergedSessionOverrides,
            presentationOverrides: mergedPresentationOverrides,
            speakerOverrides: mergedSpeakerOverrides,
            sessionPatch: timeBlock.sessionPatch ?? roomBlock.sessionPatch,
            presentationPatch: timeBlock.presentationPatch ?? roomBlock.presentationPatch,
            speakerPatch: timeBlock.speakerPatch ?? roomBlock.speakerPatch,
          };
        });

        expanded.push({
          dayIndex,
          blocks,
        });
      }
    }
  }
  return expanded;
};

export const normalizeRecipe = (recipe: RecipeConfig): NormalizedRecipe => {
  if (recipe.meeting.dayCount <= 0) {
    throw new Error("recipe.meeting.dayCount must be > 0.");
  }
  if (recipe.venues.length === 0) {
    throw new Error("recipe.venues must include at least one venue.");
  }
  if (recipe.rooms.length === 0) {
    throw new Error("recipe.rooms must include at least one room.");
  }

  const rooms: RecipeRoom[] = [...recipe.rooms];
  for (const lifecycle of recipe.roomLifecycles ?? []) {
    if (!rooms.some((room) => room.roomId === lifecycle.intoRoomId)) {
      const seedRoom = rooms.find((room) => lifecycle.mergeRoomIds.includes(room.roomId));
      rooms.push({
        roomId: lifecycle.intoRoomId,
        roomName: lifecycle.intoRoomName,
        roomType: lifecycle.intoRoomType ?? seedRoom?.roomType ?? "ballroom",
        venueId: lifecycle.venueId ?? seedRoom?.venueId ?? recipe.venues[0]!.venueId,
      });
    }
  }

  const roomGroups = recipe.roomGroups ?? [];
  const roomBlocks = recipe.roomBlocks ?? [];
  const blockTemplates = recipe.blockTemplates ?? [];
  const defaultSessionType = recipe.defaults?.defaultSessionType ?? SessionType.Symposium;
  const expandedDayPlans = expandRoomBlocksToDayPlans(
    roomBlocks,
    recipe.meeting.dayCount,
    defaultSessionType,
  );
  const mergedDayPlans = mergeDayPlans([...recipe.dayPlans, ...expandedDayPlans]);

  return {
    meeting: recipe.meeting,
    venues: [...recipe.venues],
    rooms,
    roomsById: new Map(rooms.map((room) => [room.roomId, room])),
    roomGroups,
    roomGroupsById: new Map(roomGroups.map((group) => [group.groupId, group])),
    roomBlocks,
    roomLifecycles: [...(recipe.roomLifecycles ?? [])],
    blockTemplatesById: new Map(blockTemplates.map((template) => [template.templateId, template])),
    dayPlans: mergedDayPlans,
    rules: defaultRules(recipe.rules),
    defaults: {
      defaultSessionType,
      sessionCountPerRoom: toPositiveInt(recipe.defaults?.sessionCountPerRoom, 1),
      presentationsPerSession: toPositiveInt(recipe.defaults?.presentationsPerSession, 2),
      speakersPerPresentation: toPositiveInt(recipe.defaults?.speakersPerPresentation, 2),
      defaultSessionRecipe: recipe.defaults?.defaultSessionRecipe,
      sessionTypeRecipes: recipe.defaults?.sessionTypeRecipes ?? {},
    },
  };
};

const mergeBlockTemplate = (block: RecipeBlock, template: RecipeBlockTemplate | undefined): RecipeBlock => {
  if (!template) {
    return block;
  }
  return {
    ...template,
    ...block,
    blockId: block.blockId,
    templateId: block.templateId,
  };
};

const resolveBlockRoomIds = (block: RecipeBlock, normalized: NormalizedRecipe) => {
  const roomIds: string[] = [];
  if (block.roomIds) {
    roomIds.push(...block.roomIds);
  }
  for (const groupId of block.roomGroupIds ?? []) {
    const group = normalized.roomGroupsById.get(groupId);
    if (!group) {
      throw new Error(`Unknown room group "${groupId}" in block "${block.blockId}".`);
    }
    roomIds.push(...group.roomIds);
  }
  if (block.roomTypeFilter && block.roomTypeFilter.length > 0) {
    for (const room of normalized.rooms) {
      if (block.roomTypeFilter.includes(room.roomType)) {
        roomIds.push(room.roomId);
      }
    }
  }

  const uniqueRoomIds = uniqueStrings(roomIds);
  for (const roomId of uniqueRoomIds) {
    if (!normalized.roomsById.has(roomId)) {
      throw new Error(`Unknown roomId "${roomId}" in block "${block.blockId}".`);
    }
  }
  return uniqueRoomIds;
};

export const planTimeBlocksByDayRoom = (normalized: NormalizedRecipe): PlannedRoomBlock[] => {
  const planned: PlannedRoomBlock[] = [];

  for (const dayPlan of normalized.dayPlans) {
    if (dayPlan.dayIndex < 0 || dayPlan.dayIndex >= normalized.meeting.dayCount) {
      throw new Error(`Invalid dayIndex ${dayPlan.dayIndex}; outside meeting dayCount.`);
    }

    dayPlan.blocks.forEach((rawBlock, blockOrdinal) => {
      const block = mergeBlockTemplate(rawBlock, rawBlock.templateId ? normalized.blockTemplatesById.get(rawBlock.templateId) : undefined);
      const startMinutes = parseTimeToMinutes(block.startTime);
      const endMinutes = parseTimeToMinutes(block.endTime);
      if (endMinutes <= startMinutes) {
        throw new Error(`Block "${block.blockId}" has endTime <= startTime.`);
      }

      const targetRoomIds = resolveBlockRoomIds(block, normalized);
      targetRoomIds.forEach((roomId, targetOrdinal) => {
        const room = normalized.roomsById.get(roomId);
        if (!room) {
          throw new Error(`Unknown room "${roomId}" during planning.`);
        }
        const sessionTypeRecipe = normalized.defaults.sessionTypeRecipes[block.sessionType];
        const mergedSessionRecipe = mergeSessionRecipes(
          normalized.defaults.defaultSessionRecipe,
          sessionTypeRecipe,
          block.sessionRecipe,
          {
            sessionOverrides: block.sessionOverrides,
            presentationOverrides: block.presentationOverrides,
            speakerOverrides: block.speakerOverrides,
            sessionPatch: block.sessionPatch,
            presentationPatch: block.presentationPatch,
            speakerPatch: block.speakerPatch,
          },
        );
        const plannedPresentationsPerSession = block.presentationsPerSession
          ?? mergedSessionRecipe?.presentationsPerSession
          ?? (mergedSessionRecipe?.presentationPlan?.length
            ? mergedSessionRecipe.presentationPlan.length
            : undefined)
          ?? normalized.defaults.presentationsPerSession;
        const plannedSpeakersPerPresentation = block.speakersPerPresentation
          ?? mergedSessionRecipe?.speakersPerPresentation
          ?? normalized.defaults.speakersPerPresentation;
        const plannedSessionCountPerRoom = block.sessionCountPerRoom
          ?? mergedSessionRecipe?.sessionCountPerRoom
          ?? normalized.defaults.sessionCountPerRoom;

        planned.push({
          plannedId: idFromParts("pb", dayPlan.dayIndex, blockOrdinal, targetOrdinal),
          dayIndex: dayPlan.dayIndex,
          blockId: block.blockId,
          roomId,
          startMinutes,
          endMinutes,
          sessionType: block.sessionType,
          sessionCountPerRoom: toPositiveInt(plannedSessionCountPerRoom, normalized.defaults.sessionCountPerRoom),
          presentationsPerSession: toPositiveInt(
            plannedPresentationsPerSession,
            normalized.defaults.presentationsPerSession,
          ),
          speakersPerPresentation: toPositiveInt(
            plannedSpeakersPerPresentation,
            normalized.defaults.speakersPerPresentation,
          ),
          sessionRecipe: mergedSessionRecipe,
          tags: [...(block.tags ?? [])],
          venueId: block.venueIdOverride ?? room.venueId,
          hasVenueOverride: !!block.venueIdOverride,
          sessionOverrides: mergedSessionRecipe?.sessionOverrides,
          presentationOverrides: mergedSessionRecipe?.presentationOverrides,
          speakerOverrides: mergedSessionRecipe?.speakerOverrides,
          sessionPatch: mergedSessionRecipe?.sessionPatch,
          presentationPatch: mergedSessionRecipe?.presentationPatch,
          speakerPatch: mergedSessionRecipe?.speakerPatch,
        });
      });
    });
  }

  return planned.sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex;
    }
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes;
    }
    return a.roomId.localeCompare(b.roomId);
  });
};

const resolveRoomIdForDay = (dayIndex: number, roomId: string, normalized: NormalizedRecipe) => {
  let currentRoomId = roomId;
  let changed = true;
  let guard = 0;
  while (changed && guard < 20) {
    changed = false;
    guard += 1;
    for (const lifecycle of normalized.roomLifecycles) {
      if (dayIndex >= lifecycle.dayIndex && lifecycle.mergeRoomIds.includes(currentRoomId)) {
        currentRoomId = lifecycle.intoRoomId;
        changed = true;
      }
    }
  }
  return currentRoomId;
};

export const applyRulesAndConstraints = (
  plannedBlocks: PlannedRoomBlock[],
  normalized: NormalizedRecipe,
): PlannedRoomBlock[] => {
  const withLifecycle = plannedBlocks.map((planned) => {
    if (!normalized.rules.enforceRoomLifecycle) {
      return planned;
    }
    const resolvedRoomId = resolveRoomIdForDay(planned.dayIndex, planned.roomId, normalized);
    const resolvedRoom = normalized.roomsById.get(resolvedRoomId);
    return {
      ...planned,
      roomId: resolvedRoomId,
      venueId: planned.hasVenueOverride ? planned.venueId : resolvedRoom?.venueId ?? planned.venueId,
    };
  });

  if (!normalized.rules.enforcePlenaryUnopposed) {
    return withLifecycle;
  }

  const plenaryTypeSet = new Set(normalized.rules.plenarySessionTypes);
  const unopposedTagSet = new Set(normalized.rules.unopposedBlockTags);

  const windowsByDay = new Map<number, Array<{ start: number; end: number }>>();
  for (const block of withLifecycle) {
    const hasUnopposedTag = block.tags.some((tag) => unopposedTagSet.has(tag));
    if (hasUnopposedTag && plenaryTypeSet.has(block.sessionType)) {
      const dayWindows = windowsByDay.get(block.dayIndex) ?? [];
      dayWindows.push({ start: block.startMinutes, end: block.endMinutes });
      windowsByDay.set(block.dayIndex, dayWindows);
    }
  }

  return withLifecycle.filter((block) => {
    if (plenaryTypeSet.has(block.sessionType)) {
      return true;
    }
    const windows = windowsByDay.get(block.dayIndex);
    if (!windows || windows.length === 0) {
      return true;
    }
    return !windows.some((window) =>
      overlaps(block.startMinutes, block.endMinutes, window.start, window.end),
    );
  });
};
