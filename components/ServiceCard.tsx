"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaReact, FaNodeJs, FaMobileAlt, FaDatabase, FaFigma, FaJs } from "react-icons/fa";

interface ServiceCardProps {
  title: string;
  description: string;
  tags: string[];
}

const tagIcons: Record<string, JSX.Element> = {
  "React": <FaReact className="inline-block mr-1" />,
  "Next.js": <FaJs className="inline-block mr-1" />,
  "Node.js": <FaNodeJs className="inline-block mr-1" />,
  "TypeScript": <FaJs className="inline-block mr-1" />,
  "React Native": <FaMobileAlt className="inline-block mr-1" />,
  "Expo": <FaMobileAlt className="inline-block mr-1" />,
  "MongoDB": <FaDatabase className="inline-block mr-1" />,
  "Figma": <FaFigma className="inline-block mr-1" />,
  "TailwindCSS": <FaJs className="inline-block mr-1" />,
  "Framer Motion": <FaJs className="inline-block mr-1" />,
};

export default function ServiceCard({ title, description, tags }: ServiceCardProps) {
  return (
    <motion.div
      className="relative flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 opacity-100 md:opacity-70 hover:opacity-100"
      style={{ background: "linear-gradient(to right, #1a1a1a 0%, #1f1f1f 100%)" }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <FaReact className="absolute top-4 right-4 text-blue-600 opacity-10 text-7xl pointer-events-none" />

      <h3 className="text-xl font-semibold mb-2 z-10 relative">{title}</h3>
      <p className="text-neutral-400 mb-4 text-sm z-10 relative">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4 z-10 relative">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-300 flex items-center transition transform hover:scale-105 hover:bg-red-950"
          >
            {tagIcons[tag]} {tag}
          </span>
        ))}
      </div>

      <Link
        href="/quote"
        className="mt-auto w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 text-center transition z-10 relative"
      >
        Get Quote
      </Link>
    </motion.div>
  );
}