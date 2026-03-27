/**
 * Decode common XML/HTML entities in RSS titles and excerpts (e.g. &amp; → &, &quot; → ").
 * Runs a few passes to handle double-escaped text like &amp;amp;.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || !text.includes("&")) return text;

  let prev = "";
  let s = text;
  for (let i = 0; i < 6 && s !== prev; i++) {
    prev = s;
    s = s
      .replace(/&nbsp;/gi, " ")
      .replace(/&ndash;/gi, "–")
      .replace(/&mdash;/gi, "—")
      .replace(/&hellip;/gi, "…")
      .replace(/&apos;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#(\d{1,7});/g, (full, d: string) => {
        const cp = parseInt(d, 10);
        try {
          return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : full;
        } catch {
          return full;
        }
      })
      .replace(/&#x([0-9a-f]{1,6});/gi, (full, h: string) => {
        const cp = parseInt(h, 16);
        try {
          return Number.isFinite(cp) ? String.fromCodePoint(cp) : full;
        } catch {
          return full;
        }
      })
      .replace(/&amp;/gi, "&");
  }

  return s;
}
