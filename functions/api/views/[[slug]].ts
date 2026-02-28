// Cloudflare Pages Function — article view counter backed by KV.
// POST /api/views/{slug} → increment + return count (IP-deduped per 24h)
// GET  /api/views/{slug} → return count without incrementing

interface Env {
  VIEWS: KVNamespace;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

/** Simple hash for IP-based dedup — no crypto import needed on Workers. */
async function hashKey(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf).slice(0, 8))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function slugFromUrl(url: URL): string {
  // /api/views/lab/projects/foo → lab/projects/foo
  const raw = url.pathname.replace(/^\/api\/views\/?/, '');
  // Normalize: add leading slash, strip trailing slash
  let slug = raw.startsWith('/') ? raw : `/${raw}`;
  if (slug.length > 1 && slug.endsWith('/')) slug = slug.slice(0, -1);
  return slug;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (!env.VIEWS) {
    return json({ error: 'KV not bound' }, 503);
  }

  const url = new URL(request.url);
  const slug = slugFromUrl(url);

  if (!slug || slug === '/') {
    return json({ error: 'Missing slug' }, 400);
  }

  const kvKey = `views:${slug}`;

  if (request.method === 'GET') {
    const val = await env.VIEWS.get(kvKey);
    return json({ slug, views: val ? parseInt(val, 10) : 0 });
  }

  if (request.method === 'POST') {
    // IP-based dedup: one increment per IP+slug per 24 hours
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const seenKey = `seen:${await hashKey(`${ip}:${slug}`)}`;
    const alreadySeen = await env.VIEWS.get(seenKey);

    const currentVal = await env.VIEWS.get(kvKey);
    let count = currentVal ? parseInt(currentVal, 10) : 0;

    if (!alreadySeen) {
      count++;
      await env.VIEWS.put(kvKey, count.toString());
      await env.VIEWS.put(seenKey, '1', { expirationTtl: 86400 }); // 24h
    }

    return json({ slug, views: count });
  }

  return json({ error: 'Method not allowed' }, 405);
};
