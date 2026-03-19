// components/FeaturedProjects.tsx
"use client";
import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";

interface Repo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    fork: boolean;
    pushed_at: string;
    languages: string[];
}

export default function FeaturedProjects() {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRepos() {
            try {
                const res = await fetch("/api/repos");
                const data = await res.json();
                if (data.error) {
                    console.error(data.error);
                    setRepos([]);
                } else {
                    setRepos(data);
                }
            } catch (err) {
                console.error("Failed to fetch repos:", err);
                setRepos([]);
            } finally {
                setLoading(false);
            }
        }

        fetchRepos();
    }, []);

    if (loading) return <p className="text-gray-400">Loading projects...</p>;
    if (repos.length === 0) return <p className="text-gray-400">No projects found.</p>;

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Featured Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {repos.map((repo) => (
                    <ProjectCard
                        key={repo.id}
                        name={repo.name}
                        description={repo.description}
                        languages={repo.languages}
                        githubUrl={repo.html_url}
                        liveUrl={repo.homepage || null}
                    />
                ))}
            </div>
        </section>
    );
}