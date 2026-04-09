import { HasCreated, HasId, HasMessage, RESPONSE_ACCEPTED, RESPONSE_ERROR, RESPONSE_LOG, MUX, BasicArchivePlayer, HasStartEnd } from "@mtngtools/core";
import { genUniqueId } from "@mtngtools/utils-core";

export const INPUT_MUX_ASSET = 'muxasset' as const;
export const INPUT_HTTP = 'http' as const;

export type LiveStream = {
    liveId: string,
    playbackId?: string,
    signedPlaybackId?: string,
    streamKey: string,
    providerData: object,
    roomName: string,
    rmId?: string,
}

export type LiveStreamWithPublicPlayback = LiveStream
    & Required<Pick<LiveStream, "playbackId">>;
export type LiveStreamWithSignedPlayback = LiveStream
    & Required<Pick<LiveStream, "signedPlaybackId">>;
export type LiveStreamWithPublicAndSignedPlayback = LiveStream
    & Required<Pick<LiveStream, "playbackId" | "signedPlaybackId">>;

export type AdminPlayerProps = {
    videoKey: string,
}

export type BasicEncodeInput<
    APL extends BasicArchivePlayer = BasicArchivePlayer,
> = APL & HasStartEnd;

export type MuxAssetEncodeInput<
    APL extends BasicArchivePlayer = BasicArchivePlayer,
> = {
    provider: typeof INPUT_MUX_ASSET,
    assetId: string,
} & BasicEncodeInput<APL> & HasCreated & HasId;

export type EncodeInput<
    APL extends BasicArchivePlayer = BasicArchivePlayer,
> = MuxAssetEncodeInput<APL>;

export const genMuxAssetEncodeInput = (basicEncodeInput: BasicEncodeInput, assetId: string) => {
    const { plSlug, plId } = basicEncodeInput;
    const id = plId ?? plSlug;
    return {
        ...basicEncodeInput,
        provider: INPUT_MUX_ASSET,
        assetId,
        plId: id,
        presentationIds: [id],
        createdAt: Date.now(),
        id: genUniqueId('encinp'),
    } as EncodeInput
};

// export type MuxHttpEncodeInput = {
//     provider: 'muxhttp',
//     http: string,
// } & BasicEncodeInput

export type BaseEncodeInputResponse = {
    encodeInput: EncodeInput,
} & Partial<HasMessage> & HasCreated;

export type BaseMuxEncodeInputResponse = BaseEncodeInputResponse & {
    convertedInput: object
}

export type AcceptedMuxEncodeInputResponse = BaseMuxEncodeInputResponse & {
    status: typeof RESPONSE_ACCEPTED,
    provider: typeof MUX,
    streamLocation: string,
    signedStreamLocation: string,
    muxResponse: object,
} & HasId

// export type PendingEncodeInputResponse = BaseMuxEncodeInputResponse & {
//     status: 'pending',
// } & HasId 

export type ErrorEncodeInputResponse = BaseMuxEncodeInputResponse & {
    status: typeof RESPONSE_ERROR,
}

export type LogOnlyEncodeInputResponse = BaseMuxEncodeInputResponse & {
    status: typeof RESPONSE_LOG,
}

export type EncodeInputResponse =
    (AcceptedMuxEncodeInputResponse
        // | PendingEncodeInputResponse 
        | ErrorEncodeInputResponse
        | LogOnlyEncodeInputResponse
    );

export type EncodeBatchInput = {
    process: boolean
    encodeInputs: EncodeInput[],
} & HasId & HasCreated

export type EncodeBatchResponse = {
    encodeResponses: EncodeInputResponse[],
} & HasId & HasCreated

export const genEncodeBatchInput = (encodeInputs: EncodeInput[]) => {
    return {
        encodeInputs,
        createdAt: Date.now(),
        id: genUniqueId('encbat'),
    } as EncodeBatchInput
};
