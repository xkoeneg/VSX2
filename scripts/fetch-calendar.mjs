// scripts/fetch-calendar.mjs
//
// Runs on GitHub Actions (see .github/workflows/fetch-calendar.yml), on a
// schedule — NOT on Vercel. GitHub Actions runners have a different IP
// range than Vercel's serverless functions, which is the whole point:
// Myfxbook is 403-blocking Vercel's IPs specifically, so we fetch from
// somewhere else and hand the result to Supabase, where the Vercel
// function can read it without ever talking to Myfxbook itself.
//
// Requires two environment variables (set as GitHub Actions secrets):
//   SUPABASE_URL              - same value as your app's Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY - the *service role* key (not the anon key!)
//                                Project Settings -> API -> service_role.
//                                This key bypasses Row Level Security, which
//                                is what lets this script write to a table
//                                the frontend can only read from.

const MYFXBOOK_RSS_URL = 'https://www.myfxbook.com/rss/forex-economic-calendar-events';
const CACHE_ROW_ID = 'myfxbook-economic-calendar';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

async function main() {
  console.log('Fetching Myfxbook economic calendar feed...');

  const upstreamResponse = await fetch(MYFXBOOK_RSS_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.myfxbook.com/forex-economic-calendar',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!upstreamResponse.ok) {
    console.error(`Myfxbook responded with ${upstreamResponse.status}. Leaving existing cache untouched.`);
    process.exit(1);
  }

  const xml = await upstreamResponse.text();

  if (!xml || xml.length < 200) {
    console.error('Response looked too short/empty to be a real feed. Leaving existing cache untouched.');
    process.exit(1);
  }

  console.log(`Fetched ${xml.length} chars of XML. Upserting into Supabase...`);

  // Supabase REST upsert: POST with Prefer: resolution=merge-duplicates
  // acts as an upsert keyed on the table's primary key (id).
  const upsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/calendar_cache`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify([
      {
        id: CACHE_ROW_ID,
        xml,
        fetched_at: new Date().toISOString(),
      },
    ]),
  });

  if (!upsertResponse.ok) {
    const body = await upsertResponse.text();
    console.error(`Supabase upsert failed (${upsertResponse.status}): ${body}`);
    process.exit(1);
  }

  console.log('Cache updated successfully.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
