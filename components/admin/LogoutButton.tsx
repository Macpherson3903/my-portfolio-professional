"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="text-sm text-neutral-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5"
    >
      Log out
    </button>
  );
}
