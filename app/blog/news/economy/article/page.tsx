import SiteShell from "@/components/SiteShell";
import { decodeEconomyArticlePayload } from "@/lib/economy-article-payload";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 0;

type Props = { searchParams: Promise<{ d?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const article = d ? decodeEconomyArticlePayload(d) : null;
  return {
    title: article ? `${article.title} | Economy` : "Economy article",
    description: article?.summary?.slice(0, 160),
  };
}

export default async function EconomyArticlePage({ searchParams }: Props) {
  const { d } = await searchParams;
  if (!d) notFound();
  const article = decodeEconomyArticlePayload(d);
  if (!article) notFound();

  return (
    <SiteShell>
      <article className="max-w-2xl mx-auto px-6 pt-10 pb-28 bg-black">
        <Link href="/blog/news/economy" className="text-sm text-red-500 hover:text-red-400 mb-6 inline-block">
          ← World economy news
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">{article.title}</h1>
        {article.summary ? (
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-10 border-l-2 border-violet-500/40 pl-4">
            {article.summary}
          </p>
        ) : null}
        <p className="text-neutral-500 text-xs mb-4">
          This summary comes from the publisher&apos;s RSS feed. Open the original site for the full story, updates, and
          paywalled content.
        </p>
        <a
          href={article.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-900/50 px-5 py-3 text-sm font-medium text-red-300 hover:bg-red-900/40 hover:text-white transition"
        >
          Read full article at source
          <span aria-hidden>↗</span>
        </a>
      </article>
    </SiteShell>
  );
}
