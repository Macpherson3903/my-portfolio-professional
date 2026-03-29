"use client";
import Link from "next/link";

interface ProjectCardProps {
  name: string;
  slug?: string;
  description: string | null;
  languages: string[];
  githubUrl: string;
  liveUrl?: string | null;
  /** When set (e.g. homepage featured), omit the languages block entirely if there are none. */
  hideLanguagesWhenEmpty?: boolean;
}

function formatLangLabel(raw: string): string {
  const t = raw.trim();
  if (!t || t === "—") return "";
  return t;
}

export default function ProjectCard({
  name,
  slug,
  description,
  languages,
  githubUrl,
  liveUrl,
  hideLanguagesWhenEmpty = false,
}: ProjectCardProps) {
  const labels = languages.map(formatLangLabel).filter(Boolean);
  const hasStack = labels.length > 0;
  const showLanguagesBlock = hasStack || !hideLanguagesWhenEmpty;

  return (
    <article className="flex flex-col h-full bg-neutral-950 border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm hover:border-white/20 hover:shadow-md transition-all duration-300">
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug pr-1 line-clamp-2">{name}</h3>

        {showLanguagesBlock ? (
          <div className="rounded-lg bg-black/50 border border-white/10 px-3 py-2.5 sm:py-3">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-2">
              Languages &amp; stack
            </p>
            {hasStack ? (
              <ul className="flex flex-wrap gap-2" aria-label="Programming languages and stack">
                {labels.slice(0, 10).map((lang) => (
                  <li key={lang}>
                    <span className="inline-flex items-center min-h-[1.75rem] text-xs sm:text-sm font-medium text-neutral-100 bg-neutral-800/90 border border-white/15 px-2.5 py-1 rounded-md">
                      {lang}
                    </span>
                  </li>
                ))}
                {labels.length > 10 ? (
                  <li
                    className="inline-flex items-center min-h-[1.75rem] text-xs text-neutral-400 px-1"
                    aria-label={`${labels.length - 10} more technologies`}
                  >
                    +{labels.length - 10} more
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500 italic">No language data for this project yet.</p>
            )}
          </div>
        ) : null}

        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-4 sm:line-clamp-3 grow">
          {description?.trim() || "No description provided."}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {slug ? (
          <Link
            href={`/projects/${slug}`}
            className="inline-flex justify-center sm:justify-start min-h-[40px] sm:min-h-0 items-center text-sm font-medium text-red-400 hover:text-red-300 transition py-2 sm:py-0"
          >
            Details
          </Link>
        ) : null}
        {githubUrl && githubUrl !== "#" ? (
          <Link
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center sm:justify-start min-h-[40px] sm:min-h-0 items-center text-sm font-medium text-neutral-300 hover:text-white transition py-2 sm:py-0"
          >
            GitHub
          </Link>
        ) : null}
        {liveUrl ? (
          <Link
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center sm:justify-start min-h-[40px] sm:min-h-0 items-center text-sm font-medium text-emerald-400/90 hover:text-emerald-300 transition py-2 sm:py-0"
          >
            Live site
          </Link>
        ) : null}
      </div>
    </article>
  );
}
