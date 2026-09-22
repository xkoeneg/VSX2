// api/calendar.js
//
// Vercel Serverless Function that serves the economic calendar RSS feed
// to the browser.
//
// HISTORY: this used to fetch https://www.myfxbook.com/rss/forex-economic-calendar-events
// directly from this function. Myfxbook started returning 403 Forbidden to
// every request from Vercel's server IPs (confirmed via logs — not
// timeouts, not rate limiting, a flat 403 fingerprinting the request as a
// bot regardless of headers). Since that's an IP-level block, no header
// tweaking fixes it from inside Vercel.
//
// NEW APPROACH: a separate GitHub Actions cron job (scripts/fetch-calendar.mjs,
// see .github/workflows/fetch-calendar.yml), which runs from GitHub's IP
// range instead of Vercel's, fetches the feed every 15 minutes and writes
// the raw XML into a Supabase table (calendar_cache). This function now
// just reads that cached XML back out of Supabase and forwards it to the
// browser — it never talks to Myfxbook itself anymore, so Vercel's IP
// block is no longer relevant.
//
// Requires two environment variables (Vercel Project Settings -> Environment
// Variables — same Supabase project your app already uses):
//   SUPABASE_URL       - your Supabase project URL
//   SUPABASE_ANON_KEY  - the anon/public key (read-only access to this
//                         table via the RLS policy in the migration; do NOT
//                         use the service role key here, this code runs
//                         in a context reachable from the browser's request)

const CACHE_ROW_ID = 'myfxbook-economic-calendar';

// How old the cached feed is allowed to get before we start warning about
// it in the response headers (the cron job refreshes every 15 min, so
// anything beyond ~30 min means the cron job itself has stopped running).
const STALE_THRESHOLD_MS = 30 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({
      error: 'Server misconfigured',
      message: 'SUPABASE_URL / SUPABASE_ANON_KEY are not set on this Vercel project.',
    });
  }

  try {
    const query = `${SUPABASE_URL}/rest/v1/calendar_cache?id=eq.${CACHE_ROW_ID}&select=xml,fetched_at&limit=1`;

    const supabaseResponse = await fetch(query, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!supabaseResponse.ok) {
      return res.status(502).json({
        error: 'Failed to read calendar cache from Supabase',
        status: supabaseResponse.status,
      });
    }

    const rows = await supabaseResponse.json();
    const row = Array.isArray(rows) ? rows[0] : null;

    if (!row || !row.xml) {
      // The cron job hasn't populated the table yet (e.g. right after
      // running the migration, before the first Action run).
      return res.status(503).json({
        error: 'Calendar cache is empty',
        message: 'The GitHub Actions fetch job has not populated calendar_cache yet. Run it once manually from the Actions tab.',
      });
    }

    const fetchedAt = row.fetched_at ? new Date(row.fetched_at) : null;
    const isStale = fetchedAt ? Date.now() - fetchedAt.getTime() > STALE_THRESHOLD_MS : true;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    // Short edge cache since the underlying data only changes every 15 min
    // via the cron job anyway.
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    if (fetchedAt) res.setHeader('X-Calendar-Fetched-At', fetchedAt.toISOString());
    if (isStale) res.setHeader('X-Calendar-Stale', 'true');

    return res.status(200).send(row.xml);
  } catch (err) {
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? 'Supabase request timed out' : 'Failed to read economic calendar cache',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
