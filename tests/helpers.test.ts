import { describe, expect, it } from "vitest";
import { indent } from "../src/helpers";

describe("indent", () => {
  it("works", () => {
    expect(indent("foo\nbar", 2)).toBe("foo\n  bar");
  });
});
