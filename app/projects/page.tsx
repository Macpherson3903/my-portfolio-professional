import SiteShell from "@/components/SiteShell";
import ProjectsGrid from "@/components/ProjectsGrid";
import { getAllProjects } from "@/lib/projects-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "All projects and repositories.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <SiteShell>
      <section className="bg-black pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 sm:mb-10 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">Projects</h1>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Work and open-source repos. Projects with a live site are listed first, then by recent activity.
              Search, sort by title, paginate—twenty cards per page.
            </p>
          </header>
          {!projects.length ? (
            <p className="text-neutral-500 text-sm sm:text-base py-12 text-center rounded-xl border border-dashed border-white/15">
              No projects yet.
            </p>
          ) : (
            <ProjectsGrid projects={projects} />
          )}
        </div>
      </section>
    </SiteShell>
  );
}
