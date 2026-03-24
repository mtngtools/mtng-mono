# Meeting Data Patterns and Inconsistencies

This document outlines the architectural patterns and naming conventions discovered in the `mtngTOOLS` core data layer, specifically within [meeting.ts](file:///Users/jasonbulson/Documents/_work/temp-mono/sub/mtng-mono/packages/core/src/data/meeting.ts).

## Naming Rules (Prefixes)
Each major entity type uses a consistent two-letter prefix for its properties to avoid naming collisions when types are intersected.

| Prefix | Entity | Examples |
| :--- | :--- | :--- |
| `tz` | Timezone | `tzName`, `tzAbbrev` |
| `mt` | Meeting | `mtDir`, `mtSlug`, `mtName` |
| `rm` | Room | `rmId`, `rmSlug`, `rmName` |
| `ss` | Session | `ssId`, `ssTitle`, `ssStart` |
| `pr` | Presentation | `prId`, `prTitle`, `prStart` |
| `sp` | Speaker | `spId`, `spFullName`, `spPicURL` |

> [!NOTE]
> No prefix is required for fields that are likely unique to a specific entity and unlikely to cause collisions (e.g., `isMain` in `Room`, `qaLink` in `SessionBase`).

---

## Identity & References
A set of core rules for entity identification and cross-referencing.

1.  **Mandatory IDs**: Every entity MUST have a unique identifier (`*Id` or `*Dir`).
2.  **Referencing by ID**: When one entity references another, the reference MUST be made using the entity's `Id`. This may be provided as an optional field on the referencing entity (e.g., `rmId` on `SessionBase`).
3.  **Slug Fallback**: Slugs (`*Slug`) are optional. If a slug is not explicitly provided, it is assumed to be identical to the entity's `Id`.
4.  **Usage in URLs and APIs**:
    *   **Public Interfaces**: Use **Slugs** in end-user visible URLs and in API endpoints called directly by frontend pages. This ensures user-friendly and SEO-friendly paths.
    *   **Internal Resolution**: Use **IDs** once a resource has been safely resolved (e.g., in internal service-to-service calls or secure backend processing where the ID is known).
    *   **Conversion & Escaping**: For basic implementations, generic functions handle the conversion between IDs and Slugs, providing escaping/unescaping for:
        *   Invalid characters in URL paths or query parameters.
        *   Delimiter characters (e.g., `#`, `/`, `:`, `\`) used in hierarchical keys to prevent path resolution errors.
5.  **Hierarchical Key Segment Safety**:
    *   Hierarchical keys are composed from encoded segments joined by a delimiter (typically `:`).
    *   Any ID-like value used as a key segment (`*Id`, `*Dir`, and derived IDs) MUST be delimiter-safe and MUST NOT contain raw reserved delimiters (`:`, `/`, `#`, `\`).
    *   If a slug includes reserved delimiter characters, convert the slug to a delimiter-safe ID segment before joining key segments, and decode when resolving back to slug.
    *   The segment conversion MUST be deterministic and reversible (`slug -> keyIdSegment -> slug`).
---

## Known Issue: Naive Hierarchical Key Parsing
The current split-based parsing pattern (`input.split(':')`) is unsafe when any segment includes delimiter-like content. It can truncate values or shift fields into incorrect positions.

### Recommended Implementation
- Add segment helpers in core: `toKeyIdSegment(raw: string)` and `fromKeyIdSegment(encoded: string)`.
- Encode/decode each key segment independently (never the full key string at once).
- Build keys as: `segments.map(toKeyIdSegment).join(':')`.
- Parse keys by:
  - splitting to expected segment count,
  - rejecting malformed keys with missing/extra parts,
  - decoding each segment with `fromKeyIdSegment`.
- Keep parsing strict by default (throw or return error object) so malformed keys are not silently accepted.

## Type Hierarchy & Data Patterns

### 1. Base vs Extended Types
Entities often have a `Base` type containing core identifiers and a few essential fields, which are then extended into "Full" or "Contextual" types.
- `RoomBase` -> `Room`
- `PresentationBase` -> `PresentationFull` (adds `speakers`)
- `SessionBase` -> `SessionWithPres`, `SessionWithRoom`, etc.

### 2. Timed Entities
Entities with duration (`Session`, `Presentation`) follow a pattern for time representation:
- `*Start`, `*End`: `number` (Unix timestamps).
- `*StartStr`, `*EndStr`: `string` (Optional formatted date/time strings).

### 3. Resolved Types Pattern
To ensure data consistency in the UI and downstream consumers, we provide "Resolved" versions of the core types.

- **Objective**: Convert optional or missing fields into guaranteed values.
- **Mechanism**: A `resolve<Source, Resolved>(src: Source): Resolved` function (pattern) handles the transformation.
- **Behavior**: Most optional fields (e.g., Slugs, Formatted Strings) are made **Required** in the Resolved version.
- **Transformation Logic**: The `resolve` function typically populates these fields by:
    - Falling back to `Id` if `Slug` is missing.
    - Formatting timestamps into strings (e.g., `ssStart` -> `ssStartStr`).
    - Synthesizing combined fields from parts (e.g., `[rmVenue], [rmName]`-> `rmFullName`).


### 3. Flexible Data Parts (Intentional Redundancy)
Entities often keep both atomized parts and combined versions of the same data. This is **intentional** to support flexible data ingestion (where parts might be provided) while ensuring a preferred combined format is available for display.
- **Names**: `spFirstName` + `spLastName` vs. `spFullName`.
- **Organizations**: `spOrgName` + `spOrgLoc` vs. `spFullOrg`.

### 4. Collection Naming
Plural fields for nested collections MUST use the parent entity's prefix to prevent naming collisions during intersections.
- `prSpeakers` in `PresentationFull`
- `ssPresentations` in `SessionWithPres`
- `ssModerators` in `SessionWithPres`

### 5. Sorting and Order
- `spOrder`: Supports `string | number` to accommodate various data sources while allowing for numeric sorting.

### 6. Standard Enhancement Fields
To support rich UI filtering and organization-specific extensions, entities (especially `Base` types) should include:
- **`*Type`**: `string` (Optional) - A high-level categorization (e.g., `ssType: 'Keynote'`, `rmType: 'Ballroom'`).
- **`*Tags`**: `string[]` (Optional) - Fine-grained taxonomic markers (e.g., `ssTags: ['oncology', 'featured']`).
- **`*Metadata`**: `Record<string, any>` (Optional) - A flexible "escape hatch" for non-domain-specific data required by a specific implementation without changing the core schema.

