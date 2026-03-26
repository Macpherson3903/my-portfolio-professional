import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    tags?: string;
    published?: boolean;
    slug?: string;
  };
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }
  const baseSlug = body.slug?.trim() ? slugify(body.slug) : slugify(title);
  let slug = baseSlug;
  let n = 0;
  while (await prisma.post.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  const published = Boolean(body.published);
  const post = await prisma.post.create({
    data: {
      slug,
      title,
      excerpt: body.excerpt?.trim() || null,
      content,
      coverImage: body.coverImage?.trim() || null,
      tags: body.tags?.trim() || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });
  return NextResponse.json(post);
}
