/** Trim leading/trailing slashes and collapse duplicate slashes in the middle. */
export function normalizeKeyPrefix(prefix: string): string {
  return prefix.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
}
