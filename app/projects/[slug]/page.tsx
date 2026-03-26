import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: "Project" };
  return {
    title: p.title,
    description: p.description ?? undefined,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  return (
    <>
      <Header />
      <article className="min-h-screen bg-black pt-8 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/projects" className="text-sm text-red-500 hover:text-red-400 mb-6 inline-block">
            Back to projects
          </Link>
          <h1 className="text-4xl font-bold mb-4">{p.title}</h1>
          <p className="text-neutral-400 mb-8">{p.description || "No description."}</p>
          {p.stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {p.stack.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-300">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {p.repoUrl && (
              <Link
                href={p.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 transition"
              >
                Open repository
              </Link>
            )}
            {p.liveUrl && (
              <Link
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-red-600 text-red-400 hover:bg-red-950/30 transition"
              >
                Live demo
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
