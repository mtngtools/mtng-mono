# `minutes` Scenario Catalog

Companion to [README.md](README.md) — every combination of `{absent, concrete, fill, no-time}` across `intro`/`talk`/`qa` (4³ = 64), grouped by which phases exist. This is the enumeration `resolve()` (README.md's reconciliation section) was designed and validated against; kept here as a reference for anyone extending the resolver or auditing an edge case, so it doesn't need re-deriving.

Raw values use the tokens from README.md's `minutes` value-semantics table: `0` absent (phase doesn't exist in this group) · `+` concrete · `−1` fill · `−2` no-time.

> **Unaffected by presets / `load` (#54/#55):** durations are computed from `minutes` + the block alone. A **preset** carries no `minutes`, and **`load`** is behavior, not time — both resolve at the *Resolved* tier, downstream of this *Calculated* enumeration. So this 64-row catalog stands exactly as-is; the preset-merge and per-(phase, prop) scenarios live in [cue-hint-scenarios.md](cue-hint-scenarios.md) instead.

**Status:** ✓ likely & valid · ~ valid but unlikely · ✗ invalid (`≥2 fill`; resolver normalizes by priority `talk > qa > intro`, see README.md).

**Rec:** `Auto` / `Fixed` = recommended for that authoring mode (README.md's authoring-modes guidance) · `*` = only when displaying an explicit intro time actually matters (a concrete intro is otherwise atypical) · `—` = not specifically recommended for either mode.

**Note codes:**
| Code | Meaning |
|---|---|
| `E` | Fully explicit — every present phase is concrete or no-time; sums against the block normally. |
| `F-talk` / `F-qa` | That phase's `fill` absorbs the remainder. |
| `AGENDA` | Every present phase is `no-time` — agenda-only, deliberate non-timed use. |
| `TALK-NOTIME` | Talk itself is `no-time` — unusual, since talk usually carries the real content; probably want talk concrete (Auto) or fill (Fixed) instead. |
| `INTRO-FILL` | Intro absorbs the slot — unusual; probably want fill on talk/qa instead, intro `no-time`. |
| `INTRO-FILL+TALK-NOTIME` | Both of the above at once. |
| `CONCRETE-INTRO` | Suffix — appears alongside `E`/`F-talk`/`F-qa` when intro is concrete (atypical, see `Rec` `*`). |
| `INVALID (...)` | `≥2 fill`; parenthetical states the resolver's actual fallback for this row. |
| `NONE` | No phases at all — timer uses the block directly. |
<!-- rows below generated from the original scenario-catalog artifact (ticket #40); regenerate by re-deriving from meeting.ts's resolver rules if this ever drifts -->

### Intro + Talk + Q&A (27)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| ITQ-01 | −2 | + | + | ✓ | Auto | E |
| ITQ-02 | −2 | + | −1 | ✓ | Fixed | F-qa |
| ITQ-03 | −2 | + | −2 | ✓ | Auto | E |
| ITQ-04 | −2 | −1 | + | ✓ | Fixed | F-talk |
| ITQ-06 | −2 | −1 | −2 | ✓ | Fixed | F-talk |
| ITQ-09 | −2 | −2 | −2 | ✓ | — | AGENDA |
| ITQ-19 | + | + | + | ✓ | Auto* | E+CONCRETE-INTRO |
| ITQ-20 | + | + | −1 | ✓ | Fixed* | F-qa+CONCRETE-INTRO |
| ITQ-21 | + | + | −2 | ✓ | Auto* | E+CONCRETE-INTRO |
| ITQ-22 | + | −1 | + | ✓ | Fixed* | F-talk+CONCRETE-INTRO |
| ITQ-24 | + | −1 | −2 | ✓ | Fixed* | F-talk+CONCRETE-INTRO |
| ITQ-07 | −2 | −2 | + | ~ | — | TALK-NOTIME |
| ITQ-08 | −2 | −2 | −1 | ~ | — | TALK-NOTIME |
| ITQ-10 | −1 | + | + | ~ | — | INTRO-FILL |
| ITQ-12 | −1 | + | −2 | ~ | — | INTRO-FILL |
| ITQ-16 | −1 | −2 | + | ~ | — | INTRO-FILL+TALK-NOTIME |
| ITQ-18 | −1 | −2 | −2 | ~ | — | INTRO-FILL+TALK-NOTIME |
| ITQ-25 | + | −2 | + | ~ | — | TALK-NOTIME |
| ITQ-26 | + | −2 | −1 | ~ | — | TALK-NOTIME |
| ITQ-27 | + | −2 | −2 | ~ | — | TALK-NOTIME |
| ITQ-05 | −2 | −1 | −1 | ✗ | — | INVALID (Talk fills, Q&A → no-time) |
| ITQ-11 | −1 | + | −1 | ✗ | — | INVALID (Q&A fills, Intro → no-time) |
| ITQ-13 | −1 | −1 | + | ✗ | — | INVALID (Talk fills, Intro → no-time) |
| ITQ-14 | −1 | −1 | −1 | ✗ | — | INVALID (Talk fills, Intro + Q&A → no-time) |
| ITQ-15 | −1 | −1 | −2 | ✗ | — | INVALID (Talk fills, Intro → no-time) |
| ITQ-17 | −1 | −2 | −1 | ✗ | — | INVALID (Q&A fills, Intro → no-time) |
| ITQ-23 | + | −1 | −1 | ✗ | — | INVALID (Talk fills, Q&A → no-time) |

### Talk + Q&A (9)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| TQ-01 | 0 | + | + | ✓ | Auto | E |
| TQ-02 | 0 | + | −1 | ✓ | Fixed | F-qa |
| TQ-03 | 0 | + | −2 | ✓ | Auto | E |
| TQ-04 | 0 | −1 | + | ✓ | Fixed | F-talk |
| TQ-06 | 0 | −1 | −2 | ✓ | Fixed | F-talk |
| TQ-09 | 0 | −2 | −2 | ✓ | — | AGENDA |
| TQ-07 | 0 | −2 | + | ~ | — | TALK-NOTIME |
| TQ-08 | 0 | −2 | −1 | ~ | — | TALK-NOTIME |
| TQ-05 | 0 | −1 | −1 | ✗ | — | INVALID (Talk fills, Q&A → no-time) |

### Intro + Talk (9)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| IT-01 | −2 | + | 0 | ✓ | Auto | E |
| IT-02 | −2 | −1 | 0 | ✓ | Fixed | F-talk |
| IT-03 | −2 | −2 | 0 | ✓ | — | AGENDA |
| IT-07 | + | + | 0 | ✓ | Auto* | E+CONCRETE-INTRO |
| IT-08 | + | −1 | 0 | ✓ | Fixed* | F-talk+CONCRETE-INTRO |
| IT-04 | −1 | + | 0 | ~ | — | INTRO-FILL |
| IT-06 | −1 | −2 | 0 | ~ | — | INTRO-FILL+TALK-NOTIME |
| IT-09 | + | −2 | 0 | ~ | — | TALK-NOTIME |
| IT-05 | −1 | −1 | 0 | ✗ | — | INVALID (Talk fills, Intro → no-time) |

### Intro + Q&A (9)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| IQ-01 | −2 | 0 | + | ✓ | Auto | E |
| IQ-02 | −2 | 0 | −1 | ✓ | Fixed | F-qa |
| IQ-03 | −2 | 0 | −2 | ✓ | — | AGENDA |
| IQ-07 | + | 0 | + | ✓ | Auto* | E+CONCRETE-INTRO |
| IQ-08 | + | 0 | −1 | ✓ | Fixed* | F-qa+CONCRETE-INTRO |
| IQ-09 | + | 0 | −2 | ✓ | Auto* | E+CONCRETE-INTRO |
| IQ-04 | −1 | 0 | + | ~ | — | INTRO-FILL |
| IQ-06 | −1 | 0 | −2 | ~ | — | INTRO-FILL |
| IQ-05 | −1 | 0 | −1 | ✗ | — | INVALID (Q&A fills, Intro → no-time) |

### Talk only (3)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| T-01 | 0 | + | 0 | ✓ | Auto | E |
| T-02 | 0 | −1 | 0 | ✓ | Fixed | F-talk |
| T-03 | 0 | −2 | 0 | ✓ | — | AGENDA |

### Q&A only (3)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| Q-01 | 0 | 0 | + | ✓ | Auto | E |
| Q-02 | 0 | 0 | −1 | ✓ | Fixed | F-qa |
| Q-03 | 0 | 0 | −2 | ✓ | — | AGENDA |

### Intro only (3)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| I-01 | −2 | 0 | 0 | ✓ | — | AGENDA |
| I-03 | + | 0 | 0 | ✓ | Auto* | E+CONCRETE-INTRO |
| I-02 | −1 | 0 | 0 | ~ | — | INTRO-FILL |

### No phases (1)

| ID | Intro | Talk | QA | Status | Rec | Note |
|---|---|---|---|---|---|---|
| NONE-01 | 0 | 0 | 0 | ~ | — | NONE |
