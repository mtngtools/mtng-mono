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
    // Named cue/timer-hint libraries (#47). The meeting is the PRIMARY store — sessions/presentations
    // usually just reference into these by key (see `cuesRef`/`timerHintsRef`; a session may shadow a key
    // via `ssCueSets`/`ssHintSets`). Per-phase namespaces, each with its own optional `default` key.
    mtCueSets?: PhaseNamedSets<PresentationPhaseCue>,
    mtHintSets?: PhaseNamedSets<PresentationPhaseTimerHint>,
    // Named phase-preset library (#55) — the PRIMARY store, referenced by `prPhasesPreset`. See PhasePresetLibrary.
    mtPhasePresets?: PhasePresetLibrary,
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
    // Session-level named cue/hint libraries (#47) — add to, or shadow same-key entries of, the meeting's
    // `mt*Sets`. Optional/rarely populated: the meeting is normally the sole store. Ref lookup is session-lib
    // THEN meeting-lib.
    ssCueSets?: PhaseNamedSets<PresentationPhaseCue>,
    ssHintSets?: PhaseNamedSets<PresentationPhaseTimerHint>,
    // Session-level phase-preset library (#55) — optional; adds/shadows meeting presets of the same key. Lookup is session THEN meeting.
    ssPhasePresets?: PhasePresetLibrary,
} & Partial<HasRoomId>>;

// --- Presentation phase timing (spec: spec/data/meeting/presentation-timing/) ---

// Shared minutes-or-percent encoding (#46). The explicit `unit` discriminator (no magic-number
// sentinels) keeps this portable to C#/.NET per ADR-0005. The percentage denominator is fixed by the
// consuming field's role — never author-selected — so there is no "percent of what" selector.
export type TimingUnit = 'minutes' | 'percent';
export type TimingQuantity = {
    unit?: TimingUnit,          // absent ⇒ 'minutes' (matches the sibling whenUnits/atUnits)
    value: number,              // may be negative where the field is signed
}

export type PresentationPhaseCue = {
    kind: string,               // 'warn' | 'warn2' | 'over' | 'over2' or any custom string — a consumer-facing
                                 //   label only; plays no role in the timing calculation itself
    anchor?: 'start' | 'end',   // defaults 'end'
    at: number,                 // signed threshold. anchor 'end': positive = before end, negative = after end.
                                 //   anchor 'start': positive = after start, negative = before start.
    atUnits?: TimingUnit,       // absent ⇒ 'minutes' (#50). 'percent' reinterprets only |at| as a percentage of the
                                 //   phase STARTING TIMER VALUE — the minutes placed on the timer when the phase starts
                                 //   (after any `remaining` basis-switch + up-front floor/cap). NOT the floor/cap basis
                                 //   below. Sign/anchor unchanged; no [0,100] clamp. % cue dropped (+resolverNotes)
                                 //   only when that starting value is 0; absolute cues always kept.
}

export type PhaseTimerHintBase = {
    // Gating conditions — an entry qualifies only when ALL present conditions hold (logical AND).
    whenUnits?: TimingUnit,     // ONE unit for ALL when* thresholds in this entry; absent ⇒ 'minutes' (#46).
                                 //   'percent' = of the presentation BLOCK (prEnd − prStart). Can't be mixed across the three.
    whenOverBy?: number,        // cumulative pr overage (vs. scheduled prEnd) required to activate — minutes, or % of block
    whenPrEarlyBy?: number,     // pr block started at least this much early — minutes, or % of block
    whenPrLateBy?: number,      // pr block started at least this much late — minutes, or % of block
}

// floor/cap carry a minutes-or-percent amount by intersecting TimingQuantity (#46): { unit, value }.
// A 'percent' floor/cap is of the phase's INITIAL calculated minutes (PresentationCalculatedPhase.minutes) —
// a DIFFERENT basis than a cue's `atUnits` (phase starting timer value). A 0-calc phase ignores a % floor/cap
// (floor→0, cap→∞, +resolverNotes) but still honors an absolute floor/cap and a `remaining` basis-switch.
export type PresentationPhaseTimerHint =
    | (PhaseTimerHintBase & { kind: 'remaining' })                 // switch basis: ignore this phase's planned
                                                                    //   `minutes`, use actual time remaining before prEnd
    | (PhaseTimerHintBase & { kind: 'floor' } & TimingQuantity)    // minimum duration — { unit, value }
    | (PhaseTimerHintBase & { kind: 'cap' } & TimingQuantity)      // maximum duration — { unit, value }
    | (PhaseTimerHintBase & { kind: 'protectQA' })                 // TALK-ONLY (ignored on intro/qa): cap talk at its
                                                                    //   own calculated minutes so it can't borrow qa's
                                                                    //   time. Valueless flag; a cap-producer. See spec.
    | (PhaseTimerHintBase & { kind: string, [key: string]: unknown }); // custom/extensible

