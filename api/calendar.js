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
// UPDATE 1: retry-with-backoff before giving up on a transient failure.
// UPDATE 2: Myfxbook was returning 403 to every request from Vercel's
// server IPs — it was fingerprinting the request as a bot, not a browser
// (a bare User-Agent isn't enough; sites like this also check
// Accept-Language, Referer, and the sec-fetch-* / sec-ch-ua headers a real
// browser always sends). Added a fuller, more realistic header set below.
// UPDATE 3: added an in-memory last-good-response cache. If Myfxbook
// still 403s on a given invocation, we now serve the last successful XML
// (marked stale via a response header) instead of hard-failing the whole
// calendar. NOTE: this cache lives in the function's memory, so it only
// helps on "hot" invocations (same warm instance) — it resets on cold
// starts/redeploys. That's fine here since it's just a nice-to-have
// safety net on top of the retry logic, not the primary fix.

const MYFXBOOK_RSS_URL = 'https://www.myfxbook.com/rss/forex-economic-calendar-events';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800; // base delay; doubles each retry (backoff)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Module-scope = persists across invocations on the same warm instance.
let lastGoodXml = null;
let lastGoodAt = null;

function browserLikeHeaders() {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.myfxbook.com/forex-economic-calendar',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  };
}

async function fetchWithRetry() {
  let lastStatus = null;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const upstreamResponse = await fetch(MYFXBOOK_RSS_URL, {
        headers: browserLikeHeaders(),
        // Vercel functions have their own execution timeout; this just
        // avoids hanging on a slow/unresponsive upstream.
        signal: AbortSignal.timeout(10_000),
      });

      if (upstreamResponse.ok) {
        const xml = await upstreamResponse.text();
        return { ok: true, xml };
      }

      lastStatus = upstreamResponse.status;

      // Don't bother retrying on a clean 4xx (bad request/blocked/moved/
      // etc.) — that's not transient, it'll fail the same way every time.
      // Only retry on 429 (rate limited) and 5xx (upstream having a bad
      // moment).
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

  if (result.ok) {
    lastGoodXml = result.xml;
    lastGoodAt = new Date();
  } else if (lastGoodXml) {
    // Upstream failed this time, but we have something from a previous
    // successful fetch on this warm instance — better to serve slightly
    // stale data than to break the calendar/notification bell entirely.
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('X-Calendar-Stale', 'true');
    res.setHeader('X-Calendar-Stale-Since', lastGoodAt ? lastGoodAt.toISOString() : '');
    return res.status(200).send(lastGoodXml);
  }

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
