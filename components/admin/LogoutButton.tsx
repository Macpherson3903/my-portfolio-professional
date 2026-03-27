"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    window.location.assign("/admin/login");
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
