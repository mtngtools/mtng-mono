import { ArchivePlayer, Playback } from "../media.js";

export type SessionLive<
    LPL extends Playback = Playback,
> = LPL;

export type SessionArchive<
    APL extends Playback = Playback,
> = {
    players: ArchivePlayer[],
} & APL;

export const TIMELINE_UNKNOWN = "unknown";
export const TIMELINE_PRELIVE = "prelive";
export const TIMELINE_LIVE = "live";
export const TIMELINE_POSTLIVE = "postlive";
export const TIMELINE_ARCHIVE = "archive";
export const TIMELINE_RETIRED = "retired";

export type SessionStateUnknown = {
    timeline: 'unknown',
}
export type SessionStatePrePost = {
    timeline: 'prelive' | 'postlive' | 'retired',
};
export type SessionStateLive<
    L extends SessionLive = SessionLive,
> = L & {
    timeline: 'live',
}
export type SessionStateArchive<
    A extends SessionArchive = SessionArchive,
> = A & {
    timeline: 'archive',
}
export type SessionState<
    LPL extends Playback = Playback,
    APL extends Playback = Playback,
    LV extends SessionLive<LPL> = SessionLive<LPL>,
    AR extends SessionArchive<APL> = SessionArchive<APL>,
> =
    SessionStateUnknown |
    SessionStatePrePost |
    SessionStateLive<LV> |
    SessionStateArchive<AR>;

export type SessionBaseState = SessionState;


