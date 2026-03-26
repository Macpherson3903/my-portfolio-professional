"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Initial = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  published: boolean;
};

const empty: Initial = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  published: false,
};

export default function PostEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<Initial>(initial ?? empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setError(null);
    setLoading(true);
    try {
      if (isEdit && initial?.id) {
        const res = await fetch(`/api/admin/posts/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt || null,
            content: form.content,
            coverImage: form.coverImage || null,
            tags: form.tags || null,
            published: form.published,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return;
        }
      } else {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug || undefined,
            excerpt: form.excerpt || undefined,
            content: form.content,
            coverImage: form.coverImage || undefined,
            tags: form.tags || undefined,
            published: form.published,
          }),
        });
        const data = (await res.json()) as { error?: string; id?: string };
        if (!res.ok) {
          setError(data.error ?? "Create failed");
          return;
        }
        if (data.id) {
          router.push(`/admin/posts/${data.id}/edit`);
          router.refresh();
          return;
        }
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!initial?.id || !confirm("Delete this post?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Delete failed");
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-neutral-400">Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-1 w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-neutral-400">Slug</span>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="mt-1 w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            placeholder="auto from title if empty"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-neutral-400">Excerpt</span>
        <input
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className="mt-1 w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-neutral-400">Cover image URL</span>
        <input
          value={form.coverImage}
          onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
          className="mt-1 w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-neutral-400">Tags (comma-separated)</span>
        <input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="mt-1 w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-neutral-400">Content (Markdown)</span>
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          rows={18}
          className="mt-1 w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 font-mono text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
        />
        Published
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void save()}
          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        {isEdit && (
          <button
            type="button"
            disabled={loading}
            onClick={() => void remove()}
            className="px-5 py-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-950/30"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
