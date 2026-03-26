export const MINUTE_MS = 60_000;
export const DAY_MS = 24 * 60 * MINUTE_MS;

export const toNonNegativeInt = (value: number | undefined, fallback = 0) => {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0, Math.trunc(value));
};

export const toPositiveInt = (value: number | undefined, fallback: number) => {
  const normalized = toNonNegativeInt(value, fallback);
  return Math.max(1, normalized);
};

export const parseDateStartMs = (yyyyMmDd: string) => {
  const value = Date.parse(`${yyyyMmDd}T00:00:00.000Z`);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid meeting startDate: "${yyyyMmDd}". Expected YYYY-MM-DD.`);
  }
  return value;
};

export const parseTimeToMinutes = (hhMm: string) => {
  const parts = hhMm.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid time format "${hhMm}". Expected HH:mm.`);
  }
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(`Invalid time value "${hhMm}".`);
  }
  return hour * 60 + minute;
};

export const indexInto = <T>(values: readonly T[], index: number | undefined, fallback = 0) => {
  if (values.length === 0) {
    throw new Error("Cannot index into an empty dictionary.");
  }
  const safeIndex = toNonNegativeInt(index, fallback) % values.length;
  return values[safeIndex] as T;
};

export const idFromParts = (prefix: string, ...parts: number[]) => {
  const encoded = parts.map((part) => toNonNegativeInt(part).toString(36).padStart(2, "0"));
  return `${prefix}-${encoded.join("-")}`;
};

export const isoFromMs = (value: number) => new Date(value).toISOString();

export const applyOverrides = <T extends object>(base: T, overrides?: Partial<T>) => ({
  ...base,
  ...overrides,
});

export const uniqueStrings = (values: string[]) => [...new Set(values)];

export const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;
