import PostEditor from "@/components/admin/PostEditor";
import PrismaSetupHelp from "@/components/admin/PrismaSetupHelp";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  let post: Awaited<ReturnType<typeof prisma.post.findUnique>> = null;
  let loadError: string | null = null;

  try {
    post = await prisma.post.findUnique({ where: { id } });
  } catch (e) {
    console.error("[EditPostPage]", e);
    loadError = e instanceof Error ? e.message : "Database error";
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit post</h1>
        <PrismaSetupHelp technicalDetail={process.env.NODE_ENV === "development" ? loadError : undefined} />
      </div>
    );
  }

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit post</h1>
      <PostEditor
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          tags: post.tags ?? "",
          published: post.published,
        }}
      />
    </div>
  );
}
