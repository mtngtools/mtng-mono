import { Simplify } from "@mtngtools/utils-core";
import { BaseEnv } from "../app-env";

export type TzConfig = {
    tzName: string,
    tzAbbrev: string,
    tzDisplayName: string
};

export type MeetingBase = {
    mtDir: string,
}

export type Meeting = MeetingBase & {
    mtSlug?: string,
    mtName: string,
} & TzConfig;

export type BaseEnvMeeting = BaseEnv & MeetingBase;

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

export type Room = RoomBase & {
    rmShortName?: string,
    rmVenue?: string,
    rmVenueSection?: string,
    isMain?: boolean,
} & Partial<RoomSource>

export type SessionBase = Simplify<{
    ssId: string,
    ssSlug?: string,
    ssTitle: string,
    ssStart: number,
    ssEnd: number,
    ssStartStr?: string,
    ssEndStr?: string,
    qaLink?: string,
    ssType?: string,
    ssTags?: string[],
    ssMetadata?: Record<string, unknown>,
} & Partial<HasRoomId>>;

export type PresentationBase = {
    prId: string,
    prAltId?: string,
    prAbstractId?: string,
    prSlug?: string,
    prTitle: string,
    prAltTitle?: string,
    prStart: number,
    prEnd: number,
    prStartStr?: string,
    prEndStr?: string,
    prType?: string,
    prTags?: string[],
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

export type PresentationFull = PresentationBase & {
    prSpeakers: SpeakerBase[];
}

export type SessionWithPres = SessionBase & {
    ssPresentations: PresentationFull[],
    ssModerators?: SpeakerBase[];
}

export type SessionWithRoom = Simplify<SessionBase & Room>

export type SessionWithRoomAndPres = SessionBase & Room & { ssPresentations: PresentationFull[] }

export type ResolvedSpeaker = SpeakerBase & Required<Pick<SpeakerBase, "spSlug">>;

export type ResolvedPresentation = PresentationBase & Required<Pick<PresentationBase, "prSlug" | "prStartStr" | "prEndStr">> & { 
    prSpeakers: ResolvedSpeaker[];
};

export type ResolvedSession = SessionBase & Required<Pick<SessionBase, "ssSlug" | "ssStartStr" | "ssEndStr">> & {
    ssPresentations: ResolvedPresentation[];
    ssModerators: ResolvedSpeaker[];
};

export type ResolvedRoom = Room & Required<Pick<Room, "rmSlug" | "rmName" | "rmFullName">>;

export type ResolvedMeeting = Required<Meeting>;


