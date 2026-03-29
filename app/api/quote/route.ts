import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  analyzeQuote,
  QUOTE_IDEA_MAX_CHARS,
  QUOTE_IDEA_MIN_CHARS,
} from "@/lib/quote-engine";

export async function POST(req: Request) {
  try {
    let body: { name?: string; email?: string; idea?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const idea = String(body.idea ?? "").trim();
    if (!name || !email || !idea) {
      return NextResponse.json({ error: "Name, email, and idea are required." }, { status: 400 });
    }
    if (idea.length < QUOTE_IDEA_MIN_CHARS) {
      return NextResponse.json(
        {
          error: `Please add more detail (at least ${QUOTE_IDEA_MIN_CHARS} characters) so the estimate is useful.`,
        },
        { status: 400 }
      );
    }
    if (idea.length > QUOTE_IDEA_MAX_CHARS) {
      return NextResponse.json(
        { error: `Description is too long (max ${QUOTE_IDEA_MAX_CHARS.toLocaleString()} characters).` },
        { status: 400 }
      );
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
    } catch (err) {
      console.error("[api/quote] quoteRequest.create failed", err);
    }

    return NextResponse.json({
      id: savedId,
      saved: savedId !== null,
      complexityScore: result.complexityScore,
      complexityLabel: result.complexityLabel,
      estimatedPrice: result.estimatedPrice,
      priceRange: result.priceRange,
      refinedBrief: result.refinedBrief,
      breakdown: result.breakdown,
    });
  } catch (err) {
    console.error("[api/quote] POST", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
