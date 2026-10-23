import { describe, it, expect } from "vitest";
import { buildRollUrl, parseRollIds } from "./share-text";

describe("parseRollIds", () => {
  it("returns empty when no roll param is present", () => {
    expect(parseRollIds("")).toEqual([]);
    expect(parseRollIds("?foo=bar")).toEqual([]);
  });

  it("parses comma-separated ids in order", () => {
    expect(parseRollIds("?roll=a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace and drops empties and duplicates", () => {
    expect(parseRollIds("?roll=a, b,,a, c ")).toEqual(["a", "b", "c"]);
  });
});

describe("buildRollUrl", () => {
  it("joins ids into a roll deep link", () => {
    expect(buildRollUrl(["a", "b"])).toBe(
      "https://randompokemongenerator.games/?roll=a,b",
    );
  });
});
