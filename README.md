# Portfolio

Next.js portfolio with projects (Prisma + PostgreSQL), rule-based quotes, blog with admin posting, and a market/economy news ticker on blog pages.

## Setup

1. Create a **PostgreSQL** database ([Neon](https://neon.tech), [Supabase](https://supabase.com), or local Postgres).

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` to your Postgres connection string (include `?sslmode=require` for cloud providers).

4. Set `NEXT_PUBLIC_SITE_URL` to your public URL (e.g. `https://macpherson.vercel.app`) for Open Graph and canonical links. Add the same variable in Vercel.

5. Set admin and session secrets (use long random strings in production):

```env
ADMIN_SECRET="your-admin-login-secret"
SESSION_SECRET="your-cookie-signing-secret"
```

6. Create tables and seed sample data:

```bash
npm run db:push
npm run db:seed
```

7. Run the dev server:

```bash
npm run dev
```

## Deploy on Vercel

SQLite **does not work** on Vercel (no persistent writable database file). Use a hosted Postgres URL for `DATABASE_URL`.

1. In the Vercel project **Settings → Environment Variables**, add:
   - `DATABASE_URL` — Postgres connection string (Neon/Supabase/Vercel Postgres)
   - `NEXT_PUBLIC_SITE_URL` — your live site URL (e.g. `https://macpherson.vercel.app`)
   - `ADMIN_SECRET` — admin login password
   - `SESSION_SECRET` — cookie signing secret (different from `ADMIN_SECRET`)

2. After the first deploy, apply the schema to the **production** database (from your machine, with prod `DATABASE_URL` in `.env` or inline):

   ```bash
   npx prisma db push
   npm run db:seed
   ```

3. Redeploy if the app errored before the database existed.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run db:push` | Apply Prisma schema to the database |
| `npm run db:seed` | Seed projects and sample post |

## Routes

- `/` — Home with featured projects
- `/projects` — All projects (search & sort)
- `/projects/[slug]` — Project detail
- `/quote` — Indicative quote (min $150)
- `/blog` — Published posts
- `/blog/[slug]` — Post (Markdown) + news ticker
- `/admin/login` — Admin login (`ADMIN_SECRET`)
- `/admin/posts` — Manage posts (CRUD, publish)

This is a [Next.js](https://nextjs.org) project using the App Router, Tailwind CSS v4, and Prisma ORM.
