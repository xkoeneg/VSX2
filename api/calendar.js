// api/calendar.js
//
// Vercel Serverless Function that fetches the Myfxbook economic calendar
// RSS feed on the server and streams the raw XML back to the browser.
// Because the request to myfxbook.com happens server-side (not from the
// user's browser), the browser is only ever talking to your own domain —
// permanently eliminating CORS errors on the client.
//
// NOTE: the correct, currently-live feed path is
// "forex-economic-calendar-events" (not "forex-economic-calendar" — that
// one 404s). This function fetches that path.
//
// UPDATE: added a small retry-with-backoff loop before giving up. Myfxbook
// occasionally answers a single request with a transient non-200 (rate
// limiting, a momentary hiccup on their end, etc.) even though the feed
// itself is live — retrying 2-3 times with a short delay clears most of
// those without the client ever seeing a 502.

const MYFXBOOK_RSS_URL = 'https://www.myfxbook.com/rss/forex-economic-calendar-events';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800; // base delay; doubles each retry (backoff)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry() {
  let lastStatus = null;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const upstreamResponse = await fetch(MYFXBOOK_RSS_URL, {
        headers: {
          // Some sites block requests without a browser-like UA/Accept —
          // this keeps the proxy request looking like a normal RSS fetch.
          'User-Agent':
            'Mozilla/5.0 (compatible; VSX-EconomicCalendarBot/1.0; +https://vercel.com)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        // Vercel functions have their own execution timeout; this just
        // avoids hanging on a slow/unresponsive upstream.
        signal: AbortSignal.timeout(10_000),
      });

      if (upstreamResponse.ok) {
        const xml = await upstreamResponse.text();
        return { ok: true, xml };
      }

      lastStatus = upstreamResponse.status;

      // Don't bother retrying on a clean 4xx (bad request/URL moved/etc.) —
      // that's not transient, it'll fail the same way every time. Only
      // retry on 429 (rate limited) and 5xx (upstream having a bad moment).
      if (lastStatus < 429 && lastStatus < 500) break;
    } catch (err) {
      lastError = err;
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS * attempt); // 800ms, then 1600ms
    }
  }

  return { ok: false, status: lastStatus, error: lastError };
}

export default async function handler(req, res) {
  // Only GET is meaningful for a read-only proxy.
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await fetchWithRetry();

  if (!result.ok) {
    if (result.error) {
      const isTimeout = result.error?.name === 'TimeoutError' || result.error?.name === 'AbortError';
      return res.status(isTimeout ? 504 : 500).json({
        error: isTimeout ? 'Myfxbook request timed out' : 'Failed to fetch economic calendar',
        message: result.error instanceof Error ? result.error.message : String(result.error),
      });
    }

    return res.status(502).json({
      error: 'Upstream Myfxbook request failed',
      status: result.status,
      attempts: MAX_ATTEMPTS,
    });
  }

  // Let the browser (and, more importantly, Vercel's edge/CDN cache)
  // treat this as an XML document.
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  // CORS: allow this endpoint to be called from any origin your app is
  // served on. Tighten to your exact domain in production if you like.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Cache at the edge for 5 minutes, and allow serving a slightly stale
  // copy for up to a minute while a fresh one is fetched in the
  // background — keeps the calendar fast without hammering Myfxbook.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  return res.status(200).send(result.xml);
}
