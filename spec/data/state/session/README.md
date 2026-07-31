# Session state

Persisted session timeline/state data — the storage layer backing the [timeline & steps](../../../patterns/timeline-steps/README.md) pattern for sessions.

## Scope

- Storage shape for current timeline step + step history
- Storage key pattern (reuse [`meeting-keys.ts`](../../../../packages/core/src/data/meeting-keys.ts) conventions)
- Relationship to `SessionBase`/`ResolvedSession` in [`core/src/data/meeting.ts`](../../../../packages/core/src/data/meeting.ts)
- Read/write access patterns (who updates state, when)
