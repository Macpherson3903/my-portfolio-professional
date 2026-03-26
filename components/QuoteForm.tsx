"use client";

import { useState } from "react";
import { MIN_QUOTE_USD } from "@/lib/quote-engine";

type QuoteResponse = {
  refinedBrief: string;
  complexityLabel: string;
  complexityScore: number;
  estimatedPrice: number;
  priceRange: { min: number; max: number };
};

export default function QuoteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, idea }),
      });
      const data = (await res.json()) as QuoteResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto grid gap-10 lg:grid-cols-1">
      <form onSubmit={onSubmit} className="space-y-6 bg-neutral-950 border border-white/10 rounded-xl p-6 md:p-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Project details</h2>
          <p className="text-sm text-neutral-400">
            Describe your idea in detail. Minimum indicative quote is <strong>${MIN_QUOTE_USD}</strong> USD; complexity
            increases from there.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-neutral-400 mb-1 block">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600/50"
            />
          </label>
          <label className="block text-sm">
            <span className="text-neutral-400 mb-1 block">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600/50"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-neutral-400 mb-1 block">What do you want to build?</span>
          <textarea
            required
            rows={8}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Goals, users, platforms, integrations, timeline…"
            className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-y min-h-[160px]"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition"
        >
          {loading ? "Analyzing…" : "Get estimate"}
        </button>
      </form>

      {result && (
        <div className="bg-neutral-950 border border-white/10 rounded-xl p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-200">
              Complexity: {result.complexityLabel} ({result.complexityScore})
            </span>
            <span className="px-3 py-1 rounded-full bg-red-950/50 text-red-300 border border-red-900/50">
              Estimate: ${result.priceRange.min.toLocaleString()} – ${result.priceRange.max.toLocaleString()} USD
            </span>
          </div>
          <div className="markdown text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">{result.refinedBrief}</div>
          <p className="text-xs text-neutral-500">
            Indicative only. Final scope and pricing are confirmed after discovery.
          </p>
        </div>
      )}
    </div>
  );
}
