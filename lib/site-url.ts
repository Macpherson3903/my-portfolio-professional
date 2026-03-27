function normalizeToUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (!/^https?:\/\//i.test(t)) return `https://${t}`;
  return t;
}

/** Safe base URL for metadata, canonical, and OG. Never throws. */
export function getPublicSiteUrl(): string {
  const candidates = [
    normalizeToUrl(process.env.NEXT_PUBLIC_SITE_URL ?? ""),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    "https://macpherson.vercel.app",
  ].filter(Boolean);

  for (const c of candidates) {
    try {
      const u = new URL(c);
      if (u.protocol === "https:" || u.protocol === "http:") {
        return u.origin;
      }
    } catch {
      /* next */
    }
  }
  return "https://macpherson.vercel.app";
}

export function getMetadataBase(): URL {
  return new URL(getPublicSiteUrl());
}
