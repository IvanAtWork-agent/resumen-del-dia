# El Resumen del Día — Project Documentation

A daily Spanish news digest that aggregates articles from 17 RSS sources, scores them by relevance, and presents them with an AI-generated briefing focused on economy and technology.

---

## Architecture Overview

```
┌─────────────────────┐     HTTPS      ┌──────────────────────┐
│   Vercel (client)   │ ◄────────────► │  Railway (server)    │
│   React + Vite      │                │  Node.js + Express   │
└─────────────────────┘                └──────────┬───────────┘
                                                  │
                               ┌──────────────────┼──────────────┐
                               │                  │              │
                    ┌──────────▼──────┐  ┌────────▼────┐  ┌─────▼──────┐
                    │  Neon (Postgres) │  │  RSS Feeds  │  │  Groq API  │
                    │  via Prisma ORM  │  │  (17 sources│  │  Llama 3.3 │
                    └─────────────────┘  └─────────────┘  └────────────┘
```

**Monorepo structure (pnpm workspaces):**
```
resumen-del-dia/
├── apps/
│   ├── client/          # React frontend (Vite + Tailwind)
│   └── server/          # Express API + cron jobs
└── packages/
    └── db/              # Prisma schema + seed
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL (Neon serverless) via Prisma ORM |
| AI | Groq API — Llama 3.3 70b |
| Package manager | pnpm (workspaces) |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
| Database hosting | Neon |

---

## Features

### Public feed
- Daily digest of the most relevant Spanish news
- Top 3 articles per category, scored by source authority, coverage count, and recency
- AI-generated daily briefing (economy + technology focus) at the top of the feed
- Category filter bar (Todos, Política, Economía, Tecnología, Internacional, Sociedad)
- Featured cards for the top 2 articles, regular grid for the rest
- Broken image fallback to category-coloured placeholder
- Historical digests page

### Admin panel (`/admin`)
- Stats dashboard (total digests, articles, active sources)
- Manual digest regeneration (always force-refreshes)
- RSS source management (create, edit, toggle active, delete)
- Fetch logs with per-source status and error messages

### Automated generation
- Primary cron job: **07:00 Europe/Madrid**
- Fallback cron job: **08:00 Europe/Madrid** (only runs if primary produced no complete digest)

---

## RSS Sources

| Name | Category | Authority |
|------|----------|-----------|
| El País | General | 10 |
| El Mundo | General | 10 |
| ABC | General | 9 |
| La Vanguardia | General | 9 |
| El Confidencial | General | 8 |
| elDiario.es | General | 8 |
| 20minutos | General | 6 |
| Expansión | Economía | 8 |
| El Mundo Economía | Economía | 7 |
| Cinco Días (El País Economía) | Economía | 8 |
| Xataka | Tecnología | 7 |
| El País Tecnología | Tecnología | 8 |
| BBC Mundo | Internacional | 9 |
| Euronews Español | Internacional | 8 |
| France24 Español | Internacional | 8 |
| El Confidencial Internacional | Internacional | 7 |
| La Vanguardia Internacional | Internacional | 7 |

---

## Database Schema

### DailyDigest
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment |
| date | Date (unique) | UTC date of the digest |
| generatedAt | DateTime | Timestamp of generation |
| totalArticles | Int | Number of articles selected |
| status | String | `complete`, `partial`, `error` |
| errorMessage | String? | Error details if failed |
| aiSummary | Text? | AI-generated daily briefing |

### NewsArticle
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment |
| digestId | Int (FK) | References DailyDigest (cascade delete) |
| sourceId | Int (FK) | References RssSource |
| title | String | Article title |
| summary | Text | Article summary (max 500 chars) |
| url | String | Original article URL |
| imageUrl | String? | Article image URL |
| sourceName | String | Name of the source |
| category | String | Detected category |
| publishedAt | DateTime | Publication date |
| relevanceScore | Float | Score 0–100 |
| coverageCount | Int | Number of sources covering same story |

### RssSource
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment |
| name | String | Display name |
| url | String (unique) | RSS feed URL |
| category | String | Default category |
| authorityWeight | Int (1–10) | Source credibility weight |
| isActive | Boolean | Whether to fetch from this source |
| lastFetchedAt | DateTime? | Last successful fetch |
| lastFetchStatus | String? | `ok`, `error`, `empty` |

### FetchLog
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-increment |
| sourceId | Int (FK) | References RssSource |
| fetchedAt | DateTime | When the fetch ran |
| articlesFound | Int | Raw articles in feed |
| articlesUsed | Int | Articles that passed filters |
| status | String | `ok`, `error`, `empty` |
| errorMessage | String? | Error details |
| durationMs | Int? | Fetch duration in milliseconds |

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/digest/today` | Today's digest with articles |
| GET | `/api/digest/history` | Paginated digest history |
| GET | `/api/digest/:date` | Digest for a specific date (YYYY-MM-DD) |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/digest/generate?force=true` | Generate/force-regenerate today's digest |
| GET | `/api/admin/sources` | List all RSS sources |
| POST | `/api/admin/sources` | Create a new source |
| PATCH | `/api/admin/sources/:id` | Update a source |
| DELETE | `/api/admin/sources/:id` | Soft-delete a source |
| GET | `/api/admin/logs` | Fetch logs (paginated, filterable) |
| GET | `/api/admin/stats` | Dashboard statistics |

---

## Digest Generation Pipeline

```
fetchAllFeeds()
    └─ Parallel fetch of all active RSS sources
    └─ OG image fallback if no image in feed
    └─ Writes FetchLog per source

