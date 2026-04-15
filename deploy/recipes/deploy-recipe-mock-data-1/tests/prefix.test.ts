import { describe, expect, it } from "vitest";
import { normalizeKeyPrefix } from "../src/prefix.js";

describe("normalizeKeyPrefix", () => {
  it("trims slashes and collapses duplicates", () => {
    expect(normalizeKeyPrefix("/a/b//c/")).toBe("a/b/c");
    expect(normalizeKeyPrefix("prefix")).toBe("prefix");
    expect(normalizeKeyPrefix("///")).toBe("");
  });
});
