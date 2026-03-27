import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogCardCharts } from "@/lib/news-detail";
import type { NewsTickerItem } from "@/lib/news-aggregator";
import MiniSparkline from "./MiniSparkline";

type BlogNewsCardsProps = {
  items: NewsTickerItem[];
  charts: BlogCardCharts;
};

function Card({
  title,
  subtitle,
  href,
  lines,
  chartContent,
}: {
  title: string;
  subtitle: string;
  href: string;
  lines: string[];
  chartContent: React.ReactNode;
}) {
  const preview = lines.slice(0, 2);

  return (
    <article className="rounded-xl border border-white/10 bg-neutral-950/70 p-4 flex flex-col shadow-md shadow-black/20">
      <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest mb-0.5">{subtitle}</p>
      <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
      <ul className="space-y-1 text-xs text-neutral-400 mb-2 min-h-0">
        {preview.map((line, i) => (
          <li key={i} className="leading-snug line-clamp-2 border-l-2 border-red-900/40 pl-2">
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-1 border-t border-white/5">{chartContent}</div>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 w-fit"
      >
        View full data
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export default function BlogNewsCards({ items, charts }: BlogNewsCardsProps) {
  const crypto = items.filter((i) => i.category === "crypto").map((i) => i.text);
  const stocks = items.filter((i) => i.category === "finance").map((i) => i.text);
  const economy = items.filter((i) => i.category === "economy").map((i) => i.text);

  const cryptoLines = crypto.length ? crypto : ["Crypto data temporarily unavailable."];
  const stockLines = stocks.length ? stocks : ["Market headlines unavailable."];
  const economyLines = economy.length ? economy : ["Economy data temporarily unavailable."];

  return (
    <section className="mb-12" aria-label="Market snapshot">
      <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-3">Live snapshot</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Card
          title="Crypto"
          subtitle="Digital assets"
          href="/blog/news/crypto"
          lines={cryptoLines}
          chartContent={
            <div className="space-y-1.5">
              {charts.crypto.length ? (
                charts.crypto.map((c) => (
                  <div key={c.symbol} className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500 w-8 shrink-0">{c.symbol}</span>
                    <MiniSparkline values={c.prices} className="flex-1" />
                  </div>
                ))
              ) : (
                <MiniSparkline values={[]} />
              )}
            </div>
          }
        />
        <Card
          title="Stocks"
          subtitle="US markets"
          href="/blog/news/stocks"
          lines={stockLines}
          chartContent={
            <div className="space-y-1.5">
              {charts.stocks.length ? (
                charts.stocks.map((s) => (
                  <div key={s.symbol} className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500 w-9 shrink-0">{s.symbol}</span>
                    <MiniSparkline values={s.prices} color="#60a5fa" className="flex-1" />
                  </div>
                ))
              ) : (
                <MiniSparkline values={[]} />
              )}
            </div>
          }
        />
        <Card
          title="Economy"
          subtitle="Macro"
          href="/blog/news/economy"
          lines={economyLines}
          chartContent={
            charts.economy?.points?.length ? (
              <MiniSparkline values={charts.economy.points.map((p) => p.value)} color="#a78bfa" />
            ) : (
              <MiniSparkline values={[]} />
            )
          }
        />
      </div>
    </section>
  );
}
