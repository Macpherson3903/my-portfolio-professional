import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on web development and projects.",
};

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      tags: true,
    },
  });

  return (
    <SiteShell>
      <main className="max-w-3xl mx-auto px-6 pt-10 pb-8 bg-black">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-neutral-400 mb-10">Notes, tutorials, and updates.</p>
        {!posts.length ? (
          <p className="text-neutral-500">No published posts yet.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-white/10 pb-8">
                <Link href={`/blog/${p.slug}`} className="group">
                  <h2 className="text-2xl font-semibold group-hover:text-red-400 transition">{p.title}</h2>
                  {p.excerpt && <p className="text-neutral-400 mt-2">{p.excerpt}</p>}
                  <p className="text-xs text-neutral-500 mt-3">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}
                    {p.tags ? ` · ${p.tags}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </SiteShell>
  );
}
