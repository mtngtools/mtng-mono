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

## Cue schedule

A **cue** is a signal fired at a threshold within a phase (e.g. a talk warns at 3 min remaining, then 0.5 min).

```ts
export type PresentationPhaseCue = {
  kind: string;              // 'warn' | 'warn2' | 'over' | 'over2' or any custom string — a consumer-facing
                              //   label only; plays no role in the timing calculation itself
  anchor?: 'start' | 'end';  // defaults 'end'
  at: number;                // signed threshold. anchor 'end': positive = before end, negative = after end.
                              //   anchor 'start': positive = after start, negative = before start.
}
// on PresentationPhase:
cues?: PresentationPhaseCue[];
```

An array, not fixed named fields or a map — the domain is variable-count per phase (qa might have one warn and no second; talk might have several), and a "custom" cue is just another array entry with an arbitrary `kind`, not a structurally separate escape hatch. `kind` never affects the calculation, only how a consumer reacts to it (sound, color, etc.) — sign of `at` combined with `anchor` alone determines the firing point.

This does **not** reuse `minutes`' negative-as-auto-mode-sentinel convention — sign here means direction relative to `anchor`, not concrete-vs-auto-computed. No auto-mode need was found for cue thresholds.

## Timer hints

Configuration for how a phase's *actual* duration should behave under overrun — a completely different, dynamically-computed quantity than the phase's planned `minutes`. **This decoupling is deliberate**: a `fill`-resolved 10-minute plan can run for any actual duration once timer hints apply; nothing connects the two except the runtime evaluating these hints.

```ts
export type PhaseTimerHintBase = {
  // Gating — an entry qualifies only when ALL present conditions hold (logical AND).
  whenOverBy?: number;      // cumulative pr overage (minutes, vs. scheduled prEnd) required to activate
  whenPrEarlyBy?: number;   // pr block started at least this many minutes early
  whenPrLateBy?: number;    // pr block started at least this many minutes late
}

export type PresentationPhaseTimerHint =
  | (PhaseTimerHintBase & { kind: 'remaining' })              // switch basis: ignore this phase's planned
                                                                //   `minutes`, use block-remaining instead
  | (PhaseTimerHintBase & { kind: 'floor'; minutes: number })   // minimum duration
  | (PhaseTimerHintBase & { kind: 'cap'; minutes: number })     // maximum duration
  | (PhaseTimerHintBase & { kind: 'protectQA' })                // TALK-ONLY (ignored on intro/qa): a valueless flag
                                                                //   cap-producer — caps talk at its own calculated
                                                                //   minutes so it can't borrow qa's time
  | (PhaseTimerHintBase & { kind: string; [key: string]: unknown }); // custom/extensible
// on PresentationPhase:
timerHints?: PresentationPhaseTimerHint[];
```

**Terms.** *block-remaining* = the time left before `prEnd` at the moment the timer evaluates the phase. *basis* = the phase's target duration. Both *block-remaining* and the gating inputs (cumulative overage vs. `prEnd`; actual vs. scheduled `prStart`) are **live signals a timer computes at runtime** — not fields this model stores anywhere. This spec fixes how the array is *read* into a single number; *when* that read happens each tick, and how the timer then spends the result (rendering, overrun display), is the timer's concern.

**Composition — reading the array into one effective allocation.** For a phase, the array resolves to a single **effective allocation** (its time budget):

```
basis        = own calculated minutes,  OR block-remaining (if any qualifying 'remaining' entry is present)
activeFloor  = the last qualifying `floor` entry in array order, else 0
activeCap    = the last qualifying cap-producer in array order, else ∞
                 (a cap-producer is a `cap` entry → its minutes,
                  or a `protectQA` entry [talk only] → talk's own calculated minutes)

effective allocation = clamp(basis, activeFloor, activeCap)
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
  { kind: 'remaining' },                                  // basis = block-remaining, not the planned minutes
  { kind: 'floor', minutes: 3 },                          // base floor
  { kind: 'floor', minutes: 1, whenOverBy: 10 },          // squeeze to 1 once 10+ min over…
  { kind: 'floor', minutes: 3, whenOverBy: 10, whenPrLateBy: 10 }, // …unless also 10+ late — not their fault, keep 3
]
```
At 12 min over and on time: qualifying floors are the base (3) and `whenOverBy:10` (1); last wins → floor 1. At 12 over **and** 10 late: the third entry also qualifies (both conditions met) and is last → floor 3. `qa`'s allocation is then `clamp(block-remaining, floor, ∞)`.

See [cue-hint-scenarios.md](cue-hint-scenarios.md) for the `talk` example (`protectQA`) and the reasoning behind rejected alternatives (a `'protected'` kind; the earlier `protectNextFloor`, which only reserved qa's *floor*; a manually-set `cap` on talk).

## Session-level defaults

Meeting organizers often want the same cue/hint policy across most presentations in a session, with room to override per presentation.

```ts
export type SessionPhaseDefault = {
  cues?: PresentationPhaseCue[];
  timerHints?: PresentationPhaseTimerHint[];
}
export type SessionPhaseDefaults = { intro?: SessionPhaseDefault; talk?: SessionPhaseDefault; qa?: SessionPhaseDefault };
// on SessionBase:
ssPhaseDefaults?: SessionPhaseDefaults;
```

**Whole-field override, no merging**: a presentation's own `cues`/`timerHints` for a phase, if set (even to `[]`), is used entirely in place of the session default for that phase — no per-item matching or merge logic.

## `ResolvedPresentationTiming`

The **simple-fallback tier** — distinct from the complex resolver above, this is an ordinary instance of the Resolved Types Pattern (§3): merge `SessionPhaseDefaults` into a presentation's `PresentationCalculatedTiming` for `cues`/`timerHints` left unset at the presentation level.

```ts
export type ResolvedPresentationPhase = PresentationCalculatedPhase & {
  cues?: PresentationPhaseCue[];             // from prPhases.<phase>.cues, else ssPhaseDefaults.<phase>.cues
  timerHints?: PresentationPhaseTimerHint[]; // from prPhases.<phase>.timerHints, else ssPhaseDefaults.<phase>.timerHints
}
export type ResolvedPresentationPhases = { intro?: ResolvedPresentationPhase; talk?: ResolvedPresentationPhase; qa?: ResolvedPresentationPhase };
export type ResolvedPresentationTiming = { phases: ResolvedPresentationPhases; fit: PhaseFit; resolverNotes: string[] };
```

`fit` and `resolverNotes` are carried straight through from the `PresentationCalculatedTiming` this tier wraps — the session-default merge adds no diagnostics of its own.

Callers supply both the presentation's `prPhasesCalculated` and the session's `ssPhaseDefaults`; the merge/lookup function itself is left to the caller — out of this spec's scope, same as the rest of timer runtime behavior.

## What this spec doesn't cover

- **Timer runtime behavior/UX** — how cues render (chimes, colors, sounds), the countdown display, live overrun-handling, runtime per-phase overrides, and the actual squeeze/merge algorithms that interpret `timerHints`/`ResolvedPresentationTiming` during a live session.
- **Per-phase performer attribution** — phases carry timing/label/cue/hint data only; `ssModerators`/`prModerators` already exist at the session/presentation level.
- **Agenda UI implementation** and **speaker-timer implementation**.
