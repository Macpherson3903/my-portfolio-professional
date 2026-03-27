import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Quote", href: "/quote" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-neutral-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-5 py-12 pb-20 md:pb-16 lg:pb-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-md">
            <p className="font-mono font-bold text-white tracking-wide uppercase text-sm mb-2">Macpherson</p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Full stack development — web apps, APIs, and polished UIs. Built with React, Next.js, and modern
              tooling.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500/90 mb-4">Quick links</p>
            <nav aria-label="Footer">
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-neutral-400 hover:text-white transition border-b border-transparent hover:border-red-500/50 pb-0.5 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-neutral-500">
          <p>© {year} Macpherson Dieze. All rights reserved.</p>
          <p className="text-neutral-600">Crafted with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
