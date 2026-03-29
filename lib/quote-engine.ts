export const MIN_QUOTE_USD = 150;

/** Minimum description length for a meaningful estimate (API + client). */
export const QUOTE_IDEA_MIN_CHARS = 30;

/** Upper bound to limit abuse and oversized payloads. */
export const QUOTE_IDEA_MAX_CHARS = 12_000;

export type QuoteBreakdownItem = { label: string; points: number };

export type QuoteResult = {
  complexityScore: number;
  complexityLabel: "Low" | "Medium" | "High" | "Enterprise";
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  refinedBrief: string;
  breakdown: QuoteBreakdownItem[];
};

const KEYWORDS: { re: RegExp; label: string; points: number }[] = [
  { re: /\b(auth|login|oauth|sso|jwt|session)\b/i, label: "Authentication / accounts", points: 12 },
  { re: /\b(payment|stripe|paypal|subscription|billing|invoice)\b/i, label: "Payments / billing", points: 18 },
  { re: /\b(admin|dashboard|cms|content management)\b/i, label: "Admin or CMS", points: 14 },
  { re: /\b(api|rest|graphql|webhook|integration|third[- ]party)\b/i, label: "APIs / integrations", points: 12 },
  { re: /\b(real[- ]?time|websocket|chat|messaging)\b/i, label: "Realtime / messaging", points: 16 },
  { re: /\b(mobile|ios|android|react native|expo)\b/i, label: "Mobile app scope", points: 14 },
  { re: /\b(e-?commerce|shop|cart|checkout|inventory)\b/i, label: "E-commerce", points: 16 },
  { re: /\b(analytics|reporting|charts|metrics)\b/i, label: "Analytics / reporting", points: 10 },
  { re: /\b(search|elasticsearch|algolia|filter)\b/i, label: "Search / filters", points: 10 },
  { re: /\b(file upload|storage|s3|media)\b/i, label: "File storage / media", points: 8 },
  { re: /\b(multi[- ]tenant|roles|permissions|rbac)\b/i, label: "Roles / permissions", points: 14 },
  { re: /\b(schedule|cron|background job|queue)\b/i, label: "Background jobs", points: 10 },
];

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scoreFromLength(words: number) {
  if (words < 40) return 4;
  if (words < 120) return 8;
  if (words < 300) return 12;
  return 16;
}

export function analyzeQuote(rawIdea: string): QuoteResult {
  const text = rawIdea.trim();
  const breakdown: QuoteBreakdownItem[] = [];
  let score = 8;

  const wc = wordCount(text);
  const lenPts = scoreFromLength(wc);
  breakdown.push({ label: "Scope detail (description length)", points: lenPts });
  score += lenPts;

  const seen = new Set<string>();
  for (const k of KEYWORDS) {
    if (k.re.test(text) && !seen.has(k.label)) {
      seen.add(k.label);
      breakdown.push({ label: k.label, points: k.points });
      score += k.points;
    }
  }

  if (/\b(mvp|simple|landing|basic|small)\b/i.test(text)) {
    breakdown.push({ label: "MVP / simple intent (modifier)", points: -6 });
    score -= 6;
  }
  if (/\b(enterprise|scale|millions|complex|multiple)\b/i.test(text)) {
    breakdown.push({ label: "High scale / complexity intent", points: 12 });
    score += 12;
  }

  score = Math.max(10, Math.min(120, score));

  let complexityLabel: QuoteResult["complexityLabel"] = "Low";
  if (score >= 85) complexityLabel = "Enterprise";
  else if (score >= 55) complexityLabel = "High";
  else if (score >= 30) complexityLabel = "Medium";

  const base = 150 + Math.round(score * 4.5);
  const estimatedPrice = Math.max(MIN_QUOTE_USD, base);
  const variance = Math.round(estimatedPrice * 0.12);
  const priceRange = {
    min: Math.max(MIN_QUOTE_USD, estimatedPrice - variance),
    max: estimatedPrice + variance,
  };

  const features = breakdown
    .filter((b) => b.label !== "Scope detail (description length)" && b.points > 0)
    .map((b) => b.label.replace(/\s*\([^)]*\)\s*/g, "").trim());

  const refinedBrief = [
    "## Refined project brief",
    "",
    "### Summary",
    text.length > 2000 ? `${text.slice(0, 2000)}…` : text || "(No description provided.)",
    "",
    "### Inferred scope",
    features.length
      ? features.map((f) => `- ${f}`).join("\n")
      : "- General web application; further discovery recommended.",
    "",
    "### Complexity",
    `- Level: **${complexityLabel}** (score ${score})`,
    "",
    "### Estimated investment (indicative)",
    `- **$${priceRange.min.toLocaleString()} – $${priceRange.max.toLocaleString()} USD**`,
    `- Floor: **$${MIN_QUOTE_USD}** minimum for any engagement.`,
    "",
    "_Estimates are non-binding until requirements are confirmed._",
  ].join("\n");

  return {
    complexityScore: score,
    complexityLabel,
    estimatedPrice,
    priceRange,
    refinedBrief,
    breakdown,
  };
}
