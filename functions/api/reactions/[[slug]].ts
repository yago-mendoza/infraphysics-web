// Cloudflare Pages Function — heart reactions backed by KV.
// POST /api/reactions/{slug} → toggle heart for this IP, return new count + status
// GET  /api/reactions/{slug} → return heart count + whether this IP has hearted

interface Env {
  VIEWS: KVNamespace; // shared namespace for views + reactions
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

async function ipHash(ip: string, slug: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${slug}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf).slice(0, 10))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function slugFromUrl(url: URL): string {
  const raw = url.pathname.replace(/^\/api\/reactions\/?/, '');
  let slug = raw.startsWith('/') ? raw : `/${raw}`;
  if (slug.length > 1 && slug.endsWith('/')) slug = slug.slice(0, -1);
  return slug;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const hash = await ipHash(ip, slug);
  const heartedKey = `hearted:${hash}`;
  const heartsKey = `hearts:${slug}`;

  if (request.method === 'GET') {
    const [countVal, heartedVal] = await Promise.all([
      env.VIEWS.get(heartsKey),
      env.VIEWS.get(heartedKey),
    ]);
    return json({
      slug,
      hearts: countVal ? parseInt(countVal, 10) : 0,
      hearted: !!heartedVal,
    });
  }

  if (request.method === 'POST') {
    const [countVal, heartedVal] = await Promise.all([
      env.VIEWS.get(heartsKey),
      env.VIEWS.get(heartedKey),
    ]);
    let count = countVal ? parseInt(countVal, 10) : 0;
    const wasHearted = !!heartedVal;

    if (wasHearted) {
      // Un-heart
      count = Math.max(0, count - 1);
      await Promise.all([
        env.VIEWS.put(heartsKey, count.toString()),
        env.VIEWS.delete(heartedKey),
      ]);
    } else {
      // Heart
      count++;
      await Promise.all([
        env.VIEWS.put(heartsKey, count.toString()),
        env.VIEWS.put(heartedKey, '1'),
      ]);
    }

    return json({ slug, hearts: count, hearted: !wasHearted });
  }

  return json({ error: 'Method not allowed' }, 405);
};
