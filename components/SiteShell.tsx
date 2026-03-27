import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 w-full">{children}</div>
      <SiteFooter />
    </div>
  );
}
