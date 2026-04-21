# How to restart El Resumen del Día after a reboot

Follow these steps in order every time you restart your Mac.

---

## Step 1 — Start PostgreSQL

You have two options. Pick whichever feels easier.

### Option A: Postgres.app (easiest)

Open **Finder → Applications → Postgres.app** and double-click it.
A small elephant icon will appear in your menu bar. When it turns solid, the database is ready.
You can skip to Step 2.

### Option B: Terminal

```bash
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
pg_ctl -D ~/Library/Application\ Support/Postgres/var-17 -l /tmp/postgres.log start
```

Verify it started:

```bash
pg_isready
# Expected output: /tmp:5432 - accepting connections
```

---

## Step 2 — Open a terminal in the project folder

```bash
cd "/Users/ivan/Desktop/Code tests/resumen-del-dia"
```

---

## Step 3 — Make pnpm available

```bash
export PATH="$HOME/.local/bin:/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
```

> **Tip:** To avoid typing this every time, add the line above to your shell config so it runs automatically on every new terminal:
>
> ```bash
> echo 'export PATH="$HOME/.local/bin:/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
> source ~/.zshrc
> ```
>
> After doing this once, you never need to run the `export` command manually again.

---

## Step 4 — Start the app

```bash
pnpm dev
```

This starts both servers at the same time. Wait until you see both of these lines in the output:

```
[INFO]  Server running on http://localhost:3001
VITE ready in ...ms  ➜  Local: http://localhost:5173/
```

---

## Step 5 — Open the app

| What | URL |
|------|-----|
| Public news site | http://localhost:5173 |
| Backoffice | http://localhost:5173/admin |
| API health check | http://localhost:3001/api/health |

---

## Step 6 — Generate today's digest (if needed)

The digest is generated automatically every day at **07:00 Madrid time**.
If you start the app later in the day and no digest exists yet, trigger one manually:

**Option A — via the backoffice:**
Go to http://localhost:5173/admin/dashboard and click **"Regenerar resumen de hoy"**.

**Option B — via terminal:**
```bash
curl -X POST http://localhost:3001/api/admin/digest/generate
```

This takes 30–60 seconds while it fetches live RSS feeds.

---

## Stopping the app

Press **Ctrl+C** in the terminal where `pnpm dev` is running.

To also stop PostgreSQL:

```bash
pg_ctl -D ~/Library/Application\ Support/Postgres/var-17 stop
```

Or simply quit **Postgres.app** from the menu bar elephant icon.

---

## Troubleshooting

**"pnpm: command not found"**
Run Step 3 again (`export PATH=...`), or add it permanently to `~/.zshrc` as shown above.

**"address already in use :3001" or ":5173"**
A previous server process is still running. Kill it:
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```
Then run `pnpm dev` again.

**"Connection refused" or database errors**
PostgreSQL is not running. Go back to Step 1.

**Homepage shows "El resumen de hoy está siendo generado"**
No digest has been generated today yet. Follow Step 6.

**Feed errors in /admin/logs**
Some Spanish news sites occasionally block automated requests. This is normal — the digest still generates from whichever feeds responded successfully.
