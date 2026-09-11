import {readJson, knownPath, InputError} from '../_lib/security';
import { bot, callCounters, durable, mutationGuard, validPath, type CounterEnv as Env } from '../_lib/counters';

type AnalyticsEvent = {
  path?: string;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  language?: string;
  type?: 'pageview' | 'engagement';
  visitId?: string;
  previousPath?: string;
  activeMs?: number;
  scroll?: number;
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
  const rejected = mutationGuard(request, env); if (rejected) return rejected;
  if (bot(request)) return new Response(JSON.stringify({ok: true, ignored: true}), {headers});
  if (!env.VIEWS && !durable(env)) return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 503, headers });

  let event: AnalyticsEvent;
  try { event = await readJson(request,2048) as AnalyticsEvent; } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: error instanceof InputError?error.status:400, headers });
  }
  if (!event || !validPath(event.path) || !knownPath(event.path) || typeof event.visitorId!=='string' || typeof event.sessionId!=='string' || (event.language!==undefined&&typeof event.language!=='string') || (event.referrer!==undefined&&typeof event.referrer!=='string') || !/^[a-zA-Z0-9-]{1,80}$/.test(event.visitorId || '') || !/^[a-zA-Z0-9-]{1,80}$/.test(event.sessionId || '')) {
    return new Response(JSON.stringify({ error: 'Missing analytics identity' }), { status: 400, headers });
  }
  if ((event.type && !['pageview','engagement'].includes(event.type)) || (event.visitId !== undefined && (typeof event.visitId !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(event.visitId))) || (event.previousPath !== undefined && !validPath(event.previousPath))) return new Response(JSON.stringify({error:'Invalid event'}),{status:400,headers});
  if(event.type==='engagement'){
    if(!event.visitId||typeof event.activeMs!=='number'||!Number.isFinite(event.activeMs)||event.activeMs<0||event.activeMs>86400000||typeof event.scroll!=='number'||!Number.isFinite(event.scroll)||event.scroll<0||event.scroll>100)return new Response(JSON.stringify({error:'Invalid measurement'}),{status:400,headers});
    if(!durable(env))return new Response(JSON.stringify({ok:true,ignored:true}),{headers});
    return callCounters(env, request,{op:'engagement',visitId:event.visitId,sessionId:event.sessionId,path:event.path,activeMs:event.activeMs,scroll:event.scroll});
  }

  if (durable(env)) {
    let referrer = 'direct';
    try {
      const host = new URL(event.referrer || '').hostname.replace(/^www\./, '');
      referrer = host === new URL(request.url).hostname ? 'internal' : /(^|\.)(google\.[a-z.]+|bing.com|duckduckgo.com|linkedin.com|news.ycombinator.com|t.co|x.com|facebook.com|reddit.com)$/.test(host) ? host : 'other';
    } catch { /* No external referrer. */ }
    const cf = request.cf as {country?: string} | undefined;
    return callCounters(env, request, {op:'pageview', path:event.path, visitorId:event.visitorId, sessionId:event.sessionId,
      visitId:event.visitId,previousPath:event.previousPath,
      country: /^[A-Z]{2}$/.test(cf?.country || '') ? cf!.country : 'unknown', referrer,
      device:/mobile|android|iphone/i.test(request.headers.get('User-Agent') || '') ? 'mobile' : 'desktop',
      language: /^[a-z]{2}$/i.test(event.language || '') ? event.language!.toLowerCase() : 'unknown'});
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

