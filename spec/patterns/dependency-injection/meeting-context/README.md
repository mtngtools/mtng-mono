# Meeting Context



## `BaseMeetingContext` 


## `BaseAdminMeetingContext`

Same as `BaseMeetingContext` but some sometimes hve additional needs.

## Context modules

- Avoid overly complex "god" by grouping into larger "modules" or "services" so the final composition is not this overwhelming and unwieldy. For example, a simple meeting context might only have two context modules:
    - `MeetingDataService`
    - `SessionStateService`
- There can be variations for each type of module, with varying interfaces and implementations for each, but that complexity should be hidden when  
- More feature-rich apps might have additional context modules: 
    - `AuthorizationService`
    - `SessionNavigationService`

## Composed `MTContext` type

```typescript
type MTContext = BaseMeetingContext 
    & MeetingDataService
    & SessionStateService;
```

A meeting app only serving sessions playback with direct URLs might have a simple `MeetingDataService`, such as:
```typescript
type MeetingDataService = {
    getSession(ssSlug: string): Promise<Session>;    
```

but a for apps with session navigation might have a more complex `MeetingDataService`, such as:
```typescript
type MeetingDataService = {
    getSession(ssSlug: string): Promise<Session>;
    getSessions(filter?: SessionFilter): Promise<Session[]>;
    getRooms(filter?: RoomsFilter): Promise<Room[]>;
}
```

These examples are basic. The actual typing should have generic types allowing for different options and data versions.

## Implementation in Nuxt apps

- A Nitro server plugin attaches **`getMeetingContext(mtSlug)`** on **`event.context`**; it returns an object satisfying the app’s composed type, **cached per `mtSlug` per process**.
- Pages and server api routes the need this context will either have a `mtSlug` from path or query params (or way to derive it) fallback to a configured default `mtSlug` .
- **`createMeetingContext(mtSlug)`** resolves **`mtDir`**, copies **`opEnv`** / **`orgDir`** from config, sets **`applName`** / **`roleName`**, and attaches **`getMeeting`** / **`getSession`** / **`getSessionState`** per the composed type.


The app is making available a `MeetingContext` object on the `event.context` object. 





