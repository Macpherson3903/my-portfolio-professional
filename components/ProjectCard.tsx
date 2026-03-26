"use client";
import Link from "next/link";

interface ProjectCardProps {
  name: string;
  slug?: string;
  description: string | null;
  languages: string[];
  githubUrl: string;
  liveUrl?: string | null;
}

export default function ProjectCard({
  name,
  slug,
  description,
  languages,
  githubUrl,
  liveUrl,
}: ProjectCardProps) {
  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-400 mb-3">{description || "No description provided."}</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span key={lang} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-sm">
              {lang}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 items-center">
        {slug && (
          <Link href={`/projects/${slug}`} className="text-red-400 hover:underline">
            Details
          </Link>
        )}
        {githubUrl && githubUrl !== "#" && (
          <Link href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            GitHub
          </Link>
        )}
        {liveUrl && (
          <Link href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
            Live
          </Link>
        )}
      </div>
    </div>
  );
}
