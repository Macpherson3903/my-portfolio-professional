import SiteShell from "@/components/SiteShell";
import MarkdownPost from "@/components/blog/MarkdownPost";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/posts-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-6 pt-10 pb-8 bg-black">
        <Link href="/blog" className="text-sm text-red-500 hover:text-red-400 mb-6 inline-block">
          Back to blog
        </Link>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-sm text-neutral-500 mb-10">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
          {post.tags ? ` · ${post.tags}` : ""}
        </p>
        <MarkdownPost content={post.content} />
      </article>
    </SiteShell>
  );
}
