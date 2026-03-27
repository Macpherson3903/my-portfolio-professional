import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeQuote } from "@/lib/quote-engine";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      idea?: string;
    };
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const idea = String(body.idea ?? "").trim();
    if (!name || !email || !idea) {
      return NextResponse.json({ error: "Name, email, and idea are required." }, { status: 400 });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const result = analyzeQuote(idea);
    let savedId: string | null = null;
    try {
      const saved = await prisma.quoteRequest.create({
        data: {
          name,
          email,
          rawIdea: idea,
          refinedBrief: result.refinedBrief,
          complexityScore: result.complexityScore,
          estimatedPrice: result.estimatedPrice,
          breakdown: JSON.stringify(result.breakdown),
          status: "new",
        },
      });
      savedId = saved.id;
    } catch {
      /* DB unavailable — still return the estimate */
    }

    return NextResponse.json({
      id: savedId,
      complexityScore: result.complexityScore,
      complexityLabel: result.complexityLabel,
      estimatedPrice: result.estimatedPrice,
      priceRange: result.priceRange,
      refinedBrief: result.refinedBrief,
      breakdown: result.breakdown,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
