import { describe, expect, it, vi, afterEach } from "vitest";
import { aggregateNewsItems } from "./news-aggregator";

describe("aggregateNewsItems", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns an array of ticker items with categories", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const u = String(url);
        if (u.includes("coingecko")) {
          return new Response(
            JSON.stringify([
              { id: "bitcoin", symbol: "btc", current_price: 50000, price_change_percentage_24h: 1.2 },
            ]),
            { status: 200 }
          );
        }
        if (u.includes("yahoo")) {
          return new Response(
            `<rss><item><title>Test headline</title></item></rss>`,
            { status: 200 }
          );
        }
        if (u.includes("worldbank.org")) {
          return new Response(JSON.stringify([{}, [{ date: "2024", value: 2e13 }]]), { status: 200 });
        }
        return new Response("{}", { status: 404 });
      })
    );

    const items = await aggregateNewsItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty("category");
    expect(items[0]).toHaveProperty("text");
  });
});
