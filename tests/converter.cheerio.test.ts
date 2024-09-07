import { describe, expect, it } from "vitest";
import { html2ft } from "../src/converter.cheerio";

describe("html2ft", () => {
  it("works", () => {
    html2ft("<div>hello</div>");
  });
});