// Timer load directive (#45 semantics / #54 data). Absent ⇒ effective 'ignore'. DATA ONLY here — the runtime
// precedence (explicit > preset > host phaseLoading > ignore) and per-value behavior are owned downstream by
// mtng-dotnet-mono `Compose/MtngTools.Compose.TimerManager`, which references this spec.
//   auto        — set-and-run this phase                  · clear  — clear the timer
//   auto-paused — set-and-HOLD this phase (running:false), so a driver reporting WHICH phase (not whether to run)
//                 can load what to show; a `remaining`-basis phase runs anyway (can't be staged)  · downstream
//   ignore (default) — do nothing                          · next   — set-and-hold the NEXT phase as a preview
export type PhaseLoad = 'auto' | 'auto-paused' | 'clear' | 'ignore' | 'next';

// The shared phase base (#54): the four "not-a-duration, not-a-ref" props carried VERBATIM across the raw,
// calculated, and resolved tiers. Concrete-only and ref-free — no `minutes`, no `*Ref` — precisely so a phase-
// preset body (PresentationPhasesPreset, #55) can reuse it as a terminal "quick copy of everything" value.
export type PresentationPhaseBase = {
    label?: string,      // overrides the default agenda label (Introduction / Talk / Questions) for this phase
    load?: PhaseLoad,    // timer load directive (see PhaseLoad); absent ⇒ effective 'ignore'
    cues?: PresentationPhaseCue[],
    timerHints?: PresentationPhaseTimerHint[],
}

// The cue/hint named-ref pair (#48/#54). Deliberately OUTSIDE PresentationPhaseBase so preset bodies stay
// concrete-only. Mixed into the raw + calculated phase tiers (which carry cue/hint SOURCES forward unresolved),
// and NEVER into the resolved tier (which holds deref'd arrays only). A `*Ref` names a key resolved session-lib
// THEN meeting-lib; a dangling ref falls through the precedence ladder (+resolverNotes). If both the inline array
// (from the base) and its `*Ref` are set, the inline array WINS (+resolverNotes). See the ladder in the spec.
export type HasTimerCueHintRefs = {
    cuesRef?: string,
    timerHintsRef?: string,
}

// Raw/authored phase (#54) = base + cue/hint refs + the dual-encoded `minutes`.
export type PresentationPhase = Simplify<PresentationPhaseBase & HasTimerCueHintRefs & {
    minutes?: number,   // raw wire/DB encoding: >0 concrete (fractions allowed) · 0/omit/absent-key = phase
                         //   doesn't exist · −1 = fill (elastic, absorbs remaining block time) · −2 = no-time
                         //   (shown, off the committed clock)
}>;

export type PresentationPhases = {
    intro?: PresentationPhase,
    talk?: PresentationPhase,
    qa?: PresentationPhase,
}

// Phase presets (#55) — a "quick copy of everything": one named object supplying all three phases'
// PresentationPhaseBase props (label/load/cues/timerHints) at once, for speaker systems that can set only one
// field (`prPhasesPreset`). Behavior/display ONLY — no `minutes` (durations stay schedule-driven) and no `*Ref`
// (bodies are terminal/concrete). Complements the finer-grained per-phase cuesRef/timerHintsRef (targeted reuse).
export type PresentationPhasesPreset = {
    intro?: PresentationPhaseBase,
    talk?: PresentationPhaseBase,
    qa?: PresentationPhaseBase,
}

// Preset library — a FLAT map (preset name → whole-presentation preset), hosted at Meeting (`mtPhasePresets`,
// primary) and Session (`ssPhasePresets`, shadows meeting for the same key). Unlike NamedSets there is no per-phase
// namespace (a preset already spans all phases) and no `default` (a preset is opted into by naming it in
// `prPhasesPreset`). Lookup resolves session-lib THEN meeting-lib; a dangling key falls through as if `prPhasesPreset`
// were unset (+resolverNotes). Resolved at the RESOLVED tier only — never affects durations. See spec.
export type PhasePresetLibrary = Record<string, PresentationPhasesPreset>;

// A session default is a session-wide CUE/HINT policy — the same inline-OR-ref union as a PresentationPhase's
// cue/hint source (#48; literal wins if both, dangling ref falls through). Deliberately NARROW (#55): cues/timerHints
// only, NO label/load — label falls back to the built-in phase name, and load's session-wide default is the room's
// job (downstream host phaseLoading), not authored here.
export type SessionPhaseDefault = Simplify<{
    cues?: PresentationPhaseCue[],
    timerHints?: PresentationPhaseTimerHint[],
} & HasTimerCueHintRefs>;

