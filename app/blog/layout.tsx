import NewsTicker from "@/components/blog/NewsTicker";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NewsTicker />
    </>
  );
}
