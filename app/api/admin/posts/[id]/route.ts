import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/slug";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json()) as {
    title?: string;
    excerpt?: string | null;
    content?: string;
    coverImage?: string | null;
    tags?: string | null;
    published?: boolean;
    slug?: string;
  };
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let slug = existing.slug;
  if (body.slug != null && body.slug.trim()) {
    const nextSlug = slugify(body.slug);
    if (nextSlug !== existing.slug) {
      const clash = await prisma.post.findUnique({ where: { slug: nextSlug } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
      }
      slug = nextSlug;
    }
  }

  const published =
    body.published !== undefined ? Boolean(body.published) : existing.published;
  let publishedAt = existing.publishedAt;
  if (published && !existing.published) publishedAt = new Date();
  if (!published) publishedAt = null;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      slug,
      title: body.title !== undefined ? String(body.title).trim() : existing.title,
      excerpt: body.excerpt !== undefined ? body.excerpt : existing.excerpt,
      content: body.content !== undefined ? String(body.content) : existing.content,
      coverImage: body.coverImage !== undefined ? body.coverImage : existing.coverImage,
      tags: body.tags !== undefined ? body.tags : existing.tags,
      published,
      publishedAt,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
