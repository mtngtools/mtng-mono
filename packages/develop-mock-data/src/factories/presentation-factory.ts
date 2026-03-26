import type { PresentationFull } from "@mtngtools/core";
import { presentationFocusWords, presentationLeadWords } from "../dictionaries";
import { applyOverrides, idFromParts, indexInto, isoFromMs } from "../internal";
import type { PatchContext } from "../recipe-types";
import { createMockSpeakerFromSeed } from "./speaker-factory";

export type PresentationSeed = {
  dayIndex: number;
  blockOrdinal: number;
  sessionOrdinal: number;
  presentationOrdinal: number;
  startMs: number;
  endMs: number;
  speakersPerPresentation: number;
};

export type PresentationFactoryHooks = {
  presentationOverrides?: Partial<PresentationFull>;
  speakerOverrides?: Partial<PresentationFull["prSpeakers"][number]>;
  presentationPatch?: (presentation: PresentationFull, ctx: PatchContext) => PresentationFull;
  speakerPatch?: (
    speaker: PresentationFull["prSpeakers"][number],
    ctx: PatchContext,
  ) => PresentationFull["prSpeakers"][number];
  contextBase: Omit<PatchContext, "presentationOrdinal" | "speakerOrdinal">;
};

export const createMockPresentationFromSeed = (
  seed: PresentationSeed,
  hooks: PresentationFactoryHooks,
): PresentationFull => {
  const { dayIndex, blockOrdinal, sessionOrdinal, presentationOrdinal, startMs, endMs, speakersPerPresentation } =
    seed;
  const prId = idFromParts("pr", dayIndex, blockOrdinal, sessionOrdinal, presentationOrdinal);
  const titleLead = indexInto(
    presentationLeadWords,
    undefined,
    dayIndex * 17 + blockOrdinal * 11 + sessionOrdinal * 5 + presentationOrdinal,
  );
  const titleFocus = indexInto(
    presentationFocusWords,
    undefined,
    dayIndex * 19 + blockOrdinal * 13 + sessionOrdinal * 7 + presentationOrdinal * 3,
  );

  const prSpeakers = Array.from({ length: speakersPerPresentation }, (_, speakerOrdinal) => {
    const baseSpeaker = createMockSpeakerFromSeed({
      dayIndex,
      blockOrdinal,
      sessionOrdinal,
      presentationOrdinal,
      speakerOrdinal,
    }, hooks.speakerOverrides);
    const speakerCtx: PatchContext = {
      ...hooks.contextBase,
      presentationOrdinal,
      speakerOrdinal,
    };
    return hooks.speakerPatch ? hooks.speakerPatch(baseSpeaker, speakerCtx) : baseSpeaker;
  });

  const basePresentation: PresentationFull = applyOverrides(
    {
      prId,
      prSlug: prId,
      prTitle: `${titleLead}: ${titleFocus}`,
      prStart: startMs,
      prEnd: endMs,
      prStartStr: isoFromMs(startMs),
      prEndStr: isoFromMs(endMs),
      prSpeakers,
    },
    hooks.presentationOverrides,
  );

  const presentationCtx: PatchContext = {
    ...hooks.contextBase,
    presentationOrdinal,
    speakerOrdinal: 0,
  };
  return hooks.presentationPatch ? hooks.presentationPatch(basePresentation, presentationCtx) : basePresentation;
};
