export type EconomyArticlePayload = {
  title: string;
  href: string;
  summary: string;
};

const MAX_SUMMARY = 400;

/** Build a compact internal URL token (used as `?d=` on the economy article page). */
export function encodeEconomyArticlePayload(a: EconomyArticlePayload): string {
  const summary =
    a.summary.length > MAX_SUMMARY ? `${a.summary.slice(0, MAX_SUMMARY - 1)}…` : a.summary;
  const json = JSON.stringify({ t: a.title, h: a.href, s: summary });
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeEconomyArticlePayload(d: string): EconomyArticlePayload | null {
  try {
    const raw = Buffer.from(d, "base64url").toString("utf8");
    const j = JSON.parse(raw) as { t?: string; h?: string; s?: string };
    if (!j.t || !j.h || typeof j.h !== "string") return null;
    if (!/^https?:\/\//i.test(j.h)) return null;
    return {
      title: j.t,
      href: j.h,
      summary: typeof j.s === "string" ? j.s : "",
    };
  } catch {
    return null;
  }
}
