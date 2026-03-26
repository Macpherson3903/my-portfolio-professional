import Header from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-black">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Contact</h1>
        <p className="text-neutral-400 text-center max-w-md mb-8">
          Prefer email or request a quote for project work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:macpherson885@gmail.com"
            className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition text-center"
          >
            Email
          </a>
          <Link
            href="/quote"
            className="px-6 py-3 rounded-full border border-neutral-600 text-white hover:bg-neutral-900 transition text-center"
          >
            Get a quote
          </Link>
        </div>
        <p className="text-neutral-500 text-sm mt-10">Phone: 08069052314</p>
      </section>
    </>
  );
}
