# Presentation Timing

Per-phase timing **configuration data** for a presentation — durations, an agenda-display contract, an in-phase cue schedule, timer hints, a per-phase `load` directive, and reusable named sets / phase presets — sufficient to drive a per-part countdown timer later. Types live in [`core/src/data/meeting.ts`](../../meeting.ts). Field-naming/type-hierarchy conventions (prefixes, Base/Resolved/Calculated patterns) are covered generically in [the parent spec README](../README.md); this doc only covers what's specific to presentation timing.

**Scope line:** this spec defines **data** — durations, value semantics, cue/hint shapes. Timer **runtime behavior/UX** (rendering, chimes, countdown display, live overrides, the actual squeeze/merge algorithms) is out of scope. So is agenda UI implementation, per-phase performer attribution, and speaker-timer implementation.

See [cue-hint-scenarios.md](cue-hint-scenarios.md) for the concrete scenarios that drove this design and why specific alternatives were rejected — useful context before extending this model.

## Presentation phases

A presentation block (`PresentationBase.prStart`/`prEnd`) subdivides into up to three ordered, optional **phases** (see `GLOSSARY.md#meeting-model`):

| Phase | Key | Meaning |
| :--- | :--- | :--- |
| Introduction | `intro` | Opening remarks, typically by a moderator |
| Talk | `talk` | The formal presentation itself (named to avoid colliding with **Presentation**, the whole block) |
| Questions | `qa` | Audience Q&A (reuses the existing `qaLink` convention on `SessionBase`) |

Order is fixed (`intro → talk → qa`) and structural — the container is a keyed object, not an array, because the domain is a fixed 3-phase set. Any phase may be absent. A downstream system may extend for variable/complex ordering; not modeled here.

## Raw vs. calculated: the two-field split

`PresentationBase` carries **two** separate optional fields — raw stays raw, calculated is a separate cache, never a union of one field that could be either shape:

```ts
prPhases?: PresentationPhases;               // raw/authored
prPhasesCalculated?: PresentationCalculatedTiming; // cached complex-resolver output; absent until computed
```

This follows the **Calculated Types Pattern** ([parent spec README](../README.md) §7) — distinct from the simpler **Resolved Types Pattern** (§3) used for `ResolvedPresentation` elsewhere in `meeting.ts` (slug-falls-back-to-id style default-filling). The phase-timing resolver is a multi-step algorithm, not a default-fill, so it gets its own field and its own `*Calculated*` naming rather than overloading `Resolved*`.

`prPhasesCalculated` is a **derived cache of `prPhases`**: whoever writes `prPhases` is responsible for regenerating it, and a consumer that needs a guarantee of freshness should recompute from `prPhases` rather than trust a possibly-stale cache. When/where that regeneration happens (author-time, ingest, on read) is a pipeline concern, out of this spec's scope.

### `PresentationPhaseBase`, the ref mixin, and `PresentationPhase` (raw)

The three phase tiers (raw / calculated / resolved) share a **concrete-only base** — the four "not-a-duration, not-a-ref" props — plus two small mixins, so a value defined once carries the same meaning through every tier:

```ts
export type PhaseLoad = 'auto' | 'auto-paused' | 'clear' | 'ignore' | 'next';   // see “The load directive” below
export type PresentationPhaseBase = {   // concrete-only, ref-free — reused verbatim as a preset body
  label?: string;                        // overrides the default agenda label (Introduction / Talk / Questions)
  load?: PhaseLoad;                      // timer load directive; absent ⇒ effective 'ignore' (data-only)
  cues?: PresentationPhaseCue[];
  timerHints?: PresentationPhaseTimerHint[];
}
export type HasTimerCueHintRefs = { cuesRef?: string; timerHintsRef?: string };   // the named-ref pair — NOT in the base
export type PhaseCalculatedTiming = { minutes: number; start: UnixTimestampMs; end: UnixTimestampMs; source: /* see below */ string };

export type PresentationPhase = PresentationPhaseBase & HasTimerCueHintRefs & { minutes?: number };   // + the raw dual-encoding
export type PresentationPhases = { intro?: PresentationPhase; talk?: PresentationPhase; qa?: PresentationPhase };
```

