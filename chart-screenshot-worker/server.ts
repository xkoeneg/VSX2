// ============================================================================
// VSX Trading Journal — Automated Background Chart Screenshot Worker
// ----------------------------------------------------------------------------
// Trigger flow (see README.md for the exact wiring):
//   1. Frontend imports an MT5 CSV -> trades saved to Supabase (as today).
//   2. Frontend fires a NON-BLOCKING POST to this worker: /screenshot-batch
//      with the newly-inserted trade IDs. The import UI does NOT wait for it.
//   3. This worker looks each trade up, opens a headless browser pointed at
//      a public TradingView chart for that symbol, jumps the chart to the
//      trade's entry timestamp, screenshots it, uploads the PNG to the
//      Supabase Storage `trade-charts` bucket, and writes the public URL
//      back onto the trade row.
//
// CONFIRMED against your actual useAppState.tsx / index.ts:
//   - Table `trades` has only `id`, `user_id`, `account_id`, and `data`
//     (jsonb — the entire Trade object). There are no flat symbol/time/
//     image_url columns, so this worker does a read-modify-write on `data`:
//     it appends a TradeImage into `data.executionImages` rather than
//     writing a flat image_url column.
//   - Timestamp: `trade.data.timestamp`/`startTime` are PH-shifted for
//     display (see convertBrokerTimeToPH in useAppState.tsx) and do NOT
//     match the exchange timezone the TradingView chart renders in. This
//     worker instead reads `trade.data.brokerOpenTime` — the RAW broker-
//     server timestamp from ParsedMTTrade.openTime, pre-shift — which you
//     need to add to the Trade object on import (see the patch notes given
//     alongside this file). If brokerOpenTime is missing (e.g. a manually
//     entered trade with no import data), it falls back to `timestamp`,
//     which may be off by whatever the broker->PH shift was.
//
// IMPORTANT CAVEAT: TradingView's public widget has no URL parameter for
// "load this exact historical bar." This script drives the widget's
// Alt+G "Go to date" shortcut to jump there, which depends on TradingView's
// current UI/keyboard shortcuts and can break if they change it. Also check
// TradingView's Terms of Service before running this against their site in
// production — automated scraping/screenshotting of their charts may not be
// permitted depending on how you use it. If that's a concern, the cleanest
// long-term fix is swapping the `openChartAtTimestamp()` function below for
// your own chart render (e.g. a lightweight-charts / TradingView Charting
// Library instance you host yourself, fed by your own OHLC data) — everything
// else in this worker (screenshot -> upload -> DB update) stays the same.
// ============================================================================

import express from 'express';
import cors from 'cors';
import { chromium, type Browser, type Page } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
// The Playwright base image (see Dockerfile) runs Node 20, which has no
// native WebSocket global — @supabase/supabase-js's realtime client needs
// one even though this worker never actually uses realtime subscriptions
// (it's initialized unconditionally inside createClient). Passing the "ws"
// package as the transport avoids the crash: "Node.js 20 detected without
// native WebSocket support."

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 8787;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role, NOT anon key — needed to write storage + bypass RLS
const STORAGE_BUCKET = 'trade-charts';

const TRADES_TABLE = 'trades';
const ID_COLUMN = 'id';
// Everything trade-specific lives inside the jsonb `data` column — there
// are no flat symbol/time/image columns on this table.
const DATA_COLUMN = 'data';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars are required.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws as any },
});

// Map your app's canonical symbols (post normalizeMTSymbol) to TradingView
// tickers. Extend this as you add more instruments.
const SYMBOL_TO_TV_TICKER: Record<string, string> = {
  NQ: 'CME_MINI:NQ1!',
  ES: 'CME_MINI:ES1!',
  GC: 'COMEX:GC1!',
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  XAUUSD: 'OANDA:XAUUSD',
};

function toTradingViewSymbol(appSymbol: string): string {
  return SYMBOL_TO_TV_TICKER[appSymbol.toUpperCase()] || appSymbol;
}

// Mirrors the constant in useAppState.tsx's convertBrokerTimeToPH — your
// broker's MT5 server clock is a FIXED UTC+3 with no DST of its own. Keep
// this in sync if you ever change brokers.
const MT5_SERVER_UTC_OFFSET_HOURS = 3;

