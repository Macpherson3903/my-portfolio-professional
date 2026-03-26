# Portfolio

Next.js portfolio with projects (Prisma + SQLite), rule-based quotes, blog with admin posting, and a market/economy news ticker on blog pages.

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` (SQLite):

```env
DATABASE_URL="file:./dev.db"
```

3. Set admin and session secrets (use long random strings in production):

```env
ADMIN_SECRET="your-admin-login-secret"
SESSION_SECRET="your-cookie-signing-secret"
```

4. Create the database and seed sample data:

```bash
npm run db:push
npm run db:seed
```

5. Run the dev server:

```bash
npm run dev
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run db:push` | Apply Prisma schema to SQLite |
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

## Deploy notes

- Use a hosted database (e.g. Postgres) for production; update `DATABASE_URL` and `provider` in `prisma/schema.prisma`.
- Set `ADMIN_SECRET` and `SESSION_SECRET` in the host environment.
- Run migrations or `db push` as appropriate for your provider.

This is a [Next.js](https://nextjs.org) project using the App Router, Tailwind CSS v4, and Prisma ORM.
