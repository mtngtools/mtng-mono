import type { Simplify } from "@mtngtools/utils-core";
import type { BaseEnv } from "../app-env";

export type TzConfig = {
    tzName: string,
    tzAbbrev: string,
    tzDisplayName: string
};

export type MeetingBase = {
    mtDir: string,
}

export type Meeting = Simplify<MeetingBase & {
    mtSlug?: string,
    mtName: string,
} & TzConfig>;

export type MeetingDataVersion = {
    currentDataVersion?: string;
    previewDataVersion?: string;
}

export type BaseEnvMeeting = Simplify<BaseEnv & MeetingBase>;

export type RoomSource = {
    rmSourceId: string,
}

export type HasRoomId = {
    rmId: string,
}

export type RoomBase = Simplify<HasRoomId & {
    rmSlug?: string,
    rmName?: string,
    rmFullName?: string,
    rmType?: string,
    rmTags?: string[],
    rmMetadata?: Record<string, unknown>,
}>;

export type Room = Simplify<RoomBase & {
    rmShortName?: string,
    rmVenue?: string,
    rmVenueSection?: string,
    isMain?: boolean,
} & Partial<RoomSource>>;

// Unix timestamp in milliseconds, matching JS Date and common date-library defaults.
export type UnixTimestampMs = number;

export type SessionBase = Simplify<{
    ssId: string,
    ssSlug?: string,
    ssTitle: string,
    ssStart: UnixTimestampMs,
    ssEnd: UnixTimestampMs,
    ssStartStr?: string,
    ssEndStr?: string,
    qaLink?: string,
    ssType?: string,
    ssTags?: string[],
    ssSecondaryTags?: string[],
    ssMetadata?: Record<string, unknown>,
    ssSpeakerNames?: string[], // optional array of all speaker names for session summaries
    ssModeratorNames?: string[], // optional array of all moderator names for session summaries
    ssPhaseDefaults?: SessionPhaseDefaults, // session-wide default cues/timerHints per presentation phase; see spec/data/meeting/presentation-timing/
} & Partial<HasRoomId>>;

// --- Presentation phase timing (spec: spec/data/meeting/presentation-timing/) ---

export type PresentationPhaseCue = {
    kind: string,               // 'warn' | 'warn2' | 'over' | 'over2' or any custom string — a consumer-facing
                                 //   label only; plays no role in the timing calculation itself
    anchor?: 'start' | 'end',   // defaults 'end'
    at: number,                 // signed threshold. anchor 'end': positive = before end, negative = after end.
                                 //   anchor 'start': positive = after start, negative = before start.
}

export type PhaseTimerHintBase = {
    // Gating conditions — an entry qualifies only when ALL present conditions hold (logical AND).
    whenOverBy?: number,        // cumulative pr overage (minutes, vs. scheduled prEnd) required to activate
    whenPrEarlyBy?: number,     // pr block started at least this many minutes early
    whenPrLateBy?: number,      // pr block started at least this many minutes late
}

export type PresentationPhaseTimerHint =
    | (PhaseTimerHintBase & { kind: 'remaining' })              // switch basis: ignore this phase's planned
                                                                 //   `minutes`, use actual time remaining before prEnd
    | (PhaseTimerHintBase & { kind: 'floor', minutes: number })  // minimum duration
    | (PhaseTimerHintBase & { kind: 'cap', minutes: number })    // maximum duration
    | (PhaseTimerHintBase & { kind: 'protectQA' })               // TALK-ONLY (ignored on intro/qa): cap talk at its
                                                                 //   own calculated minutes so it can't borrow qa's
                                                                 //   time. Valueless flag; a cap-producer. See spec.
    | (PhaseTimerHintBase & { kind: string, [key: string]: unknown }); // custom/extensible

export type PresentationPhase = {
    minutes?: number,   // raw wire/DB encoding: >0 concrete (fractions allowed) · 0/omit/absent-key = phase
                         //   doesn't exist · −1 = fill (elastic, absorbs remaining block time) · −2 = no-time
                         //   (shown, off the committed clock)
    label?: string,      // overrides the default agenda label (Introduction / Talk / Questions) for this phase
    cues?: PresentationPhaseCue[],
    timerHints?: PresentationPhaseTimerHint[],
}

export type PresentationPhases = {
    intro?: PresentationPhase,
    talk?: PresentationPhase,
    qa?: PresentationPhase,
}

export type SessionPhaseDefault = {
    cues?: PresentationPhaseCue[],
    timerHints?: PresentationPhaseTimerHint[],
}

export type SessionPhaseDefaults = {
    intro?: SessionPhaseDefault,
    talk?: SessionPhaseDefault,
    qa?: SessionPhaseDefault,
}

// Complex-resolver output (see "Calculated Types Pattern", packages/core/src/data/spec/README.md) —
// distinct from the simple default-filling "Resolved Types Pattern" used elsewhere in this file.

export type PresentationCalculatedPhase = {
    minutes: number,     // resolved concrete duration; 0 for no-time or a starved fill
    start: UnixTimestampMs,
    end: UnixTimestampMs, // start === end for a zero-length phase
    source: 'concrete' | 'fill' | 'no-time' | 'normalized-fill' | 'normalized-no-time',
}

