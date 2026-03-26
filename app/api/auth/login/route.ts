import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";
import { getAdminSecret } from "@/lib/auth-session";

export async function POST(req: Request) {
  const body = (await req.json()) as { secret?: string };
  const secret = String(body.secret ?? "");
  const expected = getAdminSecret();
  if (!expected) {
    return NextResponse.json({ error: "Server not configured ADMIN_SECRET" }, { status: 500 });
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
