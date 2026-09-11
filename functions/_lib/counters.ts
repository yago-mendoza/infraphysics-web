export interface CounterEnv {
  VIEWS?: KVNamespace;
  COUNTERS?: DurableObjectNamespace;
  COUNTERS_BACKEND?: string;
  COUNTERS_PAUSED?: string;
  COUNTERS_ADMIN_TOKEN?: string;
  COUNTERS_MIGRATION_ENABLED?: string;
}
export const json = (data: unknown, status = 200) => Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
export const durable = (env: CounterEnv) => env.COUNTERS_BACKEND === 'durable';
export const validPath = (path: unknown): path is string => typeof path === 'string' && /^\/[a-zA-Z0-9/_-]{0,200}$/.test(path);
export const bot = (request: Request) => /bot|crawler|spider|headless|preview|facebookexternalhit|slurp/i.test(request.headers.get('user-agent') || '');
export function mutationGuard(request: Request, env: CounterEnv): Response | null {
  if (env.COUNTERS_PAUSED === '1') return json({error: 'Counters temporarily paused'}, 503);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({error: 'Cross-origin write rejected'}, 403);
  return null;
}
export async function callCounters(env: CounterEnv, request:Request, data: unknown): Promise<Response> {
  if (!env.COUNTERS) return json({error: 'COUNTERS not bound'}, 503);
  try {
    const clientKey=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(new Date().toISOString().slice(0,10)+':'+(request.headers.get('CF-Connecting-IP')||'unknown'))))).map(v=>v.toString(16).padStart(2,'0')).join('');
    const response = await env.COUNTERS.get(env.COUNTERS.idFromName('site')).fetch('https://counters.internal/', {
      method: 'POST', headers: {'Content-Type': 'application/json','X-Counter-Client':clientKey}, body: JSON.stringify(data),
    });
    if(!response.ok){const rejected=json({error:response.status===429?'Too many requests':'Counters unavailable'},response.status===429?429:503);if(response.status===429)rejected.headers.set('Retry-After','60');return rejected;}
    return new Response(response.body, {status:200, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
  } catch { return json({error: 'Counters unavailable'}, 503); }
}
