# Deployment Guide — GitHub + Railway + Vercel + Supabase

Your setup: frontend on Vercel (auto-deploys from GitHub), auth/data on
Supabase. This adds one new piece: the screenshot worker, deployed
separately on Railway (Vercel's serverless functions can't run a
long-lived headless browser reliably — timeouts + cold starts).

## Step 1 — Add the worker folder to your repo

In your existing project's repo root:

```bash
# copy the chart-screenshot-worker/ folder (server.ts, package.json,
# Dockerfile, tsconfig.json, .gitignore, README.md) into your repo, then:
git add chart-screenshot-worker
git commit -m "Add chart screenshot worker"
git push
```

It can live in the same repo as your frontend (as a subfolder) — Railway
lets you point a deploy at a specific subdirectory, so it won't interfere
with your Vercel build.

## Step 2 — Apply the 3 code patches

In `index.ts`, add to the `Trade` interface:
```ts
  brokerOpenTime?: string; // Raw broker/exchange-server ISO timestamp at trade open, BEFORE the PH-time shift — used only by the chart-screenshot worker.
```

In `useAppState.tsx`, inside `handleImportTradesFile`'s `newTrades.push({...})`,
right after `importTicketId: p.ticketId,`:
```ts
          brokerOpenTime: p.openTime,
```

And change the `.then(({ error }) => {...})` after
`supabase.from('trades').insert(...)` to fire the worker on success (full
diff was given earlier in this conversation). Then:

```bash
git add index.ts useAppState.tsx
git commit -m "Wire chart screenshot worker into MT5 import"
git push
```

Vercel will auto-redeploy your frontend from this push — but it won't work
end-to-end until Steps 3-7 are done too (the fetch call will just fail
silently, which is fine, imports still work normally).

## Step 3 — Deploy the worker on Railway

1. Go to https://railway.app, sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → pick your repo.
3. Railway will ask for a root directory / build settings — set:
   - **Root Directory**: `chart-screenshot-worker`
   - Railway auto-detects the `Dockerfile` in that folder and builds from it.
4. Click Deploy. First build takes a few minutes (downloading the Chromium
   base image).

## Step 4 — Set environment variables on Railway

In the Railway project → your service → **Variables** tab, add:

| Key | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL (Supabase Dashboard → Project Settings → API → "Project URL") |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → "service_role" secret key |

**Never put `SUPABASE_SERVICE_ROLE_KEY` in Vercel or anywhere in your
frontend code/env** — it bypasses Row Level Security entirely. It only
belongs on the worker (Railway), which runs server-side and is never
shipped to a browser.

Railway redeploys automatically when you save new variables.

## Step 5 — Create the Supabase Storage bucket

Supabase Dashboard → SQL Editor → run:

```sql
insert into storage.buckets (id, name, public)
values ('trade-charts', 'trade-charts', true)
on conflict (id) do nothing;

create policy "Public read trade charts"
on storage.objects for select
using (bucket_id = 'trade-charts');
```

## Step 6 — Get your Railway worker's public URL

Railway project → your service → **Settings → Networking → Generate
Domain**. You'll get something like:
```
https://chart-screenshot-worker-production.up.railway.app
```
Copy this.

## Step 7 — Point your frontend at it via Vercel

Vercel Dashboard → your project → **Settings → Environment Variables** → add:

| Key | Value |
|---|---|
| `VITE_CHART_SCREENSHOT_WORKER_URL` | the Railway URL from Step 6 (no trailing slash) |

Then **Deployments → ⋯ → Redeploy** (env var changes need a redeploy to
take effect — Vercel doesn't hot-reload build-time env vars).

## Step 8 — Test it

1. Check the worker is alive: open `https://YOUR-RAILWAY-URL/health` in a
   browser — should return `{"ok":true}`.
2. Import a small MT5 CSV (1-2 trades) into your app.
3. Watch the Railway **Deployments → Logs** tab — you should see
   `[chart-screenshot] batch done: 1/1 succeeded` (or a specific error if
   something's off — the logs will name which step failed).
4. Refresh the gallery card for that trade — the screenshot should now show
   instead of "No Image".

## If something fails

- **Worker logs say "Trade not found"** — double check `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` are for the *same* Supabase project your
  frontend uses.
- **Worker logs say a selector timeout on `dateInput`** — TradingView
  changed their "Go to date" dialog markup; open the widget URL in a normal
  (headed) browser, press Alt+G, inspect the actual input element, and
  update the selector in `screenshotChartAt()` in `server.ts`.
- **Screenshot looks like the wrong time/candle** — check that
  `brokerOpenTime` is actually being saved (Supabase Table Editor → trades →
  expand a row's `data` jsonb → confirm the field is there with a value).
- **Fetch to the worker never fires** — check `VITE_CHART_SCREENSHOT_WORKER_URL`
  is actually set in the Vercel deployment you're testing (Vercel envs are
  scoped per-environment: Production / Preview / Development — make sure
  it's set for the one you're using).
