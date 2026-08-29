# VSX Chart Screenshot Worker — Setup & Wiring

## 1. What this is

A small standalone Node.js service (`server.ts`). It is **not** a Supabase Edge
Function — Supabase Edge Functions run on Deno Deploy and can't launch a real
headless Chromium browser, which Playwright needs. Run this as its own
process instead: a Railway/Render/Fly.io/VPS deployment, or a Docker
container, anywhere that isn't the Edge Function runtime.

## 2. Install & run

```bash
cd chart-screenshot-worker
npm install
npx playwright install --with-deps chromium
```

Create a `.env` (or set these in your host's dashboard):

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # NOT the anon key
PORT=8787
```

```bash
npm run start
```

## 3. Supabase Storage bucket

Create the bucket once (SQL editor, or Storage tab in the dashboard):

```sql
insert into storage.buckets (id, name, public)
values ('trade-charts', 'trade-charts', true)
on conflict (id) do nothing;

-- Public read so gallery cards can load the image_url directly.
create policy "Public read trade charts"
on storage.objects for select
using (bucket_id = 'trade-charts');

-- Service role already bypasses RLS for writes, so no insert policy needed
-- as long as the worker uses SUPABASE_SERVICE_ROLE_KEY (never expose that
-- key to the frontend).
```

## 4. Confirmed schema (from your actual useAppState.tsx)

`trades` has only `id`, `user_id`, `account_id`, `data` (jsonb — the whole
`Trade` object). No flat `symbol`/`image_url`/etc columns. `server.ts`
already matches this: it reads `row.data`, and writes the screenshot back by
appending a `TradeImage` (`{ id, url, type: 'url' }`) onto
`data.executionImages`, same shape your `TimeframeChart`/gallery code
already expects — no schema change needed on that side.

**Timestamp gotcha:** `trade.data.timestamp`/`startTime` are PH-shifted for
display (`convertBrokerTimeToPH` in `useAppState.tsx`) and do **not** match
the exchange timezone TradingView renders in — using them to jump the chart
would land on the wrong bar. Instead the worker reads
`trade.data.brokerOpenTime`, a new field holding the raw, pre-shift broker
timestamp. You need to add it in two places:

**`index.ts`** — add to the `Trade` interface:
```ts
  brokerOpenTime?: string; // Raw broker/exchange-server ISO timestamp at trade open, BEFORE the PH-time shift — used only by the chart-screenshot worker.
```

**`useAppState.tsx`** — inside `handleImportTradesFile`, in the
`newTrades.push({...})` object, add (right after `importTicketId: p.ticketId,`):
```ts
          brokerOpenTime: p.openTime, // raw broker-server time, pre-PH-shift
```
`p.openTime` is already the correct raw value — `ParsedMTTrade.openTime` in
`mt4Import.ts` is populated straight from the broker's own timestamp column,
before any PH conversion happens.

If a trade has no `brokerOpenTime` (e.g. manually entered, not imported),
the worker falls back to `timestamp`, which may land on the wrong bar by
however many hours the broker→PH shift was.

## 5. Wiring it into the CSV import flow

In `useAppState.tsx`, `handleImportTradesFile` already does the Supabase
insert. Change its `.then(({ error }) => {...})` to fire the worker on
success:

```ts
          supabase.from('trades').insert(
            newTrades.map(t => ({ id: t.id, user_id: userId, account_id: t.accountId, data: t }))
          ).then(({ error }) => {
            if (error) {
              console.error('Failed to save imported trades to Supabase:', error);
              showTradeImportToast('error', 'Imported trades may not have synced to your account — reload to check.');
            } else {
              // Fire-and-forget — never awaited, a screenshot failure must
              // never affect the import itself.
              fetch(`${CHART_SCREENSHOT_WORKER_URL}/screenshot-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tradeIds: newTrades.map(t => t.id) }),
              }).catch(err => console.warn('Chart screenshot trigger failed:', err));
            }
          });
```

Add near the top of `useAppState.tsx` (or wherever your other env-driven
constants live):
```ts
const CHART_SCREENSHOT_WORKER_URL = import.meta.env.VITE_CHART_SCREENSHOT_WORKER_URL;
```
and set `VITE_CHART_SCREENSHOT_WORKER_URL=https://YOUR-WORKER-HOST` in your
frontend's `.env`.

If your gallery is realtime-subscribed to the `trades` table (Supabase
Realtime), the `image_url` update from the worker will just show up on its
own once processing finishes — no extra polling needed on the frontend. If
it's not realtime, poll or refetch trades a few seconds after import, or add
a manual "Regenerate screenshot" button that calls:

```ts
fetch('https://YOUR-WORKER-HOST/screenshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tradeId: trade.id }),
});
```

## 6. Known limitations (read before relying on this in production)

- **No historical deep-link.** TradingView's public widget has no URL param
  for "load this exact past bar." The worker sets the widget's timezone to
  `America/New_York` explicitly, converts the trade's broker time to NY wall
  clock (DST-aware, via `Intl.DateTimeFormat` — not a fixed-hour shift like
  the PH conversion, since NY observes EST/EDT), then drives the `Alt+G`
  "Go to date" shortcut to jump there. This depends on TradingView's current
  UI/keyboard shortcuts and DOM structure — if they change it, the
  screenshot will silently be of the wrong time (or fail the selector wait).
  Test it against a real trade before trusting it at scale, and re-check the
  `dateInput` selector in `screenshotChartAt()` if it stops working.
- **Your app's own PH-time display is untouched.** This worker only uses NY
  time internally to find the right chart bar — it never writes NY time
  anywhere the user sees. The trade's `date`/`startTime`/`timestamp` fields
  (shown throughout the app) stay exactly as `convertBrokerTimeToPH` already
  produces them; the worker only reads them (or `brokerOpenTime`), it never
  updates them.
- **Terms of Service.** Automating screenshots of TradingView's site is
  something to check against their ToS for your use case, especially if
  you're running this at volume or in a commercial product. A more durable
  long-term alternative: render the chart yourself (e.g. with the
  `lightweight-charts` library, fed by your own OHLC data source for that
  symbol/timeframe) instead of scraping TradingView, and screenshot that
  instead — everything else in this worker (Playwright screenshot → Storage
  upload → DB update) stays identical, you'd just swap out
  `screenshotChartAt()`.
- **Rate/cost.** A large MT5 import (hundreds of trades) means hundreds of
  sequential headless-browser page loads. `processTradesSequentially` is
  intentionally sequential (not parallel) to avoid hammering TradingView or
  your host's memory — expect roughly 1 trade every 4-6 seconds. For big
  imports, consider capping how many trades auto-generate a screenshot (e.g.
  only the most recent N, or only on manual request) rather than firing this
  for the entire batch every time.
- **Symbol mapping.** Only `NQ`, `ES`, `GC`, `EURUSD`, `GBPUSD`, `XAUUSD` are
  mapped to TradingView tickers in `SYMBOL_TO_TV_TICKER`. Add entries for
  whatever else your journal trades, or unmapped symbols will be passed
  through as-is and likely fail to load.
