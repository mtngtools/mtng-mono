import type { PresentationFull, Room, SessionWithPres, SpeakerBase } from "@mtngtools/core";
import type { RoomType, SessionType, VenueType } from "./constants";

export type MockSession = SessionWithPres & {
  rmId: string;
  ssType: SessionType;
  venueId: string;
  dayIndex: number;
  blockId: string;
};

export type MockMeetingData = {
  rooms: Room[];
  sessions: MockSession[];
};

export type RecipeMeeting = {
  mtDir: string;
  mtName: string;
  startDate: string;
  dayCount: number;
  timezone?: string;
};

export type RecipeVenue = {
  venueId: string;
  venueName: string;
  venueType?: VenueType;
};

export type RecipeRoom = {
  roomId: string;
  roomName: string;
  roomType: RoomType;
  venueId: string;
  isMain?: boolean;
  tags?: string[];
};

export type RecipeRoomGroup = {
  groupId: string;
  roomIds: string[];
};

export type RecipeRoomLifecycleRule = {
  dayIndex: number;
  mergeRoomIds: string[];
  intoRoomId: string;
  intoRoomName: string;
  intoRoomType?: RoomType;
  venueId?: string;
};

export type PatchContext = {
  dayIndex: number;
  blockId: string;
  roomId: string;
  sessionOrdinal: number;
  presentationOrdinal: number;
  speakerOrdinal: number;
};

export type SessionPresentationRecipeItem = {
  kind?: string;
  durationMin?: number;
  speakersPerPresentation?: number;
  presentationOverrides?: Partial<PresentationFull>;
};

export type SessionFactorySeed = {
  dayIndex: number;
  blockOrdinal: number;
  sessionOrdinal: number;
  blockId: string;
  roomId: string;
  venueId: string;
  sessionType: SessionType;
  startMs: number;
  endMs: number;
  presentationsPerSession: number;
  speakersPerPresentation: number;
};

export type SessionFactoryInput = {
  seed: SessionFactorySeed;
  createDefaultSession: () => MockSession;
};

export type SessionFactoryFn = (input: SessionFactoryInput) => MockSession;

export type SessionRecipe = {
  sessionCountPerRoom?: number;
  presentationsPerSession?: number;
  speakersPerPresentation?: number;
  presentationPlan?: SessionPresentationRecipeItem[];
  sessionOverrides?: Partial<MockSession>;
  presentationOverrides?: Partial<PresentationFull>;
  speakerOverrides?: Partial<SpeakerBase>;
  sessionPatch?: (session: MockSession, ctx: PatchContext) => MockSession;
  presentationPatch?: (presentation: PresentationFull, ctx: PatchContext) => PresentationFull;
  speakerPatch?: (speaker: SpeakerBase, ctx: PatchContext) => SpeakerBase;
  sessionFactory?: SessionFactoryFn;
};

export type RecipeRoomBlockTimeBlock = Omit<
  RecipeBlock,
  "blockId" | "templateId" | "roomIds" | "roomGroupIds" | "roomTypeFilter" | "sessionType"
> & {
  blockId?: string;
  startTime: string;
  endTime: string;
  sessionType?: SessionType | "default";
};

export type RecipeRoomBlockDay = {
  /**
   * One-based day indexes for readability (e.g. [1], [2,3,4,5]).
   */
  dayIndexes: number[];
  timeBlocks: RecipeRoomBlockTimeBlock[];
};

export type RecipeRoomBlock = Omit<
  RecipeBlock,
  "blockId" | "templateId" | "startTime" | "endTime" | "sessionType"
> & {
  roomBlockId?: string;
  sessionType?: SessionType | "default";
  dayBlocks: RecipeRoomBlockDay[];
};