**Why the base is ref-free.** `cuesRef`/`timerHintsRef` live in a *separate* `HasTimerCueHintRefs` mixin, never in the base, for two reasons: (1) **preset** bodies (below) reuse the base as a *terminal, concrete* value and must carry no refs; (2) it lets the base be shared into `PresentationCalculatedPhase` — which forwards cue/hint sources *unresolved* — while `ResolvedPresentationPhase` includes the base **without** the refs (which have been resolved away). A phase's cue source and hint source are each an inline array **or** a `*Ref`; if both are set the inline array wins (+`resolverNotes`). How the two are selected is the precedence ladder below.

### `minutes` value semantics

A single raw number, dual-encoded (DB-friendly wire format ⇄ a TS discriminated union restored by the resolver):

| Raw value | Meaning |
| :--- | :--- |
| `0` / omit / absent key | Phase doesn't exist (not shown) |
| `> 0` | Concrete minutes (fractions allowed, e.g. `0.5`) |
| `−1` | `fill` — elastic, absorbs remaining block time |
| `−2` | `no-time` — shown, but off the committed clock (contributes 0, no countdown) |

**At most one `fill` per presentation.** `≥ 2 fill` is invalid but non-fatal: the resolver normalizes by phase priority `talk > qa > intro` (the winner keeps `fill`, others become `no-time`) and records a `resolverNotes` diagnostic. The resolver is **total** — malformed input degrades gracefully, it never throws. See [calculation-scenarios.md](calculation-scenarios.md) for the full 64-scenario catalog (every `{absent, concrete, fill, no-time}` combination across the three phases) this reconciliation model was validated against.

**Recommended authoring modes** (documentation guidance, not enforced by the type system):
- **Auto-scheduled** — block length derived from phase durations. Recommend no `fill`, ≥1 concrete phase (typically `talk`).
- **Fixed-block** — pre-set slot. Recommend exactly one `fill` (typically `talk` or `qa`), any concretes.
- A concrete `intro` is atypical (`intro` is usually `no-time`) — only worth setting when displaying an explicit intro time matters.

### Reconciliation & the resolver

**The block is authoritative** — `prStart`/`prEnd` is the slot; phase `minutes` are a planned breakdown within it, never the other way around.

```ts
export type PhaseCalculatedTiming = {   // the computed duration fields, factored out so Calculated & Resolved share them
  minutes: number;     // resolved concrete duration; 0 for no-time or a starved fill
  start: UnixTimestampMs;
  end: UnixTimestampMs; // start === end for a zero-length phase
  source: 'concrete' | 'fill' | 'no-time' | 'normalized-fill' | 'normalized-no-time'; // `normalized-*` = result of the ≥2-fill priority fallback above
}
// = base + refs + computed timing. Durations are resolved here, but cue/hint SOURCES ride along UNRESOLVED —
// the phase's own inline arrays (via the base) and its `*Ref`s (via the mixin) are carried forward verbatim for
// the Resolved tier to select + deref. Presets NEVER reach this tier (they carry no `minutes`).
export type PresentationCalculatedPhase = PresentationPhaseBase & HasTimerCueHintRefs & PhaseCalculatedTiming;
export type PresentationCalculatedPhases = { intro?: PresentationCalculatedPhase; talk?: PresentationCalculatedPhase; qa?: PresentationCalculatedPhase };
export type PhaseFit = { fit: 'exact' } | { fit: 'slack'; slackMin: number } | { fit: 'overflow'; overMin: number };
export type PresentationCalculatedTiming = {
  phases: PresentationCalculatedPhases;
  fit: PhaseFit;
  resolverNotes: string[]; // resolver data-quality diagnostics (e.g. "≥2 fill normalized") — NOT the cue schedule
}
```

Resolver pipeline, `resolve(block, rawPhases) → PresentationCalculatedTiming`:
1. Decode each raw number → typed phase.
2. Normalize `≥2 fill` (priority fallback above).
3. `B = prEnd − prStart`; if `B ≤ 0`, treat as `0` and warn.
4. Durations: concrete → itself · `no-time` → 0 · `fill = max(0, B − Σconcrete)`.
5. Place cumulative from `prStart` in `intro → talk → qa` order; per-phase `start`/`end`; `no-time`/zero-length → `start === end`.
6. Fit: `exact` / `slack` (`B − total`, trailing idle) / `overflow` (`total − B`). Slack and overflow are computed and warned at input — never clamped or thrown. What a timer does with them is out of scope here.

