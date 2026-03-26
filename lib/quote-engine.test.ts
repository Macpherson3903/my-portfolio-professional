import { describe, expect, it } from "vitest";
import { analyzeQuote, MIN_QUOTE_USD } from "./quote-engine";

describe("analyzeQuote", () => {
  it("enforces minimum price floor", () => {
    const r = analyzeQuote("small landing page");
    expect(r.estimatedPrice).toBeGreaterThanOrEqual(MIN_QUOTE_USD);
    expect(r.priceRange.min).toBeGreaterThanOrEqual(MIN_QUOTE_USD);
  });

  it("increases score for payment and auth keywords", () => {
    const simple = analyzeQuote("simple blog");
    const complex = analyzeQuote("We need Stripe payments, OAuth login, and an admin dashboard.");
    expect(complex.complexityScore).toBeGreaterThan(simple.complexityScore);
    expect(complex.estimatedPrice).toBeGreaterThanOrEqual(simple.estimatedPrice);
  });
});
