# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** — glossary and domain terminology. May live at repo root or within a context.
- **`CONTEXT-MAP.md`** at repo root (if it exists) — points to one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`spec/`** folder (anywhere in the context) — architectural decisions, requirements, design specs, requirements. These are internal decision records, not usage documentation.

**Note**: `docs/` folders are for usage guides and how-to documentation, not specifications or architectural decisions. Don't look there for design rationale.

If specs or CONTEXT files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── spec/
│   ├── adr/                           ← architectural decisions (optional)
│   │   ├── 0001-event-sourcing.md
│   │   └── 0002-postgres-for-writes.md
│   ├── requirements/
│   └── api-design/
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── spec/                              ← system-wide decisions and specs
│   └── adr/
└── contexts/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── spec/                      ← context-specific decisions and specs
    │       └── adr/                   ← context-specific architectural decisions
    └── billing/
        ├── CONTEXT.md
        └── spec/
            └── adr/
```

**Key conventions:**
- `spec/` folders can live anywhere within a context (flexible location)
- **`spec/adr/`** — optional subdirectory where engineering skills expect to find architectural decisions. When skills reference "ADR" or "docs/adr/", they're looking here.
- Other spec content (requirements, design docs, API specs) can be organized however makes sense within `spec/`
- Periodic audits should reorganize specs as needed

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts an existing decision or specification in `spec/`, surface it explicitly rather than silently overriding:

> _Contradicts the decision in `spec/orders-partial-cancellation.md` — but worth reopening because…_
