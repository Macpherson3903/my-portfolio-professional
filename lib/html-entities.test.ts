import { describe, expect, it } from "vitest";
import { decodeHtmlEntities } from "./html-entities";

describe("decodeHtmlEntities", () => {
  it("decodes ampersand and common named entities", () => {
    expect(decodeHtmlEntities("4 ETFs That Beat the S&amp;P 500")).toBe("4 ETFs That Beat the S&P 500");
    expect(decodeHtmlEntities("Foo &quot;bar&quot;")).toBe('Foo "bar"');
    expect(decodeHtmlEntities("a &lt; b")).toBe("a < b");
  });

  it("handles double-escaped ampersands", () => {
    expect(decodeHtmlEntities("Tom &amp;amp; Jerry")).toBe("Tom & Jerry");
  });

  it("decodes numeric references", () => {
    expect(decodeHtmlEntities("&#38; co")).toBe("& co");
    expect(decodeHtmlEntities("&#x26; co")).toBe("& co");
  });

  it("leaves plain text unchanged", () => {
    expect(decodeHtmlEntities("No entities here")).toBe("No entities here");
  });
});
