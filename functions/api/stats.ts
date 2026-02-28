// Cloudflare Pages Function — bulk stats endpoint.
// POST /api/stats with { slugs: ["/lab/projects/foo", ...] }
// Returns { [slug]: { views: number, hearts: number } }

interface Env {
  VIEWS: KVNamespace;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!env.VIEWS) {
    return json({ error: 'KV not bound' }, 503);
  }

  let body: { slugs?: string[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const slugs = body.slugs;
  if (!Array.isArray(slugs) || slugs.length === 0) {
    return json({ error: 'slugs array required' }, 400);
  }

  // Cap at 50 to avoid abuse
  const capped = slugs.slice(0, 50);

  // Fetch all views and hearts in parallel
  const results: Record<string, { views: number; hearts: number }> = {};
  await Promise.all(
    capped.map(async (slug) => {
      const [viewsVal, heartsVal] = await Promise.all([
        env.VIEWS.get(`views:${slug}`),
        env.VIEWS.get(`hearts:${slug}`),
      ]);
      results[slug] = {
        views: viewsVal ? parseInt(viewsVal, 10) : 0,
        hearts: heartsVal ? parseInt(heartsVal, 10) : 0,
      };
    })
  );

  return json(results);
};
