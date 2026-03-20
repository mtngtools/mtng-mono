//simple helpers when zero dependency necessary
export const millisecondsToISO = (milliseconds = 0) => new Date(milliseconds * 1000).toISOString();
export const secondsToISO = (seconds = 0.0) => new Date(seconds).toISOString();
export const hoursFromISO = (iso: string) => iso.slice(11, 13);
export const minutesFromISO = (iso: string) => iso.slice(14, 16);
export const secondsFromISO = (iso: string) => iso.slice(17, 19);
export const tenthsFromISO = (iso: string) => iso.slice(20, 21);
export const timeNoExtFromISO = (iso: string) => iso.slice(11, 21);
export const timePartsFromISO = (iso: string) => {
    return {
        hours: hoursFromISO(iso),
        minutes: minutesFromISO(iso),
        seconds: secondsFromISO(iso),
        tenths: tenthsFromISO(iso),
    }
}
export const timePartsFromMilliseconds = (milliseconds = 0) => timePartsFromISO(millisecondsToISO(milliseconds));
export const timePartsFromSeconds = (seconds = 0.0) => timePartsFromISO(millisecondsToISO(seconds));