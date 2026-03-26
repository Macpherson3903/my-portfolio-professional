import NewsTicker from "@/components/blog/NewsTicker";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex-1 pb-20">{children}</div>
      <NewsTicker />
    </div>
  );
}
