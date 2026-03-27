import Link from "next/link";
import PrismaSetupHelp from "@/components/admin/PrismaSetupHelp";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = [];
  let loadError: string | null = null;

  try {
    posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  } catch (e) {
    console.error("[AdminPostsPage]", e);
    loadError = e instanceof Error ? e.message : "Database error";
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <PrismaSetupHelp technicalDetail={process.env.NODE_ENV === "development" ? loadError : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex justify-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium"
        >
          New post
        </Link>
      </div>
      {!posts.length ? (
        <p className="text-neutral-500">No posts yet.</p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden bg-neutral-950">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-neutral-500">
                  {p.published ? "Published" : "Draft"}
                  {p.publishedAt ? ` · ${new Date(p.publishedAt).toLocaleString()}` : ""}
                </p>
              </div>
              <Link href={`/admin/posts/${p.id}/edit`} className="text-sm text-red-400 hover:underline shrink-0">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