// Converts a naive broker-server timestamp ("YYYY-MM-DDTHH:mm:ss", no
// timezone marker, wall-clock reading on a server fixed at UTC+3) into the
// New York wall-clock date/time string TradingView's "Go to date" dialog
// expects, e.g. "2024-01-15 05:23". Unlike the broker's fixed +3, New York
// observes DST (EST UTC-5 / EDT UTC-4), so this can't be a constant-hour
// shift like the PH conversion — it goes through a real UTC instant first,
// then lets Intl.DateTimeFormat apply the correct NY offset for that date.
function brokerTimeToNewYork(isoNaive: string): string {
  // Step 1: read the broker's wall-clock digits as if UTC, giving us an
  // epoch value that's numerically the broker wall-clock time.
  const brokerWallAsUtcMs = Date.parse(`${isoNaive.slice(0, 19)}Z`);
  if (isNaN(brokerWallAsUtcMs)) throw new Error(`Unparseable broker timestamp: ${isoNaive}`);

  // Step 2: the broker's wall clock reads UTC+3, so the TRUE utc instant is
  // the broker wall-clock reading MINUS 3 hours.
  const trueUtcMs = brokerWallAsUtcMs - MT5_SERVER_UTC_OFFSET_HOURS * 60 * 60 * 1000;

  // Step 3: format that true instant in America/New_York — Intl handles
  // EST/EDT for us, no manual DST-date-math needed.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(trueUtcMs));

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

// ---------------------------------------------------------------------------
// TradingView login session — continuous futures contracts (NQ1!, ES1!, etc.)
// return "This symbol doesn't have data" when loaded from a logged-out /
// anonymous browser session, even though the chart page itself is public.
// Regular stock symbols (AAPL, etc.) work fine anonymously — confirmed via
// /debug-goto-dialog testing. To fix this, a real TradingView account's
// session (cookies + localStorage) is exported once via a local Playwright
// script (see tv-session-export/export-session.js) and stored as a base64
// string in the TV_SESSION_STATE_BASE64 env var. We decode it once here and
// pass it as `storageState` when creating each new page/context below, so
// the worker's headless browser is effectively "logged in" the same way.
// If the env var isn't set, storageState is simply undefined and Playwright
// falls back to a normal logged-out context (stock symbols will still work,
// futures symbols will not).
// ---------------------------------------------------------------------------
let cachedStorageState: any = undefined;
let storageStateLoaded = false;
function getStorageState(): any {
  if (!storageStateLoaded) {
    storageStateLoaded = true;
    const raw = process.env.TV_SESSION_STATE_BASE64;
    if (raw) {
      try {
        const json = Buffer.from(raw, 'base64').toString('utf-8');
        cachedStorageState = JSON.parse(json);
        console.log('[chart-screenshot] loaded TradingView session from TV_SESSION_STATE_BASE64');
      } catch (err: any) {
        console.error('[chart-screenshot] failed to parse TV_SESSION_STATE_BASE64:', err.message);
        cachedStorageState = undefined;
      }
    } else {
      console.warn('[chart-screenshot] TV_SESSION_STATE_BASE64 not set — futures symbols (NQ1!, ES1!, etc.) will likely fail with "doesn\'t have data".');
    }
  }
  return cachedStorageState;
}

// ---------------------------------------------------------------------------
// Browser lifecycle — one shared browser instance, fresh page per screenshot
// ---------------------------------------------------------------------------
let browserPromise: Promise<Browser> | null = null;
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

// ---------------------------------------------------------------------------
// Core: open the TradingView widget, jump it to the trade timestamp, and
// return a PNG buffer of the chart element.
// ---------------------------------------------------------------------------
async function screenshotChartAt(tvSymbol: string, nyGoToValue: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page: Page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    storageState: getStorageState(),
  } as any);

  try {
    // CONFIRMED via /debug-goto-dialog: the simplified widget embed does
    // NOT support Alt+G at all (0 inputs found). The full chart page DOES
    // (2 inputs found: a date field with placeholder "YYYY-MM-DD" and a
    // time field right after it, no placeholder). So we use the full
    // chart page here, not s.tradingview.com/widgetembed.
    // NOTE: unlike the old widgetembed URL, the full chart page has no
    // confirmed &timezone= param — it may default to the exchange's own
    // timezone or the browser/account default instead of NY. Verify this
    // is correct by comparing a screenshot's visible time axis against a
    // known trade before trusting it at scale (see debug-goto-dialog
    // below to inspect what's actually rendered).
    const url = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.waitForSelector('.chart-container, canvas', { timeout: 20_000 });
    await page.waitForTimeout(3_000); // full chart page has more UI chrome to settle

    // Try to dismiss any cookie-consent / sign-in prompt overlays that could
    // steal focus or block the chart. Best-effort — ignore if not present.
    await page.keyboard.press('Escape').catch(() => {});

    // Click the chart area first so keyboard shortcuts actually target it.
    const chartEl = await page.$('.chart-container, canvas');
    if (chartEl) await chartEl.click({ position: { x: 400, y: 300 } }).catch(() => {});
    await page.waitForTimeout(300);

    await page.keyboard.press('Alt+G');
    await page.waitForTimeout(2_000); // dialog + calendar render takes a moment

    // nyGoToValue comes in as "YYYY-MM-DD HH:mm" — split it for the two
    // separate inputs the dialog actually has.
    const [datePart, timePart] = nyGoToValue.split(' ');

    const inputs = await page.$$('input');
    // Date input: has the YYYY-MM-DD placeholder. Time input: the very
    // next visible input after it, no placeholder.
    let dateInput = null;
    let timeInput = null;
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      if (placeholder && placeholder.toUpperCase().includes('YYYY-MM-DD')) {
        dateInput = inputs[i];
        timeInput = inputs[i + 1] || null;
        break;
      }
    }

    if (!dateInput) {
      throw new Error('Go-to-date dialog did not open (date input not found) — TradingView may have changed the full chart page UI, re-run /debug-goto-dialog?mode=fullchart to check.');
    }

    // IMPORTANT: .fill() sets the value directly via JS, which does NOT
    // trigger TradingView's own input validation — and that validation is
    // what enables the (initially disabled) time field. Simulate real
    // keystrokes instead via click + type, which does trigger it.
    // Both fields can start briefly disabled right after the dialog opens
    // (render/animation delay), so wait for "enabled" on both before
    // interacting rather than clicking immediately.
    await dateInput.waitForElementState('enabled', { timeout: 8_000 }).catch(() => {});
    await dateInput.click({ timeout: 8_000 });
    await dateInput.press('Control+A').catch(() => {}); // clear any prefilled value
    await page.keyboard.type(datePart, { delay: 50 });

    // CONFIRMED via /debug-goto-dialog (2nd probe): neither typing into the
    // date input NOR clicking the highlighted calendar day cell unlocks the
    // time field — it stays disabled either way. What actually unlocks it is
    // a real focus-change event, i.e. pressing Tab to move focus from the
    // date field to the time field, the same way a human would. A mouse
    // click on some other element does not fire the same event TradingView
    // is listening for.
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    if (timeInput) {
      await timeInput.waitForElementState('enabled', { timeout: 8_000 }).catch(() => {});
      // Focus should already be on timeInput after Tab — avoid an extra
      // click (which previously proved unreliable) and select+type directly.
      await timeInput.press('Control+A').catch(() => {});
      await page.keyboard.type(timePart, { delay: 50 });
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1_500); // let the chart scroll/redraw

    const target = await page.$('.chart-container') || page;
    const buffer = await (target as any).screenshot({ type: 'png' });
    return buffer as Buffer;
  } finally {
    await page.close();
  }
}

