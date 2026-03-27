import Link from "next/link";

export default function QuoteCTASection() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto rounded-3xl border border-red-900/35 bg-linear-to-br from-red-950/30 via-neutral-950 to-black px-8 py-12 md:px-14 md:py-14 text-center shadow-[0_0_60px_-20px_rgba(220,38,38,0.35)]">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
          Ready to shape your idea into a real product?
        </h2>
        <p className="text-neutral-300 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          Share a short brief — you’ll get a structured summary plus an indicative quote range. No pressure, no spam.
          Minimum engagement starts at <span className="text-white font-semibold">$150</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/quote"
            className="w-full sm:w-auto inline-flex justify-center px-8 py-3.5 rounded-full bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition shadow-lg shadow-red-900/30"
          >
            Get a free estimate
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex justify-center px-8 py-3.5 rounded-full border border-neutral-600 text-neutral-200 font-medium text-sm hover:bg-neutral-900 transition"
          >
            Contact me directly
          </Link>
        </div>
      </div>
    </section>
  );
}
