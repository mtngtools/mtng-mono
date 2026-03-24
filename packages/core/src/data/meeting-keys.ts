import { MeetingBase, BaseEnvMeeting, RoomBase } from "./meeting";

export const DEFAULT_KEY_DELIMITER = ":";
export const RESERVED_KEY_DELIMITERS = [DEFAULT_KEY_DELIMITER, "/", "#", "\\"] as const;
export type MeetingKeyOptions = {
    delimiter?: string,
};

export const toKeyIdSegment = (slugOrRaw: string) => encodeURIComponent(slugOrRaw);
export const fromKeyIdSegment = (keyIdSegment: string) => {
    try {
        return decodeURIComponent(keyIdSegment);
    } catch {
        throw new Error(`Invalid encoded key segment: "${keyIdSegment}"`);
    }
};

const getKeyDelimiter = (options?: MeetingKeyOptions) =>
    options?.delimiter ?? DEFAULT_KEY_DELIMITER;

const joinKey = (segments: string[], options?: MeetingKeyOptions) =>
    segments.map(toKeyIdSegment).join(getKeyDelimiter(options));

const splitKey = (input: string, expectedParts: number, options?: MeetingKeyOptions) => {
    const delimiter = getKeyDelimiter(options);
    const parts = input.split(delimiter);
    if (parts.length !== expectedParts) {
        throw new Error(
            `Invalid key "${input}": expected ${expectedParts} segments but got ${parts.length}.`,
        );
    }
    return parts.map(fromKeyIdSegment);
};

export const orgMeetingKey = ({ orgDir, mtDir }: BaseEnvMeeting, options?: MeetingKeyOptions) =>
    joinKey([orgDir, mtDir], options);
export const parseOrgMeetingKey = (input: string, options?: MeetingKeyOptions) => {
    const [orgDir, mtDir] = splitKey(input, 2, options);
    return {
        orgDir,
        mtDir,
    };
};

export const orgMeetingPlusKey = ({ orgDir, mtDir }: BaseEnvMeeting, key: string, options?: MeetingKeyOptions) =>
    joinKey([orgDir, mtDir, key], options);
export const parseOrgMeetingPlusKey = (input: string, options?: MeetingKeyOptions) => {
    const [orgDir, mtDir, key] = splitKey(input, 3, options);
    return {
        orgDir,
        mtDir,
        key,
    };
};

export const orgMeetingRoomKey = ({ orgDir, mtDir }: BaseEnvMeeting, { rmId }: RoomBase, options?: MeetingKeyOptions) =>
    joinKey([orgDir, mtDir, rmId], options);
export const parseOrgMeetingRoomKey = (input: string, options?: MeetingKeyOptions) => {
    const [orgDir, mtDir, rmId] = splitKey(input, 3, options);
    return {
        orgDir,
        mtDir,
        rmId,
    };
};

export const orgMeetingRoomPlusKey = ({ orgDir, mtDir }: BaseEnvMeeting, { rmId }: RoomBase, key: string, options?: MeetingKeyOptions) =>
    joinKey([orgDir, mtDir, rmId, key], options);
export const parseOrgMeetingRoomPlusKey = (input: string, options?: MeetingKeyOptions) => {
    const [orgDir, mtDir, rmId, key] = splitKey(input, 4, options);
    return {
        orgDir,
        mtDir,
        rmId,
        key,
    };
};

export const meetingRoomKey = ({ mtDir }: MeetingBase, { rmId }: RoomBase, options?: MeetingKeyOptions) =>
    joinKey([mtDir, rmId], options);
export const parseMeetingRoomKey = (input: string, options?: MeetingKeyOptions) => {
    const [mtDir, rmId] = splitKey(input, 2, options);
    return {
        mtDir,
        rmId,
    };
};

export const meetingRoomPlusKey = ({ mtDir }: MeetingBase, { rmId }: RoomBase, key: string, options?: MeetingKeyOptions) =>
    joinKey([mtDir, rmId, key], options);
export const parseMeetingRoomPlusKey = (input: string, options?: MeetingKeyOptions) => {
    const [mtDir, rmId, key] = splitKey(input, 3, options);
    return {
        mtDir,
        rmId,
        key,
    };
};

export const roomPlusKey = ({ rmId }: RoomBase, key: string, options?: MeetingKeyOptions) =>
    joinKey([rmId, key], options);
export const parseRoomPlusKey = (input: string, options?: MeetingKeyOptions) => {
    const [rmId, key] = splitKey(input, 2, options);
    return {
        rmId,
        key,
    };
};
