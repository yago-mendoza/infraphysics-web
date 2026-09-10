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
export async function callCounters(env: CounterEnv, data: unknown): Promise<Response> {
  if (!env.COUNTERS) return json({error: 'COUNTERS not bound'}, 503);
  try {
    const response = await env.COUNTERS.get(env.COUNTERS.idFromName('site')).fetch('https://counters.internal/', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data),
    });
    return new Response(response.body, {status: response.ok ? 200 : 503, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*'}});
  } catch { return json({error: 'Counters unavailable'}, 503); }
}