// Formats any real Date/epoch instant as the NY wall-clock string the
// "Go to date" dialog expects. Used for the fallback path (trades with no
// brokerOpenTime), where `trade.timestamp` is already a true absolute ISO
// instant (just derived via a confusing PH round-trip) — no broker-offset
// math needed here, unlike brokerTimeToNewYork() above.
function utcInstantToNewYorkGoToValue(isoInstant: string): string {
  const ms = Date.parse(isoInstant);
  if (isNaN(ms)) throw new Error(`Unparseable timestamp: ${isoInstant}`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

// ---------------------------------------------------------------------------
// Supabase Storage upload + DB write-back
// ---------------------------------------------------------------------------
async function uploadScreenshot(tradeId: string, buffer: Buffer): Promise<string> {
  const path = `${tradeId}/${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { contentType: 'image/png', upsert: true });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Appends a TradeImage ({ id, url, type: 'url' }, matching the shape in
// your index.ts) onto trade.data.executionImages, then writes the WHOLE
// data object back — jsonb columns don't support partial array-append via
// supabase-js, so this is read (already have it from processTrade) ->
// mutate in JS -> write back.
async function appendExecutionImage(tradeId: string, currentData: any, publicUrl: string): Promise<void> {
  const newImage = { id: `chart_${Date.now()}`, url: publicUrl, type: 'url' as const };
  const updatedData = {
    ...currentData,
    executionImages: [...(currentData.executionImages || []), newImage],
  };

  const { error } = await supabase
    .from(TRADES_TABLE)
    .update({ [DATA_COLUMN]: updatedData })
    .eq(ID_COLUMN, tradeId);

  if (error) throw new Error(`DB update failed for trade ${tradeId}: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Per-trade pipeline
// ---------------------------------------------------------------------------
async function processTrade(tradeId: string): Promise<{ tradeId: string; ok: boolean; error?: string; imageUrl?: string }> {
  try {
    const { data: row, error } = await supabase
      .from(TRADES_TABLE)
      .select(`${ID_COLUMN}, ${DATA_COLUMN}`)
      .eq(ID_COLUMN, tradeId)
      .single();

    if (error || !row) throw new Error(error?.message || 'Trade not found');

    const trade = row[DATA_COLUMN]; // the full Trade object
    if (!trade?.symbol) throw new Error('Trade has no symbol');

    // Prefer the raw broker-server timestamp (needs the fixed +3 broker-
    // offset math) over the PH-shifted `timestamp` field (already a true
    // absolute instant, just needs re-formatting into NY wall clock).
    let nyGoToValue: string;
    if (trade.brokerOpenTime) {
      nyGoToValue = brokerTimeToNewYork(trade.brokerOpenTime);
    } else if (trade.timestamp) {
      nyGoToValue = utcInstantToNewYorkGoToValue(trade.timestamp);
    } else {
      throw new Error('Trade has no usable timestamp (brokerOpenTime/timestamp both missing)');
    }

    const tvSymbol = toTradingViewSymbol(trade.symbol);
    const buffer = await screenshotChartAt(tvSymbol, nyGoToValue);
    const publicUrl = await uploadScreenshot(tradeId, buffer);
    await appendExecutionImage(tradeId, trade, publicUrl);

    return { tradeId, ok: true, imageUrl: publicUrl };
  } catch (err: any) {
    console.error(`[chart-screenshot] trade ${tradeId} failed:`, err.message);
    return { tradeId, ok: false, error: err.message };
  }
}

// Small sequential queue so we don't open N headless browser pages at once
// on a big CSV import (MT5 reports can have hundreds of trades).
async function processTradesSequentially(tradeIds: string[]) {
  const results = [];
  for (const id of tradeIds) {
    results.push(await processTrade(id));
  }
  return results;
}

// ---------------------------------------------------------------------------
// HTTP surface
// ---------------------------------------------------------------------------
const app = express();
// Without this, the browser blocks the fetch() call from your Vercel
// frontend before it ever reaches Railway (a silent failure — the
// fire-and-forget .catch() in useAppState.tsx swallows it, so you'd never
// see anything happen after import). Wide open (*) since this only accepts
// a tradeId, not sensitive data — tighten to your actual Vercel domain if
// you want to lock it down later.
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Single trade — handy for retry-from-UI ("regenerate screenshot" button).
app.post('/screenshot', async (req, res) => {
  const { tradeId } = req.body || {};
  if (!tradeId) return res.status(400).json({ error: 'tradeId is required' });

  const result = await processTrade(tradeId);
  res.status(result.ok ? 200 : 500).json(result);
});

// Batch — this is what the CSV import flow should call after saving trades.
// Responds immediately (202) and processes in the background so the import
// UI never blocks waiting for screenshots.
app.post('/screenshot-batch', (req, res) => {
  const { tradeIds } = req.body || {};
  if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
    return res.status(400).json({ error: 'tradeIds must be a non-empty array' });
  }

  res.status(202).json({ accepted: tradeIds.length });

  processTradesSequentially(tradeIds).then((results) => {
    const failed = results.filter(r => !r.ok);
    console.log(`[chart-screenshot] batch done: ${results.length - failed.length}/${results.length} succeeded`);
    if (failed.length) console.warn('[chart-screenshot] failures:', failed);
  });
});

app.get('/health', (_req, res) => res.json({
  ok: true,
  tvSessionLoaded: !!getStorageState(),
}));

// DEBUG ONLY — not part of the normal pipeline. Opens the widget for a
// symbol, presses Alt+G, then returns (1) a screenshot of whatever's on
// screen at that point and (2) every currently-visible <input> element's
// attributes. Use this to actually see whether TradingView's "Go to date"
// dialog opens at all in this embed, and if so, what its real input
// selector is — instead of guessing. Call it like:
//   GET /debug-goto-dialog?symbol=CME_MINI:NQ1!
app.get('/debug-goto-dialog', async (req, res) => {
  const symbol = (req.query.symbol as string) || 'CME_MINI:NQ1!';
  const mode = (req.query.mode as string) === 'fullchart' ? 'fullchart' : 'widget';
  const testDate = (req.query.date as string) || '2024-01-15'; // YYYY-MM-DD
  const testTime = (req.query.time as string) || '09:30'; // HH:mm
  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      storageState: getStorageState(),
    } as any);

    const url =
      mode === 'fullchart'
        ? `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`
        : `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}` +
          `&interval=1&hidesidetoolbar=1&hidetoptoolbar=0&saveimage=0&theme=dark&style=1` +
          `&timezone=${encodeURIComponent('America/New_York')}`;

    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.waitForSelector('.chart-container, canvas', { timeout: 20_000 });
    await page.waitForTimeout(3_000); // fullchart has more UI chrome to settle

    await page.keyboard.press('Escape').catch(() => {});
    const chartEl = await page.$('.chart-container, canvas');
    if (chartEl) await chartEl.click({ position: { x: 400, y: 300 } }).catch(() => {});
    await page.waitForTimeout(300);

    await page.keyboard.press('Alt+G');
    await page.waitForTimeout(2_000); // dialog + calendar render takes a moment

    // CONFIRMED shape on the fullchart page: 2 separate inputs — a date
    // field with placeholder "YYYY-MM-DD", and a time field right after
    // it with no placeholder. Widget embed has 0 inputs (dialog never
    // opens there at all).
    const inputs = await page.$$('input');
    let dateInput = null;
    let timeInput = null;
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      if (placeholder && placeholder.toUpperCase().includes('YYYY-MM-DD')) {
        dateInput = inputs[i];
        timeInput = inputs[i + 1] || null;
        break;
      }
    }

    let fillAttempted = false;
    let fillError: string | null = null;
    if (dateInput) {
      try {
        // Both fields can start briefly disabled right after the dialog
        // opens — wait for "enabled" before interacting, same as the real
        // pipeline. 8s timeouts here — this is a debug probe, so if it's
        // still not clickable after that, we want to find out fast and
        // still return a screenshot, not hang.
        await dateInput.waitForElementState('enabled', { timeout: 8_000 }).catch(() => {});
        await dateInput.click({ timeout: 8_000 });
        await dateInput.press('Control+A').catch(() => {});
        await page.keyboard.type(testDate, { delay: 50 });

        // Same fix as screenshotChartAt(): neither typing nor clicking the
        // calendar day cell unlocks the time field. Press Tab to move focus
        // from date -> time the way a human would; that's what actually
        // triggers TradingView's enable logic.
        await page.keyboard.press('Tab');
        await page.waitForTimeout(300);

        if (timeInput) {
          await timeInput.waitForElementState('enabled', { timeout: 8_000 }).catch(() => {});
          await timeInput.press('Control+A').catch(() => {});
          await page.keyboard.type(testTime, { delay: 50 });
        }
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1_500);
        fillAttempted = true;
      } catch (err: any) {
        fillError = err.message;
      }
    }

    const screenshotBuffer = await page.screenshot({ type: 'png' });

    const inputInfo = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          type: el.getAttribute('type'),
          className: el.className,
          placeholder: el.getAttribute('placeholder'),
          value: (el as HTMLInputElement).value,
          visible: rect.width > 0 && rect.height > 0,
          disabled: el.disabled,
          ariaDisabled: el.getAttribute('aria-disabled'),
        };
      });
    });

    // Look for tab-like buttons near the dialog (e.g. "Bars" vs "Date"
    // mode toggles) — if the date input is disabled, it's likely because
    // a different tab/mode is currently selected and needs clicking first.
    const nearbyButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, [role="tab"], [role="radio"]'))
        .map((el) => ({
          text: (el.textContent || '').trim(),
          role: el.getAttribute('role'),
          ariaSelected: el.getAttribute('aria-selected'),
          className: el.className,
        }))
        .filter((b) => b.text && b.text.length < 40); // drop icon-only/huge buttons
    });

    res.json({
      mode,
      symbol,
      dateInputFound: !!dateInput,
      timeInputFound: !!timeInput,
      fillAttempted,
      fillError,
      testDate,
      testTime,
      inputCount: inputInfo.length,
      inputs: inputInfo,
      nearbyButtons,
      screenshotBase64: screenshotBuffer.toString('base64'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close();
  }
});

app.listen(PORT, () => {
  console.log(`[chart-screenshot] worker listening on :${PORT}`);
});

process.on('SIGTERM', async () => {
  if (browserPromise) (await browserPromise).close();
  process.exit(0);
});
