import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { getFeaturedProjects } from "@/lib/projects-data";

export default async function FeaturedProjects() {
  const projects = await getFeaturedProjects();
  if (!projects.length) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12">Featured Projects</h2>
        <p className="text-gray-400">No projects found.</p>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
        <h2 className="text-3xl font-bold">Featured Projects</h2>
        <Link href="/projects" className="text-red-500 hover:text-red-400 text-sm font-medium">
          View all projects
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((repo) => (
          <ProjectCard
            key={repo.id}
            name={repo.title}
            slug={repo.slug}
            description={repo.description}
            languages={repo.stack}
            githubUrl={repo.repoUrl ?? "#"}
            liveUrl={repo.liveUrl}
            hideLanguagesWhenEmpty
          />
        ))}
      </div>
    </section>
  );
}
