import SiteShell from "@/components/SiteShell";
import BlogNewsCards from "@/components/blog/BlogNewsCards";
import Link from "next/link";
import { aggregateNewsItems } from "@/lib/news-aggregator";
import { fetchBlogCardCharts } from "@/lib/news-detail";
import { getPublishedPosts } from "@/lib/posts-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on web development and projects.",
};

export default async function BlogIndexPage() {
  const [posts, newsItems, cardCharts] = await Promise.all([
    getPublishedPosts(),
    aggregateNewsItems(),
    fetchBlogCardCharts(),
  ]);

  return (
    <SiteShell>
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-8 bg-black">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-neutral-400 mb-10">Notes, tutorials, and updates.</p>

        <BlogNewsCards items={newsItems} charts={cardCharts} />

        {!posts.length ? (
          <div className="max-w-3xl rounded-xl border border-white/10 bg-neutral-950/80 p-6 text-neutral-400 text-sm space-y-4 leading-relaxed">
            <p>
              No published posts are in the database yet. New Neon/Vercel setups need tables and a first post:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-neutral-500">
              <li>
                Use the same <code className="text-neutral-300">DATABASE_URL</code> as Vercel in your local{" "}
                <code className="text-neutral-300">.env</code>.
              </li>
              <li>
                Run <code className="text-neutral-300">npm run db:setup</code> (runs <code className="text-neutral-300">prisma db push</code>{" "}
                + seed). This creates the “Welcome to my blog” post.
              </li>
              <li>
                Or sign in at <Link href="/admin/login" className="text-red-400 hover:underline">Admin</Link> and publish
                a post there.
              </li>
            </ol>
          </div>
        ) : (
          <ul className="space-y-8 max-w-3xl">
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
