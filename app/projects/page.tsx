import Header from "@/components/Header";
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
    <>
      <Header />
      <section className="min-h-screen bg-black pt-8 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects</h1>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            A curated list of work and open-source repositories. Search, sort, and open details.
          </p>
          {!projects.length ? (
            <p className="text-neutral-500">No projects yet.</p>
          ) : (
            <ProjectsGrid projects={projects} />
          )}
        </div>
      </section>
    </>
  );
}
