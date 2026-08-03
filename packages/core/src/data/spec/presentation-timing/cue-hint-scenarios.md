# Presentation Timing — Validated Scenarios

Companion to [README.md](README.md), which has the type definitions and full model — this doc doesn't repeat those. It captures the concrete scenarios that drove the `timerHints`/cue design, and *why* rejected alternatives were rejected, so a future agent extending this model doesn't have to re-derive reasoning that's already settled.

> **Encoding note (post-#37):** the examples below use the original `{ minutes: N }` value shape and pre-date the reusability revision (map #45). Timer-hint `floor`/`cap` values are now the minutes-*or*-percent `TimingQuantity` (`{ unit, value }`), `when*` gained a shared `whenUnits`, cues gained `atUnits`, and cue/hint sets can be **named and referenced** — see [README.md](README.md). The *reasoning* captured here (gating, floor/cap, `remaining`, `protectQA`, array-order combination) is unchanged; only the literal encoding evolved.

## Why `timerHints` looks the way it does

### talk: `protectQA`, and the three designs before it

Organizer intent: by default talk may run long and eat into qa; sometimes the organizer wants the opposite — talk stays in its own lane so qa is protected.

Four designs, in order — the first three were rejected, and *why* is the useful part:

1. `{ kind: 'cap', minutes: 15, whenOverBy: 15 }` — a **manually-set cap**. Rejected: it forces the organizer to hand-pick a number that's really an approximation of "whatever qa needs by then," duplicating a computation the system already has the data to do.
2. A `'protected'` kind. **Rejected as redundant** — "no `'remaining'` entry present" already means "use calculated duration," so an explicit protected flag says nothing new.
3. `{ kind: 'protectNextFloor' }` — cap talk at `blockRemaining − qa's active floor`, letting talk eat qa *down to qa's floor*. **Superseded** once the intent was stated more precisely: the organizer didn't want talk to eat qa's time *down to a floor* — they wanted talk to **not borrow qa's time at all**.
4. Landed on: **`{ kind: 'protectQA' }`** — a valueless flag that caps talk at **its own calculated minutes**, so it can't borrow qa's time, period. Talk-only (ignored on intro/qa). Default (no hint) is still "talk may overrun into qa"; this is the opt-in guardrail.

The step from #3 to #4 is the one to remember: `protectNextFloor` protected qa's *floor*, `protectQA` protects *all* of qa's scheduled time. The name changed with the meaning.

### qa: the floor chain that forced the combination rule

Concrete organizer intent, near-verbatim: *"qa gets time until the scheduled end by default, at least 3 minutes — unless over by 10, then 1 minute — unless it's also not their fault (10+ late), then keep 3."*

```ts
timerHints: [
  { kind: 'remaining' },                                                       // basis = block-remaining, not planned minutes
  { kind: 'floor', unit: 'minutes', value: 3 },                                // base floor
  { kind: 'floor', unit: 'minutes', value: 1, whenOverBy: 10 },                // squeeze to 1 once 10+ over…
  { kind: 'floor', unit: 'minutes', value: 3, whenOverBy: 10, whenPrLateBy: 10 },// …unless also 10+ late — keep 3
]
```

Three things this scenario forced into the design:

1. **`when*` conditions on one entry are ANDed.** The fourth entry qualifies only when the phase is *both* 10+ over *and* 10+ late — that's how "over, but not their fault" is expressed as a single row.
2. **The combination rule is "last qualifying entry in array order wins," not "highest threshold wins."** This example is exactly why: at "12 over and 10 late," the `whenOverBy:10`→1 entry and the `whenOverBy:10 whenPrLateBy:10`→3 entry both qualify, but they gate on **different axes** — there's no meaningful "higher threshold" between an overage and a late-start. Array order resolves it deterministically, and hands the author the lever: put the intended winner last. (A plain threshold chain still reads naturally — just order it ascending.)
3. **`'remaining'` has to be explicit.** The danger it guards against: someone reads `{ kind: 'floor', minutes: 3 }` on a phase whose agenda shows "10 min" and assumes the floor is relative to that planned 10. It isn't — it's relative to *actual time left*. `'remaining'` makes that basis-switch a discoverable opt-in in the data, not tribal knowledge.

`whenPrEarlyBy`/`whenPrLateBy` (pr-block start offset) are a second gating axis alongside `whenOverBy`, combinable on one entry (as above) — a `{ kind: 'cap', minutes: 10, whenPrEarlyBy: 5 }` would keep qa from ballooning when the block started early.

## Why cues are an array, not fixed named fields

Real need that ruled out `warn1`/`warn2`/`over1`/`over2` fixed fields: *"a talk warns at 3 min remaining, then 0.5 min; Q&A warns at 1 min with no second warning."* Variable count per phase, and no natural cap on how many warnings a phase might want — an array lets a "custom" cue be just another entry with a different `kind`, instead of a structurally separate escape hatch bolted onto four fixed slots.

## What `resolverNotes` almost was

Early drafts named this field `warnings`. That invited exactly the confusion it now avoids: `warnings` reads as if it might *be* the cue schedule (`warn`/`warn2` kinds), when it's actually the resolver's own data-quality diagnostics (e.g. "≥2 `fill` detected, normalized") — a completely unrelated concept. Renamed specifically to kill that ambiguity at the name level rather than relying on a comment to disambiguate it.
