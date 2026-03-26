import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect("/admin/login");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/posts" className="font-semibold text-white">
              Posts
            </Link>
            <Link href="/blog" className="text-neutral-400 hover:text-white">
              View blog
            </Link>
            <Link href="/" className="text-neutral-400 hover:text-white">
              Home
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </>
  );
}