deduplicate()
    └─ Tokenises titles using Porter stemmer (Spanish)
    └─ Groups articles with >50% token overlap
    └─ Keeps highest-authority article as representative

detectCategory()
    └─ Keyword matching against Spanish category vocabulary
    └─ Falls back to source's default category

scoreAndSelect()
    └─ Score = sourceWeight×8 + coverageBonus + recencyBonus
    └─ Cap: top 3 per category (2 for sociedad/tendencias)
    └─ Sort by score descending

generateAISummary()
    └─ Passes top economy + tech + general articles to Groq
    └─ Returns structured briefing in Spanish
    └─ Gracefully skipped if GROQ_API_KEY not set

prisma.$transaction()
    └─ Creates DailyDigest record
    └─ Bulk inserts NewsArticle records
```

---

## Environment Variables

### Railway (server)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL **pooled** connection string |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | Full Vercel URL with `https://` (e.g. `https://resumen-del-dia-client-9pej.vercel.app`) |
| `GROQ_API_KEY` | Groq API key from console.groq.com |

### Vercel (client)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full Railway URL with `https://` (e.g. `https://server-production-cc70.up.railway.app`) |

---

## Deployment

### Railway (server)
**Build command:**
```
pnpm install --no-frozen-lockfile && pnpm --filter @resumen/db generate && pnpm --filter server build
```
**Start command:**
```
cd packages/db && npx prisma migrate deploy && npx prisma db seed && cd ../.. && node apps/server/dist/index.js
```

### Vercel (client)
- Root directory: `apps/client`
- Install command: `cd ../.. && pnpm install`
- Build command: `pnpm run build`
- SPA fallback configured via `apps/client/vercel.json`

---

## Known Limitations & Future Improvements

- **No authentication** on the admin panel — it is public. Adding JWT or basic auth is recommended before sharing the URL.
- **Neon free tier** suspends compute after inactivity. Use the pooled connection URL to mitigate cold starts.
- **Railway manual redeploy** — GitHub auto-deploy must be connected in the Railway dashboard for pushes to deploy automatically.
- **AI summary is Spanish-only** — the prompt is hardcoded in Spanish. Categories and sources could be extended to support other languages.
- **No full-text extraction** — summaries are taken from RSS feed descriptions (max 500 chars). A future improvement would be to scrape the full article text for better deduplication and summarisation.
- **Single daily digest** — the app generates one digest per day. A "breaking news" mode could run more frequently for major events.
