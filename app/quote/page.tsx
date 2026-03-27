import SiteShell from "@/components/SiteShell";
import QuoteForm from "@/components/QuoteForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quote",
  description: "Get an indicative quote based on your project description.",
};

export default function QuotePage() {
  return (
    <SiteShell>
      <main className="bg-black pt-8 pb-12 px-6">
        <div className="max-w-5xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Request a quote</h1>
          <p className="text-neutral-400 max-w-2xl">
            Share your idea. The system analyzes scope signals and returns a structured brief plus an indicative price
            band. Minimum engagement starts at $150.
          </p>
        </div>
        <QuoteForm />
      </main>
    </SiteShell>
  );
}