## The `load` directive

`load?: PhaseLoad` (on every phase, via the base) is authored intent for **what a timer should do when this phase becomes current**. It is **data only** here — the five values are named below, but their runtime *precedence* and per-value *behavior* are owned downstream by the Timer manager (mtng-dotnet-mono `Compose/MtngTools.Compose.TimerManager`), exactly as cue-firing and floor/cap resolution are.

| `load` | intent |
| :-- | :-- |
| `auto` | set-and-run this phase |
| `auto-paused` | set-and-**hold** this phase (loaded, but `running:false`) — so a driver that reports *which* phase we're on, but not whether to start the clock, can load what to show; a separate command starts it. A `remaining`-basis phase **runs anyway** (it can't be staged). |
| `clear` | clear the timer |
| `ignore` *(effective default when absent)* | do nothing |
| `next` | set-and-hold the *next* phase as a preview |

Absent ⇒ effective `ignore`. The full runtime precedence — `explicit > preset > host phaseLoading > ignore`, plus the `timerAutomation` master kill-switch — lives downstream and is deliberately **out of this data-only spec**; only the value set and the `ignore` default are fixed here. (`load` still participates in the data-side ladder below, at the `explicit`/`preset` rungs.)

## Agenda-display requirements

The data model exposes **both** concrete duration (`prPhases`) and resolved time-range (`prPhasesCalculated`) — which one(s) an agenda renders (duration-only, range-only, or both) is a **UI configuration concern**, not decided here.

- **Absent-phase rendering** (omit the row vs. show "none") is likewise UI-only — the data already answers "does this phase exist?" unambiguously via the `minutes` encoding above; no separate signal is needed.
- **No synthesized child entity needed.** Every phase-list-rendering need — label, duration/range, existence, order — comes entirely from the parent presentation's own fields (`prPhases`, `prPhasesCalculated`) plus, for cues/timer hints, the session (`ssPhaseDefaults`, below). An agenda never needs to fabricate a `PresentationBase`-shaped child per phase.

## Minutes or percent — the shared `TimingQuantity` encoding

Both cue thresholds and timer-hint values may be authored in **absolute minutes** or as a **percentage**, so a named set (below) can travel across presentations of different lengths. The unit is an explicit `'minutes' | 'percent'` discriminator — never inferred from sign or magnitude — and is **optional, defaulting to `'minutes'`** when absent (matching the sibling `whenUnits`/`atUnits`, so `'minutes'` never has to be written). It stays portable to C#/.NET (ADR-0005), with no new magic-number sentinels.

```ts
export type TimingUnit = 'minutes' | 'percent';
export type TimingQuantity = { unit?: TimingUnit; value: number }; // unit absent ⇒ 'minutes'; value may be negative where signed
```

**The percentage denominator is fixed by the field's role — never author-selected**, so there is no "percent of what" selector. Each field below states its own denominator; note in particular that a cue's basis (the phase *starting timer value*) deliberately differs from a floor/cap's (the phase *initial calculated minutes*).

**Unresolvable percentage → ignored.** Wherever a percentage's denominator resolves to 0 (a zero-calculated phase; a non-positive block), that percentage is dropped and a `resolverNotes` diagnostic recorded — an absolute value in the same position still applies. This one rule covers every percentage field; the per-field sections restate its local effect.

## Cue schedule

A **cue** is a signal fired at a threshold within a phase (e.g. a talk warns at 3 min remaining, then 0.5 min).

```ts
export type PresentationPhaseCue = {
  kind: string;              // 'warn' | 'warn2' | 'over' | 'over2' or any custom string — a consumer-facing
                              //   label only; plays no role in the timing calculation itself
  anchor?: 'start' | 'end';  // defaults 'end'
  at: number;                // signed threshold MAGNITUDE. anchor 'end': positive = before end, negative = after end.
                              //   anchor 'start': positive = after start, negative = before start.
  atUnits?: 'minutes' | 'percent'; // absent ⇒ 'minutes'; 'percent' reinterprets |at| (see below)
}
// on PresentationPhase:
cues?: PresentationPhaseCue[];
```

An array, not fixed named fields or a map — the domain is variable-count per phase (qa might have one warn and no second; talk might have several), and a "custom" cue is just another array entry with an arbitrary `kind`, not a structurally separate escape hatch. `kind` never affects the calculation, only how a consumer reacts to it (sound, color, etc.) — sign of `at` combined with `anchor` alone determines the firing point.

