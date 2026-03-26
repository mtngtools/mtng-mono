export const RoomType = {
  GeneralSession: "general-session",
  Ballroom: "ballroom",
  Breakout: "breakout",
  Theater: "theater",
  MeetingRoom: "meeting-room",
  Offsite: "offsite",
} as const;

export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const SessionType = {
  Plenary: "plenary",
  Symposium: "symposium",
  Breakout: "breakout",
  Workshop: "workshop",
  Sponsored: "sponsored",
  Poster: "poster",
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export const VenueType = {
  ConventionCenter: "convention-center",
  OffsiteHotel: "offsite-hotel",
  Campus: "campus",
  Other: "other",
} as const;

export type VenueType = (typeof VenueType)[keyof typeof VenueType];

export const DEFAULT_UNOPPOSED_TAG = "plenary-unopposed";
