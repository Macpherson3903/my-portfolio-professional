"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import type { ProjectListItem } from "@/lib/projects-data";
import { sortProjectsLiveUrlFirst } from "@/lib/project-sort";

const PAGE_SIZE = 20;

function getPaginationItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]);
  }
  return out;
}

export default function ProjectsGrid({ projects }: { projects: ProjectListItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "title">("default");
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    let list = projects;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          p.stack.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort(sortProjectsLiveUrlFirst);
    }
    return list;
  }, [projects, query, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * PAGE_SIZE;
    return visible.slice(start, start + PAGE_SIZE);
  }, [visible, page, totalPages]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginationItems = useMemo(
    () => getPaginationItems(safePage, totalPages),
    [safePage, totalPages]
  );

  return (
    <>
      <div className="flex flex-col gap-4 mb-8 sm:mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl">
          <label className="block text-sm min-w-0">
            <span className="text-neutral-500 block mb-1.5">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, stack, description…"
              className="w-full min-h-[44px] bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-[16px] sm:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-600/40"
              type="search"
              autoComplete="off"
            />
          </label>
          <label className="block text-sm min-w-0">
            <span className="text-neutral-500 block mb-1.5">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "default" | "title")}
              className="w-full min-h-[44px] bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-[16px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600/40"
            >
              <option value="default">Recent..</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>
        </div>
        {projects.length > 0 && (
          <p className="text-xs sm:text-sm text-neutral-500">
            Showing{" "}
            {visible.length === 0
              ? "0"
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, visible.length)}`}{" "}
            of {visible.length.toLocaleString()}
            {visible.length !== projects.length && ` (filtered from ${projects.length.toLocaleString()})`}
          </p>
        )}
      </div>

      {!visible.length ? (
        <p className="text-neutral-500 text-sm sm:text-base py-8 text-center border border-dashed border-white/15 rounded-xl px-4">
          No projects match your filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {paginated.map((p) => (
              <ProjectCard
                key={p.id}
                name={p.title}
                slug={p.slug}
                description={p.description}
                languages={p.stack.length ? p.stack : ["—"]}
                githubUrl={p.repoUrl ?? "#"}
                liveUrl={p.liveUrl}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-center gap-4"
              aria-label="Project list pagination"
            >
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((n) => Math.max(1, n - 1))}
                  className="min-h-[44px] px-4 rounded-lg border border-white/15 bg-neutral-950 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500 tabular-nums px-1 sm:hidden">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                  className="min-h-[44px] px-4 rounded-lg border border-white/15 bg-neutral-950 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex flex-wrap justify-center gap-1.5" role="list">
                {paginationItems.map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`e-${idx}`} className="px-2 text-neutral-600 select-none self-center">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-current={item === safePage ? "page" : undefined}
                      className={
                        item === safePage
                          ? "min-w-[40px] min-h-[40px] rounded-lg bg-red-600 text-white text-sm font-medium"
                          : "min-w-[40px] min-h-[40px] rounded-lg border border-white/15 bg-neutral-950 text-sm text-neutral-300 hover:bg-neutral-900 transition"
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
