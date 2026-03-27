import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string, fallback: string) {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || fallback;
}

async function seedFromGitHub() {
  try {
    const res = await fetch("https://api.github.com/users/macpherson3903/repos", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return false;

    const sorted = data
      .filter((r: { fork?: boolean }) => !r.fork)
      .sort(
        (a: { pushed_at: string }, b: { pushed_at: string }) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      );

    for (let i = 0; i < sorted.length; i++) {
      const repo = sorted[i] as {
        id: number;
        name: string;
        description: string | null;
        html_url: string;
        homepage: string | null;
      };
      const slug = slugify(repo.name, `repo-${repo.id}`);
      await prisma.project.upsert({
        where: { slug },
        create: {
          slug,
          title: repo.name,
          description: repo.description ?? "",
          repoUrl: repo.html_url,
          liveUrl: repo.homepage || null,
          featured: i < 6,
          status: "completed",
        },
        update: {
          title: repo.name,
          description: repo.description ?? "",
          repoUrl: repo.html_url,
          liveUrl: repo.homepage || null,
          featured: i < 6,
        },
      });
    }
    return true;
  } catch {
    return false;
  }
}

async function seedFallbackProjects() {
  await prisma.project.upsert({
    where: { slug: "portfolio-site" },
    create: {
      slug: "portfolio-site",
      title: "Portfolio Site",
      description: "This portfolio built with Next.js, Prisma, and Tailwind.",
      repoUrl: "https://github.com/macpherson3903/my-portfolio",
      featured: true,
      status: "completed",
    },
    update: {},
  });
}

async function main() {
  const ok = await seedFromGitHub();
  if (!ok) await seedFallbackProjects();

  const welcomeContent = `# Welcome

This is a sample post. Edit or delete it from **Admin**.

## Features

- Markdown posts
- Projects catalog
- Quote estimator`;

  await prisma.post.upsert({
    where: { slug: "welcome-to-my-blog" },
    create: {
      slug: "welcome-to-my-blog",
      title: "Welcome to my blog",
      excerpt: "How this site is built and what to expect.",
      content: welcomeContent,
      published: true,
      publishedAt: new Date(),
      tags: "meta,nextjs",
    },
    update: {
      title: "Welcome to my blog",
      excerpt: "How this site is built and what to expect.",
      content: welcomeContent,
      published: true,
      publishedAt: new Date(),
      tags: "meta,nextjs",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
