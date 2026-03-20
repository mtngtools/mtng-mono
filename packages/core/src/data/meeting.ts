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
    mtSlug: string,
    mtName: string,
} & TzConfig;

export type BaseEnvMeeting = BaseEnv & MeetingBase;

export type RoomSource = {
    rmSourceKey: string,
}

export type RoomBase = {
    rmKey: string,
    rmName?: string,
    rmFullName?: string,
}

export type Room = RoomBase & {
    rmSourceKey: string,
    rmSlug: string,
    rmShortName?: string,
    rmVenue?: string,
    rmVenueSection?: string,
    isMain?: boolean,
}

export type SessionBase = {
    ssId: string,
    ssSlug: string,
    ssTitle: string,
    ssStart: number,
    ssEnd: number,
    ssStartStr: string,
    ssEndStr: string,
    qaLink?: string,
}

export type PresentationBase = {
    prId: string,
    prAltId?: string,
    prAbstractId?: string,
    prSlug: string,
    prTitle: string,
    prAltTitle?: string,
    prStart: number,
    prEnd: number,
    prStartStr: string,
    prEndStr: string,
}

export type SpeakerBase = {
    spId: string,
    spAltId?: string,
    spSlug: string,
    spFullName: string,
    spFirstName?: string,
    spLastName?: string,
    spFullOrg?: string,
    spOrgName?: string,
    spOrgLoc?: string,
    spEmail?: string,
    spOrder?: string,
    spPicURL?: string,
}

export type PresentationFull = PresentationBase & {
    speakers: SpeakerBase[];
}

export type SessionWithPres = SessionBase & {
    presentations: PresentationFull[],
    moderators?: SpeakerBase[];
}

export type SessionWithRoom = SessionBase & Room

export type SessionWithRoomAndPres = SessionBase & Room & { presentations: PresentationFull[] }


