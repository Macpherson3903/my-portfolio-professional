import { NextResponse } from "next/server";
import { fetchLanguagesFromLanguagesUrl, githubApiHeaders } from "@/lib/github-languages";

type GitHubRepo = {
  fork: boolean;
  pushed_at: string;
  languages_url: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  [key: string]: unknown;
};

export async function GET() {
  try {
    const res = await fetch("https://api.github.com/users/macpherson3903/repos", {
      headers: githubApiHeaders(),
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch repos" }, { status: res.status });

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return NextResponse.json({ error: "Invalid response from GitHub" }, { status: 500 });

    const sorted = (data as GitHubRepo[])
      .filter((repo) => !repo.fork)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 6);

    const reposWithLanguages = await Promise.all(
      sorted.map(async (repo) => ({
        ...repo,
        languages: await fetchLanguagesFromLanguagesUrl(repo.languages_url),
      }))
    );

    return NextResponse.json(reposWithLanguages);
  } catch {
    return NextResponse.json({ error: "Server fetch failed" }, { status: 500 });
  }
}
