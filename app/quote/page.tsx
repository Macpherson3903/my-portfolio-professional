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
      <main className="bg-black pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">Request a quote</h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
            Share your idea. The system analyzes scope signals and returns a structured brief plus an indicative price
            band. Minimum engagement starts at $150.
          </p>
        </div>
        <QuoteForm />
      </main>
    </SiteShell>
  );
}