This does **not** reuse `minutes`' negative-as-auto-mode-sentinel convention — sign here means direction relative to `anchor`, not concrete-vs-auto-computed. No auto-mode need was found for cue thresholds.

**Percentage thresholds (`atUnits: 'percent'`).** `percent` reinterprets **only the magnitude** of `at` as a percentage of the phase's **starting timer value** — the minutes placed on the phase's timer *when the phase starts*, after any `remaining` basis-switch and any up-front `floor`/`cap` shaping. That value is **fixed at timer start** (a manual operator restart re-anchors it); live overage flex during the phase does not move it. `anchor` and sign stay load-bearing: `end` + `20%` (fires at 80% elapsed) ≠ `start` + `20%` (fires at 20% elapsed); a negative percent points to overtime (`end`) or pre-start (`start`). There is **no `[0,100]` clamp** — a percent may resolve outside the phase, exactly as a large absolute `at` can. *Example:* a `10%` end-anchored cue fires 2 min before end on a 20-min timer, 1.5 min before end on a 15-min timer.

This basis — the **phase starting timer value** — is deliberately **not** the `floor`/`cap` basis (*initial calculated minutes*, §[Timer hints](#timer-hints)). A cue is a signal *inside the real timeline*, so it measures against what the timer actually starts from; `floor`/`cap` *produce* the duration and so keep the stable, pre-hint basis.

**Zero starting value.** A percentage cue is **dropped** (never fires) + `resolverNotes`, **only** when the phase's starting timer value is 0 (a `no-time`/starved-`fill` phase with no `remaining` giving it a positive basis). Absolute cues are always retained. With a `remaining` hint the starting value is positive, so percentage cues resolve normally against it.

**Cues fire on a live predicate, not a precomputed instant.** A cue fires when the timer's live elapsed/remaining crosses the point its `at`/`atUnits`/`anchor` define against the *fixed* starting value — a condition evaluated continuously over timer state, **not** an absolute time computed once at start. So pausing the timer pauses cue evaluation automatically; an implementation MUST evaluate from live state and MUST NOT precompute fire instants. (The *denominator* is frozen at start; the *firing* is live — the two are different.) Pause/resume display is runtime UX — out of scope.

## Timer hints

Configuration for how a phase's *actual* duration should behave under overrun — a completely different, dynamically-computed quantity than the phase's planned `minutes`. **This decoupling is deliberate**: a `fill`-resolved 10-minute plan can run for any actual duration once timer hints apply; nothing connects the two except the runtime evaluating these hints.

**Timer hints are one-shot.** They are evaluated **once, at phase load**, to set the phase's *starting* timer value; they are **not** re-evaluated thereafter — a fixed clock runs from there. This is the counterpart to the cue rule and its deliberate mirror image: a **cue *fires* on a live predicate** (continuously), whereas a **hint *resolves* once** (at load). The runtime mechanics of that one-shot evaluation are the timer's, downstream.

```ts
export type PhaseTimerHintBase = {
  // Gating — an entry qualifies only when ALL present conditions hold (logical AND).
  whenUnits?: 'minutes' | 'percent'; // ONE unit for all when* below; absent ⇒ 'minutes'. 'percent' = of the BLOCK.
  whenOverBy?: number;      // cumulative pr overage (vs. scheduled prEnd) required to activate
  whenPrEarlyBy?: number;   // pr block started at least this much early
  whenPrLateBy?: number;    // pr block started at least this much late
}

export type PresentationPhaseTimerHint =
  | (PhaseTimerHintBase & { kind: 'remaining' })                 // switch basis: ignore this phase's planned
                                                                  //   `minutes`, use block-remaining instead
  | (PhaseTimerHintBase & { kind: 'floor' } & TimingQuantity)    // minimum duration — { unit, value }
  | (PhaseTimerHintBase & { kind: 'cap' } & TimingQuantity)      // maximum duration — { unit, value }
  | (PhaseTimerHintBase & { kind: 'protectQA' })                 // TALK-ONLY (ignored on intro/qa): a valueless flag
                                                                  //   cap-producer — caps talk at its own calculated
                                                                  //   minutes so it can't borrow qa's time
  | (PhaseTimerHintBase & { kind: string; [key: string]: unknown }); // custom/extensible
// on PresentationPhase:
timerHints?: PresentationPhaseTimerHint[];
```

**Percentage values & thresholds.** `floor`/`cap` carry a minutes-or-percent amount via `TimingQuantity` (`{ unit, value }`); a `percent` floor/cap is of the phase's **initial calculated minutes** (`PresentationCalculatedPhase.minutes`) — the stable, pre-hint duration, **not** the live `remaining` basis and **not** a cue's *starting timer value*. The three `when*` thresholds share one per-entry `whenUnits`; a `percent` there is of the **presentation block** (`prEnd − prStart`). (Units can't be mixed across the three `when*` — never a real need, since all three are block-relative.)

**Zero-calculated phase.** When a phase's initial calculated minutes is 0 (a `no-time` phase, or a `fill` starved to 0), a percentage has no denominator: a **percentage** `floor`/`cap` is ignored (floor → 0, cap → ∞) + `resolverNotes`, while an **absolute** `floor`/`cap` still applies and a `remaining` entry still switches the basis. Invariant: **no timer hint lifts a 0-calculated phase off 0 via floor/cap** — only `remaining` can give it a live basis. (The same "unresolvable % → ignored" rule covers the pre-existing `block ≤ 0` case for `when*` gating.)

**Terms.** *block-remaining* = the time left before `prEnd` at the moment the timer evaluates the phase. *basis* = the phase's target duration. Both *block-remaining* and the gating inputs (cumulative overage vs. `prEnd`; actual vs. scheduled `prStart`) are **live signals a timer computes at runtime** — not fields this model stores anywhere. This spec fixes how the array is *read* into a single number; *when* that read happens each tick, and how the timer then spends the result (rendering, overrun display), is the timer's concern.

**Composition — reading the array into one effective allocation.** For a phase, the array resolves to a single **effective allocation** (its time budget):

```
basis        = own calculated minutes,  OR block-remaining (if any qualifying 'remaining' entry is present)
activeFloor  = the last qualifying `floor` entry in array order, else 0
activeCap    = the last qualifying cap-producer in array order, else ∞
                 (a cap-producer is a `cap` entry → its resolved minutes,
                  or a `protectQA` entry [talk only] → talk's own calculated minutes)

effective allocation = clamp(basis, activeFloor, activeCap)
  // a `floor`/`cap` value is first resolved to minutes: absolute as-is, or a percentage of the
  // phase's initial calculated minutes (a 0-calc phase drops the percentage — see below). This
  // resolution is the timer's, at runtime; the resolved tiers keep the values symbolic.
```

Rules that make this deterministic:
- **Qualifying = all `when*` conditions on the entry are currently met** (AND). An entry with no `when*` is always qualifying (the base case).
- **Last qualifying entry in array order wins, per bound.** The author controls precedence by ordering — put the intended winner last. (For a pure threshold chain this reads as ascending threshold; for mixed axes, e.g. an overage floor vs. a "not their fault" late-start floor, ordering is how you say which takes precedence.)
- **`floor` and `cap` are independent bounds** — a `floor` entry and a `cap`/`protectQA` entry never compete with each other, only with same-bound entries.
- **floor wins on conflict:** if `activeFloor > activeCap`, the floor applies (a minimum is a promise; the phase overflows rather than violate it).
- **`protectQA` on intro/qa is ignored** (its meaning — "don't borrow qa's time" — is only defined for talk).

**Authoring convention (not a resolver rule):** `qa` almost always runs on leftover time, so an authoring tool should seed its `timerHints` with `{ kind: 'remaining' }` as the first entry — the organizer needn't set it. This is a *recommended default the authoring layer pre-fills*, deliberately **not** a resolver special-case: the resolver treats every phase identically (basis = calculated minutes unless a `remaining` entry is present), so the basis stays visible in the data rather than becoming "qa is special" tribal knowledge. That's why the example below leads with `remaining`.

**Inline example — a `qa` phase:**
```ts
timerHints: [
  { kind: 'remaining' },                                             // basis = block-remaining, not the planned minutes
  { kind: 'floor', unit: 'minutes', value: 3 },                      // base floor
  { kind: 'floor', unit: 'minutes', value: 1, whenOverBy: 10 },      // squeeze to 1 once 10+ min over…
  { kind: 'floor', unit: 'minutes', value: 3, whenOverBy: 10, whenPrLateBy: 10 }, // …unless also 10+ late — keep 3
]
```
At 12 min over and on time: qualifying floors are the base (3) and `whenOverBy:10` (1); last wins → floor 1. At 12 over **and** 10 late: the third entry also qualifies (both conditions met) and is last → floor 3. `qa`'s allocation is then `clamp(block-remaining, floor, ∞)`.

See [cue-hint-scenarios.md](cue-hint-scenarios.md) for the `talk` example (`protectQA`) and the reasoning behind rejected alternatives (a `'protected'` kind; the earlier `protectNextFloor`, which only reserved qa's *floor*; a manually-set `cap` on talk).

## Session-level defaults

Meeting organizers often want the same cue/hint policy across most presentations in a session, with room to override per presentation.

```ts
// NARROW by design — a cue/hint policy only. NOT PresentationPhaseBase: no label, no load (see the ladder).
export type SessionPhaseDefault = {
  cues?: PresentationPhaseCue[];        // inline default…
  timerHints?: PresentationPhaseTimerHint[];
} & HasTimerCueHintRefs;                // …or a named-set reference (cuesRef/timerHintsRef) — inline wins if both
export type SessionPhaseDefaults = { intro?: SessionPhaseDefault; talk?: SessionPhaseDefault; qa?: SessionPhaseDefault };
// on SessionBase:
ssPhaseDefaults?: SessionPhaseDefaults;
```

**A session default supplies `cues`/`timerHints` only — deliberately not `label`/`load`.** It's a session-wide *cue/hint policy*; a session-wide `label` default is unnecessary (the built-in phase name covers it), and a session-wide `load` default is the room's job (host `phaseLoading`, downstream), not authored as meeting data. So in the ladder below, `label`/`load` have no session-default rung.

A session default's `cues`/`timerHints` is itself an inline-array-or-named-ref source, exactly like a presentation phase's. How it composes with the presentation's own value, a **preset** (below), and the named-set defaults is the **per-(phase, prop) precedence ladder** (below): props merge *across* a phase, but within any one prop a more-specific source replaces a less-specific one *entirely* (even an explicit `[]`) — arrays never merge or concatenate.

## Named, reusable sets

Authoring a full inline `cues`/`timerHints` array on every phase of every presentation is too heavy for existing presentation-management software. **Named sets** let a meeting define a small library of reusable cue/hint arrays once, and every phase pick one by a single string key (a text field / dropdown at data-entry). Combined with percentages (above), one named set can cover presentations of any length.

```ts
export type NamedSets<T> = {
  sets: Record<string, T[]>;   // key → a set (one phase's array)
  default?: string;            // names a key in `sets`; absent = no default
};
export type PhaseNamedSets<T> = { intro?: NamedSets<T>; talk?: NamedSets<T>; qa?: NamedSets<T> };

// libraries — on Meeting (the primary store) and Session (optional, shadows the meeting):
mtCueSets?: PhaseNamedSets<PresentationPhaseCue>;   mtHintSets?: PhaseNamedSets<PresentationPhaseTimerHint>;
ssCueSets?: PhaseNamedSets<PresentationPhaseCue>;   ssHintSets?: PhaseNamedSets<PresentationPhaseTimerHint>;

// reference — on PresentationPhase and SessionPhaseDefault:
cuesRef?: string;   timerHintsRef?: string;
```

- **Six namespaces**, `{intro,talk,qa} × {cue,hint}`, each an independent `NamedSets` with its own keys and its own optional `default`. Keys are scoped per namespace (`"standard"` in talk-hints is unrelated to `"standard"` in qa-hints). Splitting per phase lets each namespace carry a default tuned to its own spread — intro/cue sets are often a single shared default, while talk/qa hint sets need many variants.
- **The default is a namespace-level string, not a per-set flag** — the library is an unordered keyed map (C# `Dictionary`; ADR-0005), which has no portable tiebreak for two flagged sets, so a single `default` string names the winner unambiguously and keeps each set a bare array.
- **Two levels.** The **meeting** library (`mt*Sets`) is the expected primary store — most meetings populate it alone. A **session** library (`ss*Sets`) is optional: it adds new keys or shadows meeting keys of the same name. **Ref lookup resolves the session library first, then the meeting library.**

## Phase presets

Where a named set is *targeted* reuse (one phase's cue **or** hint array), a **preset** is *coarse* reuse — a **"quick copy of everything"**: one named object supplying **all three phases' behavior/display props at once** (`label`/`load`/`cues`/`timerHints`), for speaker-management systems that can set only a single field. A presentation opts in with one string:

```ts
prPhasesPreset?: string;   // on PresentationBase — names a preset in the libraries below

export type PresentationPhasesPreset = { intro?: PresentationPhaseBase; talk?: PresentationPhaseBase; qa?: PresentationPhaseBase };
export type PhasePresetLibrary = Record<string, PresentationPhasesPreset>;   // flat: preset-name → whole-presentation preset

// libraries — Meeting (primary) + Session (shadows), beside mt/ssCueSets etc.:
mtPhasePresets?: PhasePresetLibrary;   ssPhasePresets?: PhasePresetLibrary;
```

- **Behavior/display only.** A preset body **is** `PresentationPhaseBase` — so **no `minutes`** (durations stay schedule-driven: `prStart`/`prEnd` + `prPhases.minutes`/`fill`) and **no `*Ref`** (bodies are terminal/concrete). A preset never changes how long a phase is.
- **Flat library — no per-phase namespace, no `default`.** Unlike `NamedSets` (per-phase namespaces, each with a `default`), a preset already spans all three phases, so its library is a flat `name → preset` map, and it has **no `default`**: a preset applies only when a presentation *names* it in `prPhasesPreset`.
- **Two levels, session shadows meeting.** `prPhasesPreset` resolves in the **session** library then the **meeting** library; a session preset shadows a meeting preset of the same key. A **dangling key** (in neither) resolves as if `prPhasesPreset` were unset (+`resolverNotes`), never throws.
- **Complements per-phase refs.** `cuesRef`/`timerHintsRef` are targeted, per-(phase, payload) reuse; a preset is the "set everything" affordance. Both feed the ladder below — the preset as its own rung.

**A preset resolves at the `Resolved` tier only**, alongside `cuesRef`/`timerHintsRef` deref, at the same in-room step (a preset library may live as session-room config). It **never** participates in the duration `Calculated` tier — presets carry no `minutes`. (See §[`ResolvedPresentationTiming`](#resolvedpresentationtiming) and the two-tier note there.)

## Composing sources — the per-(phase, prop) precedence ladder

For each phase, the effective config is assembled **per prop** over `{label, cues, timerHints, load}`. Props are sourced **independently and merge *across* the phase**; within any single prop the winning value is used **whole** (arrays never element-merge or concatenate; an explicit `[]` counts as *present* and overrides). *Example:* a preset supplies `intro`'s `label`/`load`/`cues`/`timerHints`, and an explicit `prPhases.intro = { cues: [...] }` overrides **only** `intro`'s cues — its other three props still come from the preset.

The rungs — **first present wins, per prop** (the **preset** is the new rung 2):

| # | Rung | `cues` / `timerHints` | `label` | `load` |
| :- | :- | :- | :- | :- |
| 1 | explicit | `prPhases.<phase>.{cues\|cuesRef}` (resp. `timerHints`) | `prPhases.<phase>.label` | `prPhases.<phase>.load` |
| 2 | **preset** | `‹preset›.<phase>.{cues\|timerHints}` | `‹preset›.<phase>.label` | `‹preset›.<phase>.load` |
| 3 | session default | `ssPhaseDefaults.<phase>.{cues\|cuesRef}` (resp. `timerHints`) | — | — |
| 4 | library default | `ssCueSets`/`HintSets.<phase>.default` else `mt*` | — | — |
| 5 | none | phase has no cues/hints | built-in phase name (UI) | effective `ignore` |

- **`label`/`load` have no session-default or library-default rung.** `SessionPhaseDefault` is a cue/hint policy only (see §[Session-level defaults](#session-level-defaults)); `label` falls back to the built-in phase name, and `load`'s session-wide defaulting is the room's job (host `phaseLoading`, **downstream**). So those two props resolve `explicit → preset → fallback`.
- **Inline vs ref at one rung** (rungs 1 & 3, `cues`/`timerHints` only) is a discriminated pair — *either* the inline array *or* the `*Ref`, never both; if both are somehow set, the **inline array wins** + `resolverNotes`.
- **Ref & preset-key resolution** — any `*Ref`, the rung-4 `default` key, and the `prPhasesPreset` key all resolve in the **session** library then the **meeting** library; the session shadows the meeting for the same key.
- **Dangling / absent falls through.** A `*Ref` (or a `default`, or the `prPhasesPreset` key) whose key is in neither library — **or** a rung that simply doesn't speak to a prop (e.g. the preset exists but has no `intro.cues`) — contributes nothing for that prop and resolution **falls through to the next rung** (+`resolverNotes` on a genuine dangling ref). It never blanks the prop and never throws (the resolver is total — see §[Reconciliation & the resolver](#reconciliation--the-resolver)).
- **Percentages stay symbolic here.** This selection *carries/derefs* the chosen array verbatim; any minutes-or-percent values are resolved to concrete minutes **by the timer at runtime** — their denominators (a floor/cap's calculated minutes; a cue's live starting value) mature only at/after phase start — never baked into the resolved data.

## `ResolvedPresentationTiming`

The **simple-fallback tier** — distinct from the complex duration resolver above, this is an ordinary instance of the Resolved Types Pattern (§3): it runs the **per-(phase, prop) ladder** (above) to fill each phase's effective `label`/`load`/`cues`/`timerHints`, paired with the phase's computed timing. It carries **no `*Ref`** — refs (and any `prPhasesPreset`) are resolved away here.

```ts
export type ResolvedPresentationPhase = PresentationPhaseBase & PhaseCalculatedTiming; // base props hold effective (deref'd) values; NO *Ref
export type ResolvedPresentationPhases = { intro?: ResolvedPresentationPhase; talk?: ResolvedPresentationPhase; qa?: ResolvedPresentationPhase };
export type ResolvedPresentationTiming = { phases: ResolvedPresentationPhases; fit: PhaseFit; resolverNotes: string[] };
```

This tier **selects and derefs** sources; it does not evaluate percentages or compute the effective allocation. The chosen `cues`/`timerHints` are carried verbatim, with any `TimingQuantity`/`atUnits` still symbolic for the timer to resolve at runtime; `label`/`load` hold the ladder's effective values. `fit` and `resolverNotes` pass straight through from the `PresentationCalculatedTiming` this tier wraps; the ladder adds only its own dangling-ref / literal-wins diagnostics.

Callers supply the presentation's `prPhasesCalculated`, its `prPhasesPreset` + the `mt/ssPhasePresets` libraries, the session's `ssPhaseDefaults`/`ss*Sets`, and the meeting's `mt*Sets`; the merge/lookup function itself is left to the caller — out of this spec's scope, same as the rest of timer runtime behavior.

### Calculated vs Resolved — why two tiers

The split is deliberate. **Duration calc** depends only on the presentation's own data (`prPhases` + the block), so it is upstream-computable and cached in `prPhasesCalculated`. **Cue/hint ref *and* preset deref**, by contrast, needs the named-set / preset **library** — which is deliberately allowed to live as **session-room config**, making it an *in-room* step. Collapsing the two tiers would force the whole array/preset library to travel with upstream presentation data and defeat the single-string affordance (`cuesRef`/`timerHintsRef`/`prPhasesPreset`) the model is built around. Hence `Calculated` = durations (plus the phase's own cue/hint sources carried forward, unresolved); `Resolved` = ladder + deref, in-room. **Presets and refs touch only the `Resolved` tier — never durations.**

## What this spec doesn't cover

- **Timer runtime behavior/UX** — how cues render (chimes, colors, sounds), the countdown display, live overrun-handling, runtime per-phase overrides, and the actual squeeze/merge algorithms that interpret `timerHints`/`ResolvedPresentationTiming` during a live session.
- **`load` runtime resolution** — the full precedence (`explicit > preset > host `phaseLoading` > ignore`), the `timerAutomation` kill-switch, the per-value behavior (including `auto-paused`'s hold and its `remaining`-basis exception), and the room-level `phaseLoading` config all live **downstream** (mtng-dotnet-mono `Compose/MtngTools.Compose.TimerManager`). This spec fixes only the value set and the `ignore` default.
- **Per-phase performer attribution** — phases carry timing/label/cue/hint data only; `ssModerators`/`prModerators` already exist at the session/presentation level.
- **Agenda UI implementation** and **speaker-timer implementation**.
