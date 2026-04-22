# Lessons Learned — El Resumen del Día

Everything we discovered debugging and building this project end to end.

---

## 1. Deployment & Environment

### Vercel + Railway: always include the protocol in environment variables
Axios treats a `baseURL` without `https://` as a relative path, so requests hit the same origin (Vercel's SPA fallback returns HTML). The browser then tries to parse that HTML as JSON and throws `Cannot use 'in' operator to search for 'articles' in <!doctype html>`.
- **Fix:** `VITE_API_URL` must be `https://your-server.railway.app`, not `your-server.railway.app`.
- Same applies to `CORS_ORIGIN` on Railway — must include `https://`.

### Nullish coalescing (`??`) does not catch empty strings
`import.meta.env.VITE_API_URL ?? 'http://localhost:3001'` — if the env var is set to an empty string `""`, the fallback is never used because `""` is not `null` or `undefined`.

### Railway skips devDependencies in production builds
Any package needed at runtime (including `tsx` for running seed scripts) must be in `dependencies`, not `devDependencies`.

### Vercel deployment authorization
On the Hobby plan, Vercel checks the commit author email against the GitHub account owner. Using a different email blocks deployments. The `Co-Authored-By` trailer from Claude also causes blocks — never add it to commits in this project.

### Railway GitHub auto-deploy
Railway only auto-deploys if the GitHub integration is explicitly connected in the Railway dashboard. Otherwise, every push requires a manual redeploy trigger.

---

## 2. React & Frontend

### Silent React crashes leave a black screen
Without an Error Boundary, any render-time error unmounts the entire React tree silently — the user sees only the background colour. Wrap `<App>` in a class-based `ErrorBoundary` component so errors are caught and shown as a readable message.

### Broken image URLs need `onError`, not just null checks
`article.imageUrl` can be a non-null string that still returns a 404 or is CORS-blocked. Checking `imageUrl != null` is not enough. Use the `onError` event on `<img>` to fall back to a placeholder.

```tsx
<img src={url} onError={() => setFailed(true)} />
```

---

## 3. Express & Node.js

### `express.json()` strict mode rejects JSON `null`
By default, `express.json()` only accepts objects and arrays as the top-level JSON value. Sending `null` as a POST body (which Axios does when you pass `null` as data with `Content-Type: application/json` set as a default header) causes a SyntaxError that goes straight to the global error handler — the route handler is never reached.
- **Fix:** `app.use(express.json({ strict: false }))` OR send `{}` as the body instead of `null`.

### Axios serialises `null` to `"null"` when `Content-Type: application/json` is set globally
If you configure `headers: { 'Content-Type': 'application/json' }` on the Axios instance, that header is sent on every request including POSTs with `null` data. Axios then JSON-serialises `null` → `"null"` which Express rejects in strict mode.
- **Fix:** Don't set `Content-Type` globally — Axios sets it automatically when you pass an object as data. Or pass `{}` instead of `null` for bodyless POSTs.

### Global Express error handler fires when async route errors bypass try/catch
The `{ error: 'Error interno del servidor.' }` message in our global handler appeared even though every route had a try/catch. This was caused by `express.json()` throwing before the route was reached and calling `next(err)` — not by errors inside the route handler itself.

### Async route handlers in Express 4 need explicit try/catch
Express 4 does not automatically forward rejected async promises to the global error handler. Always wrap async route handlers in try/catch and respond explicitly.

---

## 4. Database (Prisma + Neon)

### Neon serverless PostgreSQL suspends compute on the free tier
After a period of inactivity, Neon suspends the compute endpoint. The next connection attempt fails with `P1001: Can't reach database server`. 
- **Fix:** Use the **pooled connection URL** (with `-pooler` in the hostname) instead of the direct connection URL. PgBouncer handles cold starts much better.

### Prisma `onDelete: Cascade` must exist in the migration
The cascade delete from `DailyDigest` to `NewsArticle` is defined in the Prisma schema with `onDelete: Cascade`. This only works in production if the migration that adds the constraint has been applied via `prisma migrate deploy`.

### Seed scripts need `tsx` at runtime
`prisma db seed` runs `tsx prisma/seed.ts`. In production Railway builds, only `dependencies` are installed. Moving `tsx` to `dependencies` (not `devDependencies`) is required for the seed to run.

---

## 5. RSS Feeds

### Dead or blocked feeds fail silently
RSS feeds go dead without warning. Always validate feeds periodically:
- **El Economista** (`eleconomista.es/rss/rss.php`) — 403 Access Denied, feed discontinued. Replaced with El Mundo Economía.
- **El País Tecnología** — URL used `list` instead of `pages` in the path.
- **DW Español** — feed URL returns a plain text error, not XML.

### Parser errors differ by feed type
- `Non-whitespace before first tag` — the URL returns plain text or an HTML error page, not XML.
- `Error: no feed by that name` — the feed name in the URL no longer exists on the server.

---

## 6. AI Integration

### Gemini free tier has regional quota restrictions
Even with a valid API key that works in AI Studio's playground, calling the Gemini API from a Railway server (EU region) returns `limit: 0` on the free tier. The playground uses a different internal path than the REST API. Gemini's free tier is not available in all cloud regions.

### Groq is a reliable free alternative
Groq's free tier (Llama 3.3 70b) works from any server region, has no billing requirement, and is fast enough for daily digest generation. Rate limits (30 RPM, 14,400 RPD) are more than sufficient for a once-per-day summary.

### AI errors must fail gracefully
Wrapping the AI call in try/catch and returning `null` means the digest is always generated even if the AI summary fails. The `aiSummary` field is nullable — the frontend only renders the briefing card when it's non-null.

### Model names change and version APIs matter
`gemini-1.5-flash` is not available in the `v1beta` API endpoint used by the `@google/generative-ai` SDK. Always verify model names against the current API documentation, not tutorials.

---

## 7. General Debugging Patterns

### When you see a generic error, find where it's actually thrown
`{ error: 'Error interno del servidor.' }` is a global handler. The real error is always upstream. Improve the global handler temporarily to expose `err.message`, or add a diagnostic endpoint.

### Add a dedicated test endpoint for third-party integrations
A `/api/admin/test-ai` endpoint that makes a minimal call to the AI provider saved significant debugging time. It confirmed the key was found, showed the exact error from the provider, and let us iterate without triggering a full digest regeneration each time.

### Background polling beats sleep loops for CI/deploy checks
Instead of `sleep 30 && curl ...`, use `until <check>; do sleep 5; done` to poll until a condition is met. It's faster when the deploy is quick and correct when it's slow.

### Check the network response body, not just the status code
Browser console shows `Failed to load resource: 500` but the body contains the actual error. Always check the Network tab → Response body when debugging API errors.
