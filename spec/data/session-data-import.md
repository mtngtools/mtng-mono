# Session and Room Data Import Specification

Requirements and shapes for importing, transforming, and mocking session and room data.

## Goals
1. Standardize data shapes across all mtngTOOLS applications.
2. Robust Mocking Library for demos and code tests.
3. Reusable Importing and Transformation utilities for attendee and admin sites.

## Data Shapes (Standardization)

### Room Data Shape (`RoomBase`)
```typescript
export interface RoomBase {
  rmId: string;
  rmName: string;
}
```

### Session Data Shape (`SessionSummary` / `SessionBase`)
Minimum properties for cross-platform sessions.
```typescript
export interface SessionSummary {
  ssId: string;
  ssSlug: string;
  ssTitle: string;
  ssStart: number; // Unix timestamp
  ssEnd: number;   // Unix timestamp
  rmId: string;    // Reference to Room
}
```

## Mocking Library Requirements (@mtngtools/develop-mock-data)
- Deterministic data generation for reproducible tests.
- Factory functions: `createMockSession(overrides)`, `createMockRoom(overrides)`.
- Pre-packaged "mock events" (e.g., 1-day, multi-track) for UI demos.
- Utilities for simulated delay or varied data formats.
- Package-level details and recipe contracts live in:
  - [`../../packages/develop-mock-data/spec/README.md`](../../packages/develop-mock-data/spec/README.md)
  - [`../../packages/develop-mock-data/spec/recipe-model.md`](../../packages/develop-mock-data/spec/recipe-model.md)
  - [`../../packages/develop-mock-data/spec/recipe-examples.md`](../../packages/develop-mock-data/spec/recipe-examples.md)

## Importing & Transformation Utilities
Reusable pipes for non-conforming raw data.
- Typed **transformers** (e.g., `transform<Target, Source>()`


### 1. "On-The-Fly" Transformation
- Fetch non-conforming data containing target object fields (S3 JSON, legacy API).
- .
- Strongly typed, highly performant, and fails gracefully.
- Example: server endpoints Providing session data (e.g., `GET /[mtSlug]/session/[ssSlug]`).

### 2. "Ahead-Of-Time" Import (Admin Sites / Processing Pipelines)
- Ingest raw inputs (TSV, CSV, Excel, Google Sheets).
- **Parsers** (e.g., `parseTSVSessions()`) returning `SessionSummary[]`.
- **Data Evolution & Sequential Imports**:
  - **Partial data states** (e.g., Draft sessions -> Detail phase -> Final room assignments).
  - **Merge/upsert** incoming data into existing records for secondary import steps.
  - **Pipeline model** for field augmentation (e.g., `mergePartials<T>()`).
- Features Needed:
  - Error reporting (e.g. missing fields, invalid formats).
  - Date parsing consistency (standardized timezone handling).
  - Slugification and reserved character escaping for safe IDs and storage keys (e.g., '[mtDir]:[ssId]').
  - Reserved delimiters for hierarchical keys MUST include `:`, `/`, `#`, and `\`.
  - Conversion MUST occur per key segment (not across the full joined key string).

## Hierarchical Key Segment Requirements
- Keys are composed by joining encoded segments with a delimiter (typically `:`).
- Any ID used as a key segment MUST be delimiter-safe (must not contain raw `:`, `/`, `#`, `\`).
- Provide reversible helpers:
  - `toKeyIdSegment(slugOrRaw: string): string`
  - `fromKeyIdSegment(keyIdSegment: string): string`
- Round-trip behavior is required: `fromKeyIdSegment(toKeyIdSegment(x)) === x`.
- Parsing helpers must validate expected segment count and reject malformed keys.

### Known Issue to Track
Current split-based parse helpers (`input.split(':')`) are not safe if a segment contains delimiter-like content, and can silently produce invalid field mappings.

## Next Steps
- Finalize `RoomBase` and `SessionSummary` fields.
- Create `@mtngtools/develop-mock-data` package in the DEVELOP layer.
- Unit tests for sample TSV and on-the-fly payloads.
