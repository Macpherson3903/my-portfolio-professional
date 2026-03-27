import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  image: string | null;
  featured: boolean;
  status: string;
};

function parseStack(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw) as unknown;
    if (Array.isArray(j)) return j.map(String);
  } catch {
    /* fallthrough */
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapRow(p: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  stack: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  image: string | null;
  featured: boolean;
  status: string;
}): ProjectListItem {
  return {
    ...p,
    stack: parseStack(p.stack),
  };
}

type GhRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  languages_url: string;
  fork?: boolean;
  pushed_at: string;
};

async function reposFromGitHub(maxRepos: number): Promise<ProjectListItem[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/macpherson3903/repos?per_page=${Math.min(100, maxRepos)}&sort=updated`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];
    const sorted = (data as GhRepo[])
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, maxRepos);

    return await Promise.all(
      sorted.map(async (repo) => {
        let languages: string[] = [];
        try {
          const lr = await fetch(repo.languages_url, { next: { revalidate: 3600 } });
          if (lr.ok) {
            const langs = (await lr.json()) as Record<string, number>;
            languages = Object.keys(langs);
          }
        } catch {
          languages = [];
        }
        return {
          id: `gh-${repo.id}`,
          slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `repo-${repo.id}`,
          title: repo.name,
          description: repo.description,
          stack: languages,
          repoUrl: repo.html_url,
          liveUrl: repo.homepage,
          image: null,
          featured: true,
          status: "completed",
        } satisfies ProjectListItem;
      })
    );
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(): Promise<ProjectListItem[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });
    if (rows.length) return rows.map(mapRow);
  } catch {
    /* database unavailable or schema missing */
  }
  const gh = await reposFromGitHub(6);
  return gh.length ? gh : [];
}

export async function getAllProjects(): Promise<ProjectListItem[]> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });
    if (rows.length) return rows.map(mapRow);
  } catch {
    /* fallback */
  }
  const gh = await reposFromGitHub(100);
  return gh.length ? gh : [];
}

async function findGitHubRepoBySlug(slug: string): Promise<ProjectListItem | null> {
  const all = await reposFromGitHub(100);
  return all.find((p) => p.slug === slug || p.title.toLowerCase() === slug.toLowerCase()) ?? null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectListItem | null> {
  try {
    const row = await prisma.project.findUnique({ where: { slug } });
    if (row) return mapRow(row);
  } catch {
    /* fallback */
  }
  return findGitHubRepoBySlug(slug);
}
