import type { Simplify } from "@mtngtools/utils-core";
import type { BaseEnv } from "../app-env";

export type TzConfig = {
    tzName: string,
    tzAbbrev: string,
    tzDisplayName: string
};

export type MeetingBase = {
    mtDir: string,
}

export type Meeting = Simplify<MeetingBase & {
    mtSlug?: string,
    mtName: string,
} & TzConfig>;

export type MeetingDataVersion = {
    currentDataVersion?: string;
    previewDataVersion?: string;
}

export type BaseEnvMeeting = Simplify<BaseEnv & MeetingBase>;

export type RoomSource = {
    rmSourceId: string,
}

export type HasRoomId = {
    rmId: string,
}

export type RoomBase = Simplify<HasRoomId & {
    rmSlug?: string,
    rmName?: string,
    rmFullName?: string,
    rmType?: string,
    rmTags?: string[],
    rmMetadata?: Record<string, unknown>,
}>;

export type Room = Simplify<RoomBase & {
    rmShortName?: string,
    rmVenue?: string,
    rmVenueSection?: string,
    isMain?: boolean,
} & Partial<RoomSource>>;

// Unix timestamp in milliseconds, matching JS Date and common date-library defaults.
export type UnixTimestampMs = number;

export type SessionBase = Simplify<{
    ssId: string,
    ssSlug?: string,
    ssTitle: string,
    ssStart: UnixTimestampMs,
    ssEnd: UnixTimestampMs,
    ssStartStr?: string,
    ssEndStr?: string,
    qaLink?: string,
    ssType?: string,
    ssTags?: string[],
    ssSecondaryTags?: string[],
    ssMetadata?: Record<string, unknown>,
    ssSpeakerNames?: string[], // optional array of all speaker names for session summaries
    ssModeratorNames?: string[], // optional array of all moderator names for session summaries
} & Partial<HasRoomId>>;

export type PresentationBase = {
    prId: string,
    prAltId?: string,
    prAbstractId?: string,
    prSlug?: string,
    prTitle: string,
    prAltTitle?: string,
    prStart: UnixTimestampMs,
    prEnd: UnixTimestampMs,
    prStartStr?: string,
    prEndStr?: string,
    prType?: string,
    prTags?: string[],
    prSecondaryTags?: string[],
    prMetadata?: Record<string, unknown>,
}

export type SpeakerBase = {
    spId: string,
    spAltId?: string,
    spSlug?: string,
    spFullName: string,
    spFirstName?: string,
    spLastName?: string,
    spFullOrg?: string,
    spOrgName?: string,
    spOrgLoc?: string,
    spEmail?: string,
    spOrder?: string | number,
    spPicURL?: string,
    spMetadata?: Record<string, unknown>,
}

export type PresentationFull<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationBase = PresentationBase,
> = Simplify<PR & {
    prSpeakers: Simplify<SP>[];
    prModerators?: Simplify<SP>[];
}>;

export type SessionChildrenOnly<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
> = Simplify<{
    ssPresentations: Simplify<PR>[];
    ssModerators?: Simplify<SP>[] | string[]; // allow for string array of moderator IDs to avoid unnecessary duplication
}>;

export type SessionWithPres<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
    SS extends SessionBase = SessionBase,
> = Simplify<SS & SessionChildrenOnly<SP, PR>>;

export type SessionWithRoom<
    SS extends SessionBase = SessionBase,
    RM extends Room = Room,
> = Simplify<SS & RM>;

export type SessionWithRoomAndPres<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
    SS extends SessionWithPres<SP, PR> = SessionWithPres<SP, PR>,
    RM extends Room = Room,
> = Simplify<SS & RM>

export type ResolvedSpeaker<
    SP extends SpeakerBase = SpeakerBase,
> = Simplify<SP & Required<Pick<SP, "spSlug">>>;

export type ResolvedPresentation<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>
> = Simplify<PR & Required<Pick<PR, "prSlug" | "prStartStr" | "prEndStr">> & {
    prSpeakers: ResolvedSpeaker<SP>[];
    prModerators: ResolvedSpeaker<SP>[] | string[];
}>;

export type ResolvedSession<
    SP extends SpeakerBase = SpeakerBase,
    PR extends PresentationFull<SP> = PresentationFull<SP>,
    SS extends SessionWithPres<SP, PR> = SessionWithPres<SP, PR>
> = Simplify<SS & Required<Pick<SS, "ssSlug" | "ssStartStr" | "ssEndStr">> & {
    ssPresentations: ResolvedPresentation<SP, PR>[];
    ssModerators: ResolvedSpeaker<SP>[]; // if was string[] of IDs, resolved to ResolvedSpeaker; 
}>;

export type ResolvedRoom<
    RM extends Room = Room,
> = Simplify<RM & Required<Pick<RM, "rmSlug" | "rmName" | "rmFullName">>>;

export type ResolvedMeeting<
    MT extends Meeting = Meeting,
> = Simplify<MT & Required<Pick<MT, "mtSlug" | "mtName">>>;