export type RecipeBlock = {
  blockId: string;
  templateId?: string;
  startTime: string;
  endTime: string;
  roomIds?: string[];
  roomGroupIds?: string[];
  roomTypeFilter?: RoomType[];
  sessionType: SessionType;
  sessionCountPerRoom?: number;
  presentationsPerSession?: number;
  speakersPerPresentation?: number;
  sessionRecipe?: SessionRecipe;
  tags?: string[];
  venueIdOverride?: string;
  sessionOverrides?: Partial<MockSession>;
  presentationOverrides?: Partial<PresentationFull>;
  speakerOverrides?: Partial<SpeakerBase>;
  sessionPatch?: (session: MockSession, ctx: PatchContext) => MockSession;
  presentationPatch?: (presentation: PresentationFull, ctx: PatchContext) => PresentationFull;
  speakerPatch?: (speaker: SpeakerBase, ctx: PatchContext) => SpeakerBase;
};

export type RecipeDayPlan = {
  dayIndex: number;
  blocks: RecipeBlock[];
};

export type RecipeBlockTemplate = Omit<RecipeBlock, "blockId" | "templateId"> & {
  templateId: string;
};

export type RecipeDefaults = {
  defaultSessionType?: SessionType;
  sessionCountPerRoom?: number;
  presentationsPerSession?: number;
  speakersPerPresentation?: number;
  defaultSessionRecipe?: SessionRecipe;
  sessionTypeRecipes?: Partial<Record<SessionType, SessionRecipe>>;
};

export type RecipeRuleConfig = {
  enforcePlenaryUnopposed?: boolean;
  plenarySessionTypes?: SessionType[];
  unopposedBlockTags?: string[];
  enforceRoomLifecycle?: boolean;
};

export type RecipeConfig = {
  meeting: RecipeMeeting;
  venues: RecipeVenue[];
  rooms: RecipeRoom[];
  roomGroups?: RecipeRoomGroup[];
  roomBlocks?: RecipeRoomBlock[];
  roomLifecycles?: RecipeRoomLifecycleRule[];
  blockTemplates?: RecipeBlockTemplate[];
  dayPlans: RecipeDayPlan[];
  rules?: RecipeRuleConfig;
  defaults?: RecipeDefaults;
};

export type NormalizedRecipe = {
  meeting: RecipeMeeting;
  venues: RecipeVenue[];
  rooms: RecipeRoom[];
  roomsById: Map<string, RecipeRoom>;
  roomGroups: RecipeRoomGroup[];
  roomGroupsById: Map<string, RecipeRoomGroup>;
  roomBlocks: RecipeRoomBlock[];
  roomLifecycles: RecipeRoomLifecycleRule[];
  blockTemplatesById: Map<string, RecipeBlockTemplate>;
  dayPlans: RecipeDayPlan[];
  rules: Required<RecipeRuleConfig>;
  defaults: {
    defaultSessionType: SessionType;
    sessionCountPerRoom: number;
    presentationsPerSession: number;
    speakersPerPresentation: number;
    defaultSessionRecipe?: SessionRecipe;
    sessionTypeRecipes: Partial<Record<SessionType, SessionRecipe>>;
  };
};

export type PlannedRoomBlock = {
  plannedId: string;
  dayIndex: number;
  blockId: string;
  roomId: string;
  startMinutes: number;
  endMinutes: number;
  sessionType: SessionType;
  sessionCountPerRoom: number;
  presentationsPerSession: number;
  speakersPerPresentation: number;
  sessionRecipe?: SessionRecipe;
  tags: string[];
  venueId: string;
  hasVenueOverride: boolean;
  sessionOverrides?: Partial<MockSession>;
  presentationOverrides?: Partial<PresentationFull>;
  speakerOverrides?: Partial<SpeakerBase>;
  sessionPatch?: (session: MockSession, ctx: PatchContext) => MockSession;
  presentationPatch?: (presentation: PresentationFull, ctx: PatchContext) => PresentationFull;
  speakerPatch?: (speaker: SpeakerBase, ctx: PatchContext) => SpeakerBase;
};
