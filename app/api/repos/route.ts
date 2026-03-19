// app/api/repos/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.github.com/users/macpherson3903/repos");
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch repos" }, { status: res.status });

    const data = await res.json();
    if (!Array.isArray(data)) return NextResponse.json({ error: "Invalid response from GitHub" }, { status: 500 });

    const sorted = data
      .filter((repo: any) => !repo.fork)
      .sort((a: any, b: any) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 6);

    const reposWithLanguages = await Promise.all(
      sorted.map(async (repo: any) => {
        try {
          const langRes = await fetch(repo.languages_url);
          const langsData = await langRes.json();
          return { ...repo, languages: Object.keys(langsData) };
        } catch {
          return { ...repo, languages: [] };
        }
      })
    );

    return NextResponse.json(reposWithLanguages);
  } catch (err) {
    return NextResponse.json({ error: "Server fetch failed" }, { status: 500 });
  }
}