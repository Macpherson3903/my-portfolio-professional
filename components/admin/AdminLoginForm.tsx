"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Login failed");
        return;
      }
      const from = searchParams.get("from") || "/admin/posts";
      router.push(from);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-sm text-neutral-500 hover:text-white mb-8">
        Back to site
      </Link>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border border-white/10 rounded-xl p-8 bg-neutral-950"
      >
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="text-sm text-neutral-400">Enter the admin secret from your environment.</p>
        <input
          type="password"
          autoComplete="off"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600/50"
          placeholder="Secret"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
