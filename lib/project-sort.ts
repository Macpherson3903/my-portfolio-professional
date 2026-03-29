/** Shared ordering: projects with a usable live URL first, then most recent activity. */

export type LiveSortable = {
  liveUrl: string | null;
  lastActivityAt: string;
};

export function hasUsableLiveUrl(liveUrl: string | null | undefined): boolean {
  if (liveUrl == null) return false;
  const t = liveUrl.trim();
  if (!t) return false;
  try {
    const href = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const u = new URL(href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Comparator: live URL first, then `lastActivityAt` descending. */
export function sortProjectsLiveUrlFirst(a: LiveSortable, b: LiveSortable): number {
  const ha = hasUsableLiveUrl(a.liveUrl) ? 1 : 0;
  const hb = hasUsableLiveUrl(b.liveUrl) ? 1 : 0;
  if (hb !== ha) return hb - ha;
  const tb = new Date(b.lastActivityAt).getTime();
  const ta = new Date(a.lastActivityAt).getTime();
  const nb = Number.isFinite(tb) ? tb : 0;
  const na = Number.isFinite(ta) ? ta : 0;
  return nb - na;
}

export function orderProjectsByLiveThenRecency<T extends LiveSortable>(items: T[]): T[] {
  return [...items].sort(sortProjectsLiveUrlFirst);
}
