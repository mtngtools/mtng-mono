import { MeetingBase, BaseEnvMeeting, RoomBase } from "./meeting";

export const KEY_DELIMTER = ":";
export const orgMeetingKey = ({ orgDir, mtDir }: BaseEnvMeeting) =>
    `${orgDir}${KEY_DELIMTER}${mtDir}`;
export const parseOrgMeetingKey = (input: string) => {
    const [orgDir, mtDir] = input.split(KEY_DELIMTER);
    return {
        orgDir,
        mtDir,
    };
};

export const orgMeetingPlusKey = ({ orgDir, mtDir }: BaseEnvMeeting, key: string) =>
    `${orgDir}${KEY_DELIMTER}${mtDir}${KEY_DELIMTER}${key}`;
export const parseOrgMeetingPlusKey = (input: string) => {
    const [orgDir, mtDir, key] = input.split(KEY_DELIMTER);
    return {
        orgDir,
        mtDir,
        key,
    };
};

export const orgMeetingRoomKey = ({ orgDir, mtDir }: BaseEnvMeeting, { rmKey }: RoomBase) =>
    `${orgDir}${KEY_DELIMTER}${mtDir}${KEY_DELIMTER}${rmKey}`;
export const parseOrgMeetingRoomKey = (input: string) => {
    const [orgDir, mtDir, rmKey] = input.split(KEY_DELIMTER);
    return {
        orgDir,
        mtDir,
        rmKey,
    };
};

export const orgMeetingRoomPlusKey = ({ orgDir, mtDir }: BaseEnvMeeting, { rmKey }: RoomBase, key: string) =>
    `${orgDir}${KEY_DELIMTER}${mtDir}${KEY_DELIMTER}${rmKey}${KEY_DELIMTER}${key}`;
export const parseOrgMeetingRoomPlusKey = (input: string) => {
    const [orgDir, mtDir, rmKey, key] = input.split(KEY_DELIMTER);
    return {
        orgDir,
        mtDir,
        rmKey,
        key,
    };
};

export const meetingRoomKey = ({ mtDir }: MeetingBase, { rmKey }: RoomBase) =>
    `${mtDir}${KEY_DELIMTER}${rmKey}`;
export const parseMeetingRoomKey = (input: string) => {
    const [mtDir, rmKey] = input.split(KEY_DELIMTER);
    return {
        mtDir,
        rmKey,
    };
};

export const meetingRoomPlusKey = ({ mtDir }: MeetingBase, { rmKey }: RoomBase, key: string) =>
    `${mtDir}${KEY_DELIMTER}${rmKey}${KEY_DELIMTER}${key}`;
export const parseMeetingRoomPlusKey = (input: string) => {
    const [mtDir, rmKey, key] = input.split(KEY_DELIMTER);
    return {
        mtDir,
        rmKey,
        key,
    };
};

export const roomPlusKey = ({ rmKey }: RoomBase, key: string) =>
    `${rmKey}${KEY_DELIMTER}${key}`;
export const parseRoomPlusKey = (input: string) => {
    const [rmKey, key] = input.split(KEY_DELIMTER);
    return {
        rmKey,
        key,
    };
};