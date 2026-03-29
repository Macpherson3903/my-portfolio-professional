import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const compactClasses = [
  "space-y-2.5 text-neutral-300 leading-relaxed text-sm",
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2",
  "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2",
  "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5",
  "[&_p]:mb-2",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_a]:text-red-400 [&_a]:underline",
  "[&_code]:text-xs [&_code]:bg-neutral-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
  "[&_pre]:bg-neutral-950 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-xs",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-red-900/60 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-400",
].join(" ");

const defaultClasses = [
  "space-y-4 text-neutral-300 leading-relaxed",
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4",
  "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3",
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2",
  "[&_p]:mb-3",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_a]:text-red-400 [&_a]:underline",
  "[&_code]:text-sm [&_code]:bg-neutral-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
  "[&_pre]:bg-neutral-950 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-red-900/60 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-400",
].join(" ");

type Props = { content: string; variant?: "default" | "compact" };

export default function MarkdownPost({ content, variant = "default" }: Props) {
  return (
    <div className={variant === "compact" ? compactClasses : defaultClasses}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
