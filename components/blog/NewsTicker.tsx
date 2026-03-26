"use client";

import { useEffect, useState } from "react";

type Item = { id: string; category: string; text: string };

export default function NewsTicker() {
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const data = (await res.json()) as Item[];
        if (!cancelled && Array.isArray(data)) setItems(data);
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const line = err || !items.length ? "News feed loading…" : items.map((i) => i.text).join("   •   ");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md text-xs md:text-sm text-neutral-300 overflow-hidden"
      role="region"
      aria-label="Market and economy ticker"
    >
      <div className="flex items-center gap-3 px-3 py-2 max-w-7xl mx-auto">
        <span className="shrink-0 uppercase tracking-wider text-[10px] md:text-xs text-red-500 font-semibold px-2 py-0.5 rounded border border-red-900/50 bg-red-950/30">
          Live
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max blog-marquee">
            <span className="pr-16 whitespace-nowrap">{line}</span>
            <span className="pr-16 whitespace-nowrap" aria-hidden>
              {line}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
