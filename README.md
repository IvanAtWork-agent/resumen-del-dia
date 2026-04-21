# El Resumen del Día

A daily news digest for Spanish citizens. Aggregates RSS feeds from major Spanish and international
outlets, selects the 10–25 most important stories per day using a relevance scoring algorithm, and
presents them in a clean editorial website. A backoffice allows historical navigation and source
management.

![Screenshot placeholder — run the app and open http://localhost:5173]

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** 15+

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd el-resumen-del-dia

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string

# 4. Run database migrations
pnpm db:migrate

# 5. Seed RSS sources (18 sources)
pnpm db:seed

# 6. Start the development servers
pnpm dev
```

---

## Accessing the App

| Service      | URL                                                        |
|--------------|------------------------------------------------------------|
| Public site  | http://localhost:5173                                      |
| Backoffice   | http://localhost:5173/admin                                |
| API          | http://localhost:3001                                      |
| API health   | http://localhost:3001/api/health                           |
| Prisma Studio| `pnpm db:studio` → http://localhost:5555                   |

---

## Manually Trigger a Digest

```bash
curl -X POST http://localhost:3001/api/admin/digest/generate
```

Or use the **Dashboard** button in the backoffice at `/admin/dashboard`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     El Resumen del Día                       │
├──────────────────────┬──────────────────────────────────────┤
│   apps/client        │   apps/server                         │
│   React 18 + Vite    │   Node.js 20 + Express                │
│   Tailwind CSS       │                                       │
│   React Router v6    │   ┌──────────────────────────────┐   │
│                      │   │  Pipeline (daily cron 07:00) │   │
│   Pages:             │   │  1. feedFetcher              │   │
│   / (today)          │   │     └─ 18 RSS feeds via      │   │
│   /historico         │   │        rss-parser            │   │
│   /admin/*           │   │  2. deduplicator             │   │
│                      │   │     └─ Jaccard + union-find  │   │
│   API calls via      │   │  3. categoryDetector         │   │
│   Axios →            │   │     └─ keyword matching      │   │
│                      │   │  4. relevanceScorer          │   │
│                      │   │     └─ weight+coverage+time  │   │
│                      │   │  5. digestGenerator          │   │
│                      │   │     └─ writes to PostgreSQL  │   │
│                      │   └──────────────────────────────┘   │
│                      │                                       │
│                      │   REST API:                           │
│                      │   GET  /api/digest/today              │
│                      │   GET  /api/digest/:date              │
│                      │   GET  /api/digest/history            │
│                      │   POST /api/admin/digest/generate     │
│                      │   CRUD /api/admin/sources             │
│                      │   GET  /api/admin/logs                │
│                      │   GET  /api/admin/stats               │
├──────────────────────┴──────────────────────────────────────┤
│               packages/db (Prisma 5 + PostgreSQL)           │
│   RssSource · DailyDigest · NewsArticle · FetchLog          │
└─────────────────────────────────────────────────────────────┘
```

---

## Scripts

| Command          | Description                                        |
|------------------|----------------------------------------------------|
| `pnpm dev`       | Start client (5173) and server (3001) concurrently |
| `pnpm build`     | Build client and server for production             |
| `pnpm db:migrate`| Run Prisma migrations                              |
| `pnpm db:seed`   | Seed 18 RSS sources                                |
| `pnpm db:studio` | Open Prisma Studio (DB GUI)                        |
| `pnpm lint`      | ESLint all TypeScript files in apps/               |

---

## Adding RSS Sources

**Via backoffice**: Navigate to `/admin/sources` → click **Añadir fuente**.

**Via seed file**: Edit `packages/db/prisma/seed.ts`, add your source to the array,
then run `pnpm db:seed` again (uses upsert — safe to re-run).

---

## Deployment

### Client → Vercel

```bash
cd apps/client
# Set VITE_API_URL=https://your-server.railway.app in Vercel env vars
# Build command: pnpm build
# Output directory: dist
```

### Server + Database → Railway or Render

1. Create a PostgreSQL database service.
2. Create a Node.js service pointing to `apps/server`.
3. Set environment variables: `DATABASE_URL`, `PORT`, `NODE_ENV=production`, `CORS_ORIGIN`.
4. Add a start command: `pnpm db:migrate && node dist/index.js`
5. Build command: `pnpm install && pnpm --filter server build`

---

## How It Works

1. **07:00 Europe/Madrid** — cron job triggers the full pipeline
2. Fetches all active RSS feeds concurrently (10s timeout per feed)
3. Deduplicates stories using Jaccard similarity on stemmed Spanish titles
4. Detects categories from keywords when not provided by the feed
5. Scores each story: authority weight × 8 + coverage bonus + recency bonus
6. Applies per-category caps and selects the top 25 stories
7. Writes a single `DailyDigest` with all `NewsArticle` rows in one transaction
8. Public API returns the digest; clients display it sorted by relevance score

A fallback cron at **08:00** regenerates the digest if the primary job failed.
