import { prisma } from "@/lib/prisma";

export type BlogPostListItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  tags: string | null;
};

export async function getPublishedPosts(): Promise<BlogPostListItem[]> {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        tags: true,
      },
    });
  } catch (e) {
    console.error("[getPublishedPosts]", e);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: { slug, published: true },
    });
  } catch (e) {
    console.error("[getPublishedPostBySlug]", slug, e);
    return null;
  }
}
