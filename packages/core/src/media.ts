import { Simplify } from "@mtngtools/utils-core";

export const MUX = 'mux' as const;
export const HTTP_M3U8 = 'http-m3u8' as const;

export type HasStartEnd = {
    start?: number,
    end?: number,
}

export type CustomCue = HasStartEnd & {
    id: string,
    isActive?: boolean,
    isSelected?: boolean,
    title?: string,
    subtitle?: string,
}

export type Chapters = {
    selectedIndex: number,
    items: CustomCue[],
}

export type HasMedVer = {
    medVer: string,
}

export type HasPlaybackToken = {
    token: string,
}

export type Playback = Simplify<{
    provider: string
    streamLocation?: string,
    signedStreamLocation?: string,
} & Partial<HasPlaybackToken>>;

export type PublicPlayback = Simplify<Omit<Playback, "signedStreamLocation">
    & Required<Pick<Playback, "streamLocation">>>;


export type SignedPlayback = Simplify<Omit<Playback, "streamLocation">
    & Required<Pick<Playback, "signedStreamLocation">>
>;
export type PublicAndSignedPlayback = Simplify<PublicPlayback & SignedPlayback>;

export type MuxPlayback = Simplify<PublicAndSignedPlayback & {
    provider: typeof MUX,
}>;

export type M3U8Playback = Simplify<PublicAndSignedPlayback & {
    provider: typeof HTTP_M3U8,
}>;

export type CRS3Playback = {
    provider: 'cr-s3',
    baseM3U8Path: string,
    m3u8Path: string,
} & HasMedVer;

export type OptionalPlayback = Partial<Playback>;

export type BasicArchivePlayer = {
    plSlug: string,
    plId?: string,
} & OptionalPlayback;

export type ArchivePlayer = {
    plSlug: string,
    plId: string,
    presentationIds: string[],
} & OptionalPlayback;
