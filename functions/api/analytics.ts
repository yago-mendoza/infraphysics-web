interface Env {
  VIEWS?: KVNamespace;
}

type AnalyticsEvent = {
  path?: string;
  visitorId?: string;
  sessionId?: string;
};

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
};

const readCount = async (kv: KVNamespace, key: string) => Number.parseInt(await kv.get(key) || '0', 10);
const increment = async (kv: KVNamespace, key: string) => {
  const next = await readCount(kv, key) + 1;
  await kv.put(key, String(next));
  return next;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.VIEWS) return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 503, headers });

  let event: AnalyticsEvent;
  try { event = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }
  if (!event.path || !event.visitorId || !event.sessionId) {
    return new Response(JSON.stringify({ error: 'Missing analytics identity' }), { status: 400, headers });
  }

  const visitorKey = `analytics:visitor:${event.visitorId}`;
  const sessionKey = `analytics:session:${event.sessionId}`;
  // A page view is one person on one page per session window: a reload, or coming straight back to the
  // same page, does not count again for half an hour. Moving to another page does.
  const seenKey = `analytics:seen:${event.sessionId}:${event.path}`;
  const [knownVisitor, knownSession, seenPage] = await Promise.all([
    env.VIEWS.get(visitorKey),
    env.VIEWS.get(sessionKey),
    env.VIEWS.get(seenKey),
  ]);

  const writes: Promise<unknown>[] = [];
  if (!seenPage) {
    writes.push(env.VIEWS.put(seenKey, '1', { expirationTtl: 60 * 30 }));
    writes.push(increment(env.VIEWS, 'analytics:pageviews'));
    writes.push(increment(env.VIEWS, `analytics:path:${event.path}`));
  }
  if (!knownVisitor) {
    writes.push(env.VIEWS.put(visitorKey, '1'));
    writes.push(increment(env.VIEWS, 'analytics:visitors'));
  }
  if (!knownSession) {
    writes.push(env.VIEWS.put(sessionKey, '1', { expirationTtl: 60 * 60 * 24 * 90 }));
    writes.push(increment(env.VIEWS, 'analytics:sessions'));
  }

  const cf = request.cf as { city?: string; region?: string; country?: string } | undefined;
  if (cf?.country) {
    writes.push(env.VIEWS.put('presence:last', JSON.stringify({
      city: cf.city || '',
      region: cf.region || '',
      country: cf.country,
    })));
  }
  await Promise.all(writes);
  return new Response(JSON.stringify({ ok: true }), { headers });
};

