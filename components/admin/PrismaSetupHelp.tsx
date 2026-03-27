import Link from "next/link";

type Props = {
  /** Shown only in development to help debug */
  technicalDetail?: string;
};

export default function PrismaSetupHelp({ technicalDetail }: Props) {
  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-6 text-sm text-amber-100/95 leading-relaxed">
      <p className="font-medium text-amber-50">Could not load posts from the database.</p>
      <p className="text-amber-100/80">
        On Vercel, confirm <code className="rounded bg-black/40 px-1 py-0.5">DATABASE_URL</code> and{" "}
        <code className="rounded bg-black/40 px-1 py-0.5">DATABASE_POSTGRES_PRISMA_URL</code> match your Neon database.
        Then apply the schema and seed from a machine with those env vars:
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-amber-100/75">
        <li>
          Run <code className="rounded bg-black/40 px-1">npx prisma db push</code> against the same DB Vercel uses.
        </li>
        <li>
          Optionally run <code className="rounded bg-black/40 px-1">npm run db:setup</code> or{" "}
          <code className="rounded bg-black/40 px-1">npx prisma db seed</code>.
        </li>
      </ol>
      <p className="text-amber-100/75">
        <Link href="/admin/posts" className="text-red-400 hover:underline">
          Retry
        </Link>
        {" · "}
        <Link href="/blog" className="text-red-400 hover:underline">
          Public blog
        </Link>
      </p>
      {technicalDetail ? (
        <p className="font-mono text-xs text-neutral-400 break-all border-t border-white/10 pt-4">{technicalDetail}</p>
      ) : null}
    </div>
  );
}