export type PresentationCalculatedPhases = {
    intro?: PresentationCalculatedPhase,
    talk?: PresentationCalculatedPhase,
    qa?: PresentationCalculatedPhase,
}

export type PhaseFit =
    | { fit: 'exact' }
    | { fit: 'slack', slackMin: number }
    | { fit: 'overflow', overMin: number };

export type PresentationCalculatedTiming = {
    phases: PresentationCalculatedPhases,
    fit: PhaseFit,
    resolverNotes: string[], // resolver data-quality diagnostics (e.g. "≥2 fill normalized") — NOT the cue schedule
}

export type PresentationBase = {
    prId: string,
    prAltId?: string,
    prAbstractId?: string,
    prSlug?: string,
    prTitle: string,
    prAltTitle?: string,
    prStart: UnixTimestampMs,
    prEnd: UnixTimestampMs,
    prStartStr?: string,
    prEndStr?: string,
    prType?: string,
    prTags?: string[],
    prSecondaryTags?: string[],
    prMetadata?: Record<string, unknown>,
    prPhases?: PresentationPhases,               // raw/authored per-phase data
    prPhasesCalculated?: PresentationCalculatedTiming, // cached complex-resolver output; absent until computed
}

export type SpeakerBase = {
    spId: string,
    spAltId?: string,
    spSlug?: string,
    spFullName: string,
    spFirstName?: string,
    spLastName?: string,
    spFullOrg?: string,
    spOrgName?: string,
    spOrgLoc?: string,
    spEmail?: string,
    spOrder?: string | number,
    spPicURL?: string,
    spMetadata?: Record<string, unknown>,
}

export type PresentationFull<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationBase = PresentationBase,
> = Simplify<PR & {
    prSpeakers: Simplify<SP>[];
    prModerators?: Simplify<SP>[];
}>;

export type SessionChildrenOnly<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
> = Simplify<{
    ssPresentations: Simplify<PR>[];
    ssModerators?: Simplify<SP>[] | string[]; // allow for string array of moderator IDs to avoid unnecessary duplication
}>;

export type SessionWithPres<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
    SS extends SessionBase = SessionBase,
> = Simplify<SS & SessionChildrenOnly<SP, PR>>;

export type SessionWithRoom<
    SS extends SessionBase = SessionBase,
    RM extends Room = Room,
> = Simplify<SS & RM>;

export type SessionWithRoomAndPres<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
    SS extends SessionWithPres<SP, PR> = SessionWithPres<SP, PR>,
    RM extends Room = Room,
> = Simplify<SS & RM>

export type ResolvedSpeaker<
    SP extends SpeakerBase = SpeakerBase,
> = Simplify<SP & Required<Pick<SP, "spSlug">>>;

export type ResolvedPresentation<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>
> = Simplify<PR & Required<Pick<PR, "prSlug" | "prStartStr" | "prEndStr">> & {
    prSpeakers: ResolvedSpeaker<SP>[];
    prModerators: ResolvedSpeaker<SP>[] | string[];
}>;

// Simple-fallback tier (this file's ordinary "Resolved Types Pattern", not the complex resolver above):
// merges SessionPhaseDefaults into a presentation's PresentationCalculatedTiming for cues/timerHints left
// unset at the presentation level. Callers supply both the presentation's calculated timing and the
// session's ssPhaseDefaults; how that merge/lookup is performed is left to the caller (out of this map's scope).
export type ResolvedPresentationPhase = Simplify<PresentationCalculatedPhase & {
    cues?: PresentationPhaseCue[];             // from prPhases.<phase>.cues, else ssPhaseDefaults.<phase>.cues
    timerHints?: PresentationPhaseTimerHint[]; // from prPhases.<phase>.timerHints, else ssPhaseDefaults.<phase>.timerHints
}>;

export type ResolvedPresentationPhases = {
    intro?: ResolvedPresentationPhase,
    talk?: ResolvedPresentationPhase,
    qa?: ResolvedPresentationPhase,
}

export type ResolvedPresentationTiming = {
    phases: ResolvedPresentationPhases,
    fit: PhaseFit,
    resolverNotes: string[],
}

export type ResolvedSession<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
    SS extends SessionWithPres<SP, PR> = SessionWithPres<SP, PR>
> = Simplify<SS & Required<Pick<SS, "ssSlug" | "ssStartStr" | "ssEndStr">> & {
    ssPresentations: ResolvedPresentation<SP, PR>[];
    ssModerators: ResolvedSpeaker<SP>[]; // if was string[] of IDs, resolved to ResolvedSpeaker; 
}>;

export type ResolvedRoom<
    RM extends Room = Room,
> = Simplify<RM & Required<Pick<RM, "rmSlug" | "rmName" | "rmFullName">>>;

export type ResolvedMeeting<
    MT extends Meeting = Meeting,
> = Simplify<MT & Required<Pick<MT, "mtSlug" | "mtName">>>;


