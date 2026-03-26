import PostEditor from "@/components/admin/PostEditor";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
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
