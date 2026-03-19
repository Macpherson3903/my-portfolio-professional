"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-neutral-950 p-8 rounded-lg">
        
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          <Image
            src="/assets/about.webp"
            alt="Developer workspace showcasing code on a modern screen"
            width={500}
            height={400}
            className="rounded-2xl shadow-lg w-full h-auto object-cover"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Building Scalable Digital Experiences
          </h2>

          <p className="text-gray-400 leading-relaxed">
            I’m a frontend developer focused on crafting modern, high-performance web applications with clean and scalable architecture. I specialize in transforming ideas into responsive, user-centered digital products using tools like React and Next.js. Beyond development, I collaborate with startups and teams to build solutions that are not just functional, but impactful and growth-driven.
          </p>
        </motion.div>

      </div>
    </section>
  );
}