# Presentation Timing

Per-phase timing **configuration data** for a presentation — durations, an agenda-display contract, an in-phase cue schedule, and timer hints — sufficient to drive a per-part countdown timer later. Types live in [`core/src/data/meeting.ts`](../../meeting.ts). Field-naming/type-hierarchy conventions (prefixes, Base/Resolved/Calculated patterns) are covered generically in [the parent spec README](../README.md); this doc only covers what's specific to presentation timing.

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

### `PresentationPhase` (raw)

```ts
export type PresentationPhase = {
  minutes?: number;   // see value semantics below
  label?: string;      // overrides the default agenda label (Introduction / Talk / Questions)
  cues?: PresentationPhaseCue[];
  timerHints?: PresentationPhaseTimerHint[];
}
export type PresentationPhases = { intro?: PresentationPhase; talk?: PresentationPhase; qa?: PresentationPhase };
```

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
export type PresentationCalculatedPhase = {
  minutes: number;     // resolved concrete duration; 0 for no-time or a starved fill
  start: UnixTimestampMs;
  end: UnixTimestampMs; // start === end for a zero-length phase
  source: 'concrete' | 'fill' | 'no-time' | 'normalized-fill' | 'normalized-no-time'; // `normalized-*` = result of the ≥2-fill priority fallback above
}
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
export type SessionPhaseDefault = {
  cues?: PresentationPhaseCue[];        // inline default…
  cuesRef?: string;                     // …or a named-set reference (below) — mutually exclusive (literal wins if both)
  timerHints?: PresentationPhaseTimerHint[];
  timerHintsRef?: string;
}
export type SessionPhaseDefaults = { intro?: SessionPhaseDefault; talk?: SessionPhaseDefault; qa?: SessionPhaseDefault };
// on SessionBase:
ssPhaseDefaults?: SessionPhaseDefaults;
```

A session default is itself an inline-array-or-named-ref source, exactly like a presentation phase. How it combines with a presentation's own value and with the named-set defaults is the **precedence ladder** (below) — which generalizes the original **whole-field override, no merging** rule: a more-specific source replaces a less-specific one *entirely* (even an explicit `[]`), and arrays never merge or concatenate.

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

## Composing sources — the precedence ladder

For a phase, per payload (`cues` / `timerHints`), several sources can supply a value. They compose by **whole-field override**: the effective array is the **first present** rung of a specificity ladder, used **entirely** — lower rungs are discarded; nothing merges or concatenates.

| # | Rung | Source (shown for `cues`; `timerHints` is identical) |
| :- | :- | :- |
| 1 | presentation | `prPhases.<phase>.cues` **or** `.cuesRef` |
| 2 | session default | `ssPhaseDefaults.<phase>.cues` **or** `.cuesRef` |
| 3 | library default | `ssCueSets.<phase>.default` else `mtCueSets.<phase>.default` |
| 4 | — | none (phase has no cues) |

- **Inline vs ref at one level is a discriminated union** — a level supplies *either* an inline array *or* a ref, never both. It's dual-encoded as two optional wire fields (like `minutes`); if both are somehow set, the **inline array wins** + `resolverNotes`.
- **Ref resolution** (any rung's ref, and the rung-3 default key): look the key up in the **session** library, then the **meeting** library; the session shadows the meeting for the same key.
- **Dangling ref** — a `*Ref` (or a `default`) whose key is in neither library is treated as if that rung specified nothing: resolution **falls through to the next rung** + `resolverNotes`. It never blanks the phase and never throws (the resolver is total — see §[Reconciliation & the resolver](#reconciliation--the-resolver)).
- **Percentages stay symbolic here.** This selection carries the chosen array *verbatim*; any minutes-or-percent values are resolved to concrete minutes **by the timer at runtime** — their denominators (a floor/cap's calculated minutes; a cue's live starting value) mature only at/after phase start — never baked into the resolved data.

## `ResolvedPresentationTiming`

The **simple-fallback tier** — distinct from the complex resolver above, this is an ordinary instance of the Resolved Types Pattern (§3): it applies the **precedence ladder** (above) to fill each phase's effective `cues`/`timerHints`, wrapping a presentation's `PresentationCalculatedTiming`.

```ts
export type ResolvedPresentationPhase = PresentationCalculatedPhase & {
  cues?: PresentationPhaseCue[];             // effective per the precedence ladder (percentages kept symbolic)
  timerHints?: PresentationPhaseTimerHint[]; // effective per the precedence ladder
}
export type ResolvedPresentationPhases = { intro?: ResolvedPresentationPhase; talk?: ResolvedPresentationPhase; qa?: ResolvedPresentationPhase };
export type ResolvedPresentationTiming = { phases: ResolvedPresentationPhases; fit: PhaseFit; resolverNotes: string[] };
```

This tier **selects** arrays; it does not evaluate percentages or compute the effective allocation. The chosen `cues`/`timerHints` are carried verbatim, with any `TimingQuantity`/`atUnits` still symbolic, for the timer to resolve at runtime. `fit` and `resolverNotes` pass straight through from the `PresentationCalculatedTiming` this tier wraps; the ladder adds only its own dangling-ref / literal-wins diagnostics.

Callers supply the presentation's `prPhasesCalculated`, the session's `ssPhaseDefaults`/`ss*Sets`, and the meeting's `mt*Sets`; the merge/lookup function itself is left to the caller — out of this spec's scope, same as the rest of timer runtime behavior.

## What this spec doesn't cover

- **Timer runtime behavior/UX** — how cues render (chimes, colors, sounds), the countdown display, live overrun-handling, runtime per-phase overrides, and the actual squeeze/merge algorithms that interpret `timerHints`/`ResolvedPresentationTiming` during a live session.
- **Per-phase performer attribution** — phases carry timing/label/cue/hint data only; `ssModerators`/`prModerators` already exist at the session/presentation level.
- **Agenda UI implementation** and **speaker-timer implementation**.
