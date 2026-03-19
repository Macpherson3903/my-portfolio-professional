"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["Developer", "React Developer", "Next.js Developer", "MongoDB Developer"];

export default function HeroSection() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (charIndex < currentWord.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + currentWord[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setText("");
        setCharIndex(0);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, wordIndex]);

  return (
    <section className="relative w-full min-h-[85vh]  flex items-center justify-center overflow-hidden">
      {/* Mobile Background */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/assets/hero-img.webp"
          alt="Hero background"
          fill
          priority
          className="object-cover opacity-15"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex max-w-lg flex-col gap-4"
        >
          <p className="text-base tracking-wide">
            FullStack{" "}
            <span className="text-red-500 font-bold">{text}</span>
          </p>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            I build scalable web applications
            <br />
            with modern technologies
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed">
            I’m a fullstack developer focused on building fast, responsive, and
            user-friendly applications using modern tools like React and
            Next.js.
          </p>

          <div className="flex gap-3 mt-2">
            <Link
              href="/projects"
              className="bg-neutral-950 text-white px-5 py-2.5 rounded-full font-medium shadow-md shadow-neutral-800 hover:bg-transparent hover:text-neutral-300 border border-neutral-800 transition"
            >
              Projects
            </Link>

            <Link
              href="/contact"
              className="border border-neutral-700 px-5 py-2.5 rounded-full font-medium text-white hover:bg-neutral-900 transition"
            >
              Contact
            </Link>
          </div>
        </motion.div>

        {/* Desktop Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex items-center justify-center max-w-[45%]"
        >
          <Image
            src="/assets/hero-img.webp"
            width={450}
            height={400}
            alt="Hero image of macpherson"
            priority
            className="object-contain max-h-[70vh] w-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}