import { NextResponse } from "next/server";
import { aggregateNewsItems } from "@/lib/news-aggregator";

export const revalidate = 120;

export async function GET() {
  try {
    const items = await aggregateNewsItems();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
