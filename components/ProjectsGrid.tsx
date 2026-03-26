"use client";

import { useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import type { ProjectListItem } from "@/lib/projects-data";

export default function ProjectsGrid({ projects }: { projects: ProjectListItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "title">("default");

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
    }
    return list;
  }, [projects, query, sort]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl">
        <label className="flex-1 text-sm">
          <span className="text-neutral-500 block mb-1">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, stack, description…"
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40"
            type="search"
            autoComplete="off"
          />
        </label>
        <label className="sm:w-44 text-sm">
          <span className="text-neutral-500 block mb-1">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "default" | "title")}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40"
          >
            <option value="default">Latest (server)</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      {!visible.length ? (
        <p className="text-neutral-500">No projects match your filters.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((p) => (
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
      )}
    </>
  );
}
