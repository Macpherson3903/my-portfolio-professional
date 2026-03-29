import {
  fetchLanguagesForGithubRepoUrl,
  fetchLanguagesFromLanguagesUrl,
  githubApiHeaders,
} from "@/lib/github-languages";
import { prisma } from "@/lib/prisma";
import { orderProjectsByLiveThenRecency } from "@/lib/project-sort";

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
  /** ISO timestamp for "recent first" ordering (DB `updatedAt`, GitHub last push). */
  lastActivityAt: string;
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
  updatedAt: Date;
}): ProjectListItem {
  const { updatedAt, stack: rawStack, ...rest } = p;
  return {
    ...rest,
    stack: parseStack(rawStack),
    lastActivityAt: updatedAt.toISOString(),
  };
}

/** Fill `stack` from GitHub Languages API when DB has no stack but `repoUrl` is github.com. */
async function enrichStackFromGitHubIfEmpty(project: ProjectListItem): Promise<ProjectListItem> {
  if (project.stack.length > 0) return project;
  const langs = await fetchLanguagesForGithubRepoUrl(project.repoUrl);
  if (langs.length > 0) return { ...project, stack: langs };
  return project;
}

async function enrichProjectsStack(items: ProjectListItem[]): Promise<ProjectListItem[]> {
  return Promise.all(items.map(enrichStackFromGitHubIfEmpty));
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
    const perPage = Math.min(100, maxRepos);
    const res = await fetch(
      `https://api.github.com/users/macpherson3903/repos?per_page=${perPage}&sort=pushed&direction=desc`,
      {
        headers: githubApiHeaders(),
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
        const languages = await fetchLanguagesFromLanguagesUrl(repo.languages_url);
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
          lastActivityAt: repo.pushed_at,
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
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
    });
    if (rows.length) {
      const enriched = await enrichProjectsStack(rows.map(mapRow));
      return orderProjectsByLiveThenRecency(enriched).slice(0, 6);
    }
  } catch {
    /* database unavailable or schema missing */
  }
  const gh = await reposFromGitHub(50);
  return gh.length ? orderProjectsByLiveThenRecency(gh).slice(0, 6) : [];
}

export async function getAllProjects(): Promise<ProjectListItem[]> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
    if (rows.length) {
      const enriched = await enrichProjectsStack(rows.map(mapRow));
      return orderProjectsByLiveThenRecency(enriched);
    }
  } catch {
    /* fallback */
  }
  const gh = await reposFromGitHub(100);
  return gh.length ? orderProjectsByLiveThenRecency(gh) : [];
}

async function findGitHubRepoBySlug(slug: string): Promise<ProjectListItem | null> {
  const all = await reposFromGitHub(100);
  return all.find((p) => p.slug === slug || p.title.toLowerCase() === slug.toLowerCase()) ?? null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectListItem | null> {
  try {
    const row = await prisma.project.findUnique({ where: { slug } });
    if (row) return enrichStackFromGitHubIfEmpty(mapRow(row));
  } catch {
    /* fallback */
  }
  const fromGh = await findGitHubRepoBySlug(slug);
  return fromGh ? enrichStackFromGitHubIfEmpty(fromGh) : null;
}