export type SessionPhaseDefaults = {
    intro?: SessionPhaseDefault,
    talk?: SessionPhaseDefault,
    qa?: SessionPhaseDefault,
}

// Named, reusable cue/hint libraries (#47). One namespace per phase; within a namespace, `sets` maps a
// string key to one phase's array, and `default` optionally names the key used when nothing more specific
// applies. Keyed map (unordered — C# Dictionary; ADR-0005), so the default is a single string, not a per-set
// flag. Referenced by `cuesRef`/`timerHintsRef` (PresentationPhase / SessionPhaseDefault) and hosted at both
// Meeting (`mt*Sets`, primary) and Session (`ss*Sets`, shadowing) level.
export type NamedSets<T> = {
    sets: Record<string, T[]>,   // key → a set (one phase's array)
    default?: string,            // names a key in `sets`; absent = no default
}

export type PhaseNamedSets<T> = {
    intro?: NamedSets<T>,
    talk?: NamedSets<T>,
    qa?: NamedSets<T>,
}

// Complex-resolver output (see "Calculated Types Pattern", packages/core/src/data/spec/README.md) —
// distinct from the simple default-filling "Resolved Types Pattern" used elsewhere in this file.

// Per-phase computed timing (#54) — the concrete duration fields, factored into their own mixin so the
// calculated and resolved tiers share exactly this shape (ResolvedPresentationPhase = base + THIS).
export type PhaseCalculatedTiming = {
    minutes: number,     // resolved concrete duration; 0 for no-time or a starved fill
    start: UnixTimestampMs,
    end: UnixTimestampMs, // start === end for a zero-length phase
    source: 'concrete' | 'fill' | 'no-time' | 'normalized-fill' | 'normalized-no-time',
}

// Calculated phase (#54) = the shared base + cue/hint refs + computed timing. Durations are resolved here, but
// cue/hint SOURCES ride along UNRESOLVED — the phase's own inline arrays (via the base) and its `*Ref`s (via the
// mixin) are carried forward verbatim; the precedence ladder + ref/preset deref run later, at the Resolved tier.
// Presets NEVER reach this tier (they carry no `minutes`, so durations are computed without them).
export type PresentationCalculatedPhase = Simplify<PresentationPhaseBase & HasTimerCueHintRefs & PhaseCalculatedTiming>;

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
    prPhasesPreset?: string,                     // names a PresentationPhasesPreset in the mt/ssPhasePresets library (#55) —
                                                  //   a "quick copy of everything"; resolved at the Resolved tier, never affects durations
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

// Simple-fallback tier (this file's ordinary "Resolved Types Pattern", not the complex resolver above) =
// the shared base (its label/load/cues/timerHints now hold the EFFECTIVE, deref'd values) + computed timing.
// It carries NO `*Ref` (refs are resolved away here) — that's how it differs structurally from Calculated.
//
// Resolution runs PER (phase, prop) over {label, cues, timerHints, load} (#55): props merge ACROSS a phase
// (each sourced independently), and a winning array/value REPLACES whole (never element-merges; an explicit
// [] counts as present). Rungs, first present wins:
//   1. explicit        — prPhases.<phase>.<prop>                    (cues/timerHints: inline | *Ref, inline wins if both)
//   2. preset          — <resolved prPhasesPreset>.<phase>.<prop>   (concrete; no ref)
//   3. session default — ssPhaseDefaults.<phase>.<prop>             (cues/timerHints ONLY; inline | *Ref)
//   4. library default — ssCueSets/ssHintSets.<phase>.default else mt* (cues/timerHints ONLY)
//   5. none            — label ⇒ built-in phase name (UI); load ⇒ effective 'ignore'
// Any *Ref (and the prPhasesPreset key) resolves session-lib THEN meeting-lib; a dangling ref/key falls through
// to the next rung (+resolverNotes). Selected arrays are carried VERBATIM — % → minutes is the timer's at
// runtime, never baked here. Durations pass through from PresentationCalculatedPhase unchanged; presets touch
// only cues/hints/label/load, never durations. Callers supply prPhasesCalculated, prPhasesPreset + libraries,
// ssPhaseDefaults/ss*Sets, mt*Sets; the lookup itself is the caller's (out of this spec's scope).
export type ResolvedPresentationPhase = Simplify<PresentationPhaseBase & PhaseCalculatedTiming>;

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


