import Link from "next/link";
import { FaBookOpen, FaLightbulb, FaShieldAlt } from "react-icons/fa";

const picks = [
  {
    title: "Technical writing",
    description: "Longer-form notes on shipping production apps, performance, and developer workflow.",
    href: "/blog",
    icon: FaBookOpen,
    cta: "Open blog",
  },
  {
    title: "Discovery-first delivery",
    description: "Clarify scope early, ship in milestones, and keep communication tight so launches stay predictable.",
    href: "/quote",
    icon: FaLightbulb,
    cta: "Plan a project",
  },
  {
    title: "Production habits",
    description: "Typed APIs, sensible testing, accessible UI, and observability so your product survives real traffic.",
    href: "/projects",
    icon: FaShieldAlt,
    cta: "Browse work",
  },
];

export default function RecommendedSection() {
  return (
    <section className="py-20 px-6 bg-linear-to-b from-black via-neutral-950/90 to-black border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-red-500 font-mono text-xs uppercase tracking-widest mb-2">Recommended</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How we keep momentum</h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            A few practices I recommend for serious product work — whether you hire me or grow your own team.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {picks.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="group rounded-2xl border border-white/10 bg-neutral-950/60 p-6 md:p-7 hover:border-red-900/40 hover:bg-neutral-950 transition duration-300 flex flex-col"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-950/40 text-red-400 border border-red-900/30">
                  <Icon className="text-lg" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-100 transition">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed flex-1 mb-5">{item.description}</p>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-red-400 hover:text-red-300 inline-flex items-center gap-1 w-fit"
                >
                  {item.cta}
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
