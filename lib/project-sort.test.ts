import { describe, expect, it } from "vitest";
import { hasUsableLiveUrl, orderProjectsByLiveThenRecency, sortProjectsLiveUrlFirst } from "./project-sort";

describe("project-sort", () => {
  it("hasUsableLiveUrl accepts http(s) URLs", () => {
    expect(hasUsableLiveUrl("https://example.com")).toBe(true);
    expect(hasUsableLiveUrl("http://a.io")).toBe(true);
    expect(hasUsableLiveUrl(null)).toBe(false);
    expect(hasUsableLiveUrl("")).toBe(false);
    expect(hasUsableLiveUrl("   ")).toBe(false);
  });

  it("sorts live URL before none, then by lastActivityAt desc", () => {
    const older = "2020-01-01T00:00:00Z";
    const newer = "2024-01-01T00:00:00Z";
    const items = [
      { liveUrl: null, lastActivityAt: newer },
      { liveUrl: "https://live.example", lastActivityAt: older },
      { liveUrl: null, lastActivityAt: older },
    ];
    const ordered = orderProjectsByLiveThenRecency(items);
    expect(ordered[0].liveUrl).toBe("https://live.example");
    expect(ordered[1].lastActivityAt).toBe(newer);
    expect(ordered[2].lastActivityAt).toBe(older);
  });

  it("within live-url group, newer first", () => {
    const a = { liveUrl: "https://a.test", lastActivityAt: "2020-06-01T00:00:00Z" };
    const b = { liveUrl: "https://b.test", lastActivityAt: "2025-06-01T00:00:00Z" };
    expect(sortProjectsLiveUrlFirst(a, b)).toBeGreaterThan(0);
  });
});
