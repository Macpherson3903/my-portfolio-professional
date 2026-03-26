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

async function fallbackFromGitHub(): Promise<ProjectListItem[]> {
  try {
    const res = await fetch("https://api.github.com/users/macpherson3903/repos", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];
    const sorted = data
      .filter((r: { fork?: boolean }) => !r.fork)
      .sort(
        (a: { pushed_at: string }, b: { pushed_at: string }) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      )
      .slice(0, 6) as {
      id: number;
      name: string;
      description: string | null;
      html_url: string;
      homepage: string | null;
      languages_url: string;
    }[];

    const withLangs = await Promise.all(
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
        };
      })
    );
    return withLangs;
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(): Promise<ProjectListItem[]> {
  const rows = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  if (rows.length) return rows.map(mapRow);
  return fallbackFromGitHub();
}

export async function getAllProjects(): Promise<ProjectListItem[]> {
  const rows = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
  if (rows.length) return rows.map(mapRow);
  return fallbackFromGitHub();
}

async function findGitHubRepoBySlug(slug: string): Promise<ProjectListItem | null> {
  try {
    const res = await fetch("https://api.github.com/users/macpherson3903/repos?per_page=100", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return null;
    const match = data.find((r: { name: string; fork?: boolean }) => {
      if (r.fork) return false;
      return slugify(r.name) === slug || r.name.toLowerCase() === slug.toLowerCase();
    }) as
      | {
          id: number;
          name: string;
          description: string | null;
          html_url: string;
          homepage: string | null;
          languages_url: string;
        }
      | undefined;
    if (!match) return null;
    let languages: string[] = [];
    try {
      const lr = await fetch(match.languages_url, { next: { revalidate: 3600 } });
      if (lr.ok) {
        const langs = (await lr.json()) as Record<string, number>;
        languages = Object.keys(langs);
      }
    } catch {
      languages = [];
    }
    return {
      id: `gh-${match.id}`,
      slug: slugify(match.name),
      title: match.name,
      description: match.description,
      stack: languages,
      repoUrl: match.html_url,
      liveUrl: match.homepage,
      image: null,
      featured: false,
      status: "completed",
    };
  } catch {
    return null;
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectListItem | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  if (row) return mapRow(row);
  return findGitHubRepoBySlug(slug);
}
