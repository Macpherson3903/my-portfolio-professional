"use client";

import { useEffect, useRef, useState } from "react";
import MarkdownPost from "@/components/blog/MarkdownPost";
import { MIN_QUOTE_USD, QUOTE_IDEA_MIN_CHARS, QUOTE_IDEA_MAX_CHARS } from "@/lib/quote-engine";
import type { QuoteBreakdownItem } from "@/lib/quote-engine";

type QuoteResponse = {
  id?: string | null;
  saved?: boolean;
  refinedBrief: string;
  complexityLabel: string;
  complexityScore: number;
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  breakdown?: QuoteBreakdownItem[];
};

export default function QuoteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setResult(null);

    const trimmed = idea.trim();
    if (trimmed.length < QUOTE_IDEA_MIN_CHARS) {
      setError(`Please write at least ${QUOTE_IDEA_MIN_CHARS} characters so we can estimate scope.`);
      return;
    }
    if (trimmed.length > QUOTE_IDEA_MAX_CHARS) {
      setError(`Please shorten your description (max ${QUOTE_IDEA_MAX_CHARS.toLocaleString()} characters).`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), idea: trimmed }),
      });

      let data: QuoteResponse & { error?: string } = {} as QuoteResponse & { error?: string };
      try {
        data = (await res.json()) as QuoteResponse & { error?: string };
      } catch {
        setError(res.ok ? "Unexpected response from server." : `Request failed (${res.status}).`);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const ideaLen = idea.trim().length;
  const ideaTooShort = ideaLen > 0 && ideaLen < QUOTE_IDEA_MIN_CHARS;
  const ideaTooLong = ideaLen > QUOTE_IDEA_MAX_CHARS;

  return (
    <div className="max-w-3xl mx-auto grid gap-8 md:gap-10">
      <form
        onSubmit={onSubmit}
        className="space-y-5 md:space-y-6 bg-neutral-950 border border-white/10 rounded-xl p-5 sm:p-6 md:p-8"
      >
        <div>
          <h2 className="text-xl font-semibold mb-2">Project details</h2>
          <p className="text-sm text-neutral-400">
            Describe your idea in detail. Minimum indicative quote is <strong>${MIN_QUOTE_USD}</strong> USD; complexity
            increases from there.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm min-w-0">
            <span className="text-neutral-400 mb-1 block">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-w-0 bg-black border border-neutral-700 rounded-lg px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50"
            />
          </label>
          <label className="block text-sm min-w-0">
            <span className="text-neutral-400 mb-1 block">Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-w-0 bg-black border border-neutral-700 rounded-lg px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-neutral-400 mb-1 flex flex-wrap items-center justify-between gap-2">
            <span>What do you want to build?</span>
            <span
              className={
                ideaTooLong
                  ? "text-red-400 text-xs font-normal tabular-nums"
                  : ideaTooShort
                    ? "text-amber-400/90 text-xs font-normal tabular-nums"
                    : "text-neutral-500 text-xs font-normal tabular-nums"
              }
            >
              {ideaLen.toLocaleString()} / {QUOTE_IDEA_MAX_CHARS.toLocaleString()}
              {ideaTooShort ? ` (min ${QUOTE_IDEA_MIN_CHARS})` : ""}
            </span>
          </span>
          <textarea
            required
            rows={8}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Goals, users, platforms, integrations, timeline…"
            maxLength={QUOTE_IDEA_MAX_CHARS}
            className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-y min-h-[160px] max-h-[min(70vh,520px)]"
          />
        </label>
        {error && (
          <p className="text-sm text-red-400 leading-relaxed" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || ideaTooLong}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-red-600 text-white text-base sm:text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition"
        >
          {loading ? "Analyzing…" : "Get estimate"}
        </button>
      </form>

      {result && (
        <div
          ref={resultRef}
          className="bg-neutral-950 border border-white/10 rounded-xl p-5 sm:p-6 md:p-8 space-y-4 scroll-mt-24"
        >
          {result.saved === false && (
            <p
              className="text-sm rounded-lg border border-amber-500/35 bg-amber-950/25 text-amber-100/95 px-3 py-2.5"
              role="status"
            >
              Your estimate is ready below, but we couldn&apos;t save this request to the database. You can still reach
              out by email if you need a follow-up.
            </p>
          )}
          {result.saved === true && (
            <p className="text-sm rounded-lg border border-emerald-900/50 bg-emerald-950/20 text-emerald-200/95 px-3 py-2.5" role="status">
              Request received. We have your brief on file and may follow up at the email you provided.
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-200 w-fit">
              {result.complexityLabel} · score {result.complexityScore}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-red-950/50 text-red-200 border border-red-900/50 w-fit">
              ${result.priceRange.min.toLocaleString()} – ${result.priceRange.max.toLocaleString()} USD
              <span className="text-red-300/70 font-normal"> (indicative)</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-white/10 w-fit">
              Midpoint ~${result.estimatedPrice.toLocaleString()}
            </span>
          </div>

          {result.breakdown?.length ? (
            <details className="text-sm border border-white/10 rounded-lg bg-black/40 px-3 py-2">
              <summary className="cursor-pointer text-neutral-300 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 rounded">
                How this estimate was calculated
              </summary>
              <ul className="mt-3 space-y-1.5 text-neutral-400 list-none pl-0">
                {result.breakdown.map((b, i) => (
                  <li key={i} className="flex justify-between gap-3 border-b border-white/5 pb-1.5 last:border-0">
                    <span className="min-w-0">{b.label}</span>
                    <span className="tabular-nums text-neutral-500 shrink-0">{b.points > 0 ? `+${b.points}` : b.points}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <MarkdownPost content={result.refinedBrief} variant="compact" />
          <p className="text-xs text-neutral-500 leading-relaxed">
            Indicative only. Final scope and pricing are confirmed after discovery.
          </p>
        </div>
      )}
    </div>
  );
}
