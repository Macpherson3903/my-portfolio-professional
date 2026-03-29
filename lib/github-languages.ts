import { getPublicSiteUrl } from "@/lib/site-url";

/** GitHub requires a User-Agent; pooled with Accept for consistent API behavior. */
export function githubApiHeaders(): HeadersInit {
  const origin = getPublicSiteUrl();
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": `Portfolio/1.0 (+${origin})`,
  };
}

/**
 * Parse `owner` and `repo` from a github.com repository URL (https or http).
 */
export function parseGithubRepoPath(repoUrl: string | null | undefined): { owner: string; repo: string } | null {
  if (!repoUrl?.trim()) return null;
  try {
    const u = new URL(repoUrl.trim());
    const host = u.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

/**
 * `GET` the Languages API payload (bytes per language) and return names sorted by share descending.
 * `languagesUrl` is the `languages_url` field from a repo object, or `/repos/{owner}/{repo}/languages`.
 */
export async function fetchLanguagesFromLanguagesUrl(languagesUrl: string): Promise<string[]> {
  if (!languagesUrl?.trim()) return [];
  try {
    const lr = await fetch(languagesUrl, {
      headers: githubApiHeaders(),
      next: { revalidate: 3600 },
    });
    if (!lr.ok) return [];
    const langs = (await lr.json()) as unknown;
    if (!langs || typeof langs !== "object" || Array.isArray(langs)) return [];
    const entries = Object.entries(langs as Record<string, number>).filter(
      ([, bytes]) => typeof bytes === "number" && bytes > 0
    );
    entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([name]) => name);
  } catch {
    return [];
  }
}

/** Resolve languages for a GitHub repo web URL using the REST Languages endpoint. */
export async function fetchLanguagesForGithubRepoUrl(repoUrl: string | null | undefined): Promise<string[]> {
  const parsed = parseGithubRepoPath(repoUrl);
  if (!parsed) return [];
  const url = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`;
  return fetchLanguagesFromLanguagesUrl(url);
}
