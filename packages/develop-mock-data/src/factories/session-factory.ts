import type { SessionType } from "../constants";
import { sessionLeadWords, sessionTailWords } from "../dictionaries";
import { applyOverrides, idFromParts, indexInto, isoFromMs } from "../internal";
import type { MockSession, PatchContext, SessionPresentationRecipeItem, SessionRecipe } from "../recipe-types";
import { createMockPresentationFromSeed } from "./presentation-factory";

export type SessionSeed = {
  dayIndex: number;
  blockOrdinal: number;
  sessionOrdinal: number;
  blockId: string;
  roomId: string;
  venueId: string;
  sessionType: SessionType;
  startMs: number;
  endMs: number;
  presentationsPerSession: number;
  speakersPerPresentation: number;
};

export type SessionFactoryHooks = {
  sessionOverrides?: Partial<MockSession>;
  presentationOverrides?: Partial<MockSession["ssPresentations"][number]>;
  speakerOverrides?: Partial<MockSession["ssPresentations"][number]["prSpeakers"][number]>;
  sessionPatch?: (session: MockSession, ctx: PatchContext) => MockSession;
  presentationPatch?: (
    presentation: MockSession["ssPresentations"][number],
    ctx: PatchContext,
  ) => MockSession["ssPresentations"][number];
  speakerPatch?: (
    speaker: MockSession["ssPresentations"][number]["prSpeakers"][number],
    ctx: PatchContext,
  ) => MockSession["ssPresentations"][number]["prSpeakers"][number];
};

const buildPresentationPlan = (
  presentationPlan: SessionPresentationRecipeItem[] | undefined,
  presentationsPerSession: number,
): SessionPresentationRecipeItem[] => {
  if (presentationPlan && presentationPlan.length > 0) {
    return presentationPlan;
  }
  return Array.from({ length: presentationsPerSession }, () => ({}));
};

const normalizePresentationDurationsMs = (
  items: SessionPresentationRecipeItem[],
  totalDurationMs: number,
): number[] => {
  const totalDurationMin = Math.max(1, Math.floor(totalDurationMs / 60_000));
  const specified = items.map((item) => (item.durationMin && item.durationMin > 0 ? item.durationMin : undefined));
  const specifiedTotal = specified.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const unspecifiedCount = specified.filter((value) => value === undefined).length;

  if (specifiedTotal <= totalDurationMin) {
    const remaining = totalDurationMin - specifiedTotal;
    const fill = unspecifiedCount > 0 ? remaining / unspecifiedCount : 0;
    return items.map((_, idx) => Math.max(1, Math.round((specified[idx] ?? fill) * 60_000)));
  }

  // If requested durations exceed block length, scale them down proportionally.
  const ratio = totalDurationMin / specifiedTotal;
  return items.map((_, idx) => Math.max(1, Math.round((specified[idx] ?? 1) * ratio * 60_000)));
};

export const createMockSessionFromSeed = (
  seed: SessionSeed,
  hooks: SessionFactoryHooks = {},
  sessionRecipe?: SessionRecipe,
): MockSession => {
  const {
    dayIndex,
    blockOrdinal,
    sessionOrdinal,
    blockId,
    roomId,
    venueId,
    sessionType,
    startMs,
    endMs,
    presentationsPerSession,
    speakersPerPresentation,
  } = seed;

  const ssId = idFromParts("ss", dayIndex, blockOrdinal, sessionOrdinal);
  const titleLead = indexInto(sessionLeadWords, undefined, dayIndex * 11 + blockOrdinal * 7 + sessionOrdinal);
  const titleTail = indexInto(sessionTailWords, undefined, dayIndex * 13 + blockOrdinal * 5 + sessionOrdinal * 3);

  const totalDuration = Math.max(1, endMs - startMs);
  const effectiveRecipe = sessionRecipe ?? {};
  const presentationItems = buildPresentationPlan(
    effectiveRecipe.presentationPlan,
    presentationsPerSession,
  );
  const presentationDurations = normalizePresentationDurationsMs(presentationItems, totalDuration);

  const contextBase: Omit<PatchContext, "presentationOrdinal" | "speakerOrdinal"> = {
    dayIndex,
    blockId,
    roomId,
    sessionOrdinal,
  };

  let cursorMs = startMs;
  const ssPresentations = presentationItems.map((presentationItem, presentationOrdinal) => {
    const presentationStart = cursorMs;
    const durationMs = presentationDurations[presentationOrdinal] ?? 1;
    const isLast = presentationOrdinal === presentationItems.length - 1;
    const presentationEnd = isLast ? endMs : Math.min(endMs, presentationStart + durationMs);
    cursorMs = presentationEnd;
    const speakersPerItem =
      presentationItem.speakersPerPresentation ?? speakersPerPresentation;

    return createMockPresentationFromSeed(
      {
        dayIndex,
        blockOrdinal,
        sessionOrdinal,
        presentationOrdinal,
        startMs: presentationStart,
        endMs: presentationEnd,
        speakersPerPresentation: speakersPerItem,
      },
      {
        presentationOverrides: {
          ...hooks.presentationOverrides,
          ...effectiveRecipe.presentationOverrides,
          ...presentationItem.presentationOverrides,
        },
        speakerOverrides: hooks.speakerOverrides,
        presentationPatch: hooks.presentationPatch,
        speakerPatch: hooks.speakerPatch,
        contextBase,
      },
    );
  });

  const baseSession: MockSession = applyOverrides(
    {
      ssId,
      ssSlug: ssId,
      ssTitle: `${titleLead} ${titleTail}`,
      ssStart: startMs,
      ssEnd: endMs,
      ssStartStr: isoFromMs(startMs),
      ssEndStr: isoFromMs(endMs),
      rmId: roomId,
      ssType: sessionType,
      venueId,
      dayIndex,
      blockId,
      ssPresentations,
    },
    {
      ...effectiveRecipe.sessionOverrides,
      ...hooks.sessionOverrides,
    },
  );

  const sessionCtx: PatchContext = {
    ...contextBase,
    presentationOrdinal: 0,
    speakerOrdinal: 0,
  };
  return hooks.sessionPatch ? hooks.sessionPatch(baseSession, sessionCtx) : baseSession;
};
