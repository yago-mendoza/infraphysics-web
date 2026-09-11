import {readJson, InputError} from '../../_lib/security';
import { callCounters, durable, json, type CounterEnv } from '../../_lib/counters';

const scopedKey = (key: string) => /^(views:|hearts:|seen:|hearted:|analytics:)/.test(key) || key === 'presence:last';
async function authorized(request: Request, token?: string) {
  if (!token || token.length < 32) return false;
  const supplied = request.headers.get('Authorization') || '';
  // Hash both strings before comparison, so the comparison doesn't reveal a token prefix.
  const hash = async (text: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  const [a,b] = await Promise.all([hash(supplied), hash(`Bearer ${token}`)]);
  let diff = 0; for (let n=0; n<a.length; n++) diff |= a[n] ^ b[n];
  return diff === 0;
}
export const onRequest: PagesFunction<CounterEnv> = async ({request, env}) => {
  // Never permit query-string credentials or cross-origin admin responses.
  if (!await authorized(request, env.COUNTERS_ADMIN_TOKEN)) return json({error: 'Unauthorized'}, 401);
  if (request.method !== 'POST') return json({error: 'POST required'}, 405);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({error: 'Forbidden'}, 403);
  if (Number(request.headers.get('Content-Length') || 0) > 600000) return json({error: 'Request too large'}, 413);
  let body: Record<string, unknown>;
  try {body=await readJson(request,600000);} catch(error) {return json({error:'Invalid request'},error instanceof InputError?error.status:400);}
  if (!body || typeof body !== 'object') return json({error:'Invalid request'},400);
  const op = body.op;
  if (typeof op!=='string'||!['status','report','export','kv-export','begin','import','activate'].includes(op)) return json({error:'Unknown operation'},400);
  if (['kv-export','begin','import','activate'].includes(String(op)) && (env.COUNTERS_MIGRATION_ENABLED !== '1' || env.COUNTERS_PAUSED !== '1' || durable(env))) return json({error:'Migration requires paused KV backend and migration flag'},409);
  if (op === 'kv-export') {
    if (!env.VIEWS) return json({error:'KV not bound'},503);
    const page = await env.VIEWS.list({limit:100, cursor: typeof body.cursor === 'string' ? body.cursor : undefined});
    const entries = await Promise.all(page.keys.filter(k => scopedKey(k.name)).map(async key => ({key:key.name, value:await env.VIEWS!.get(key.name), expires:key.expiration ?? null})));
    return json({entries: entries.filter(row => row.value !== null), cursor:'cursor' in page ? page.cursor : null});
  }
  const response = await callCounters(env, request, body);
  response.headers.delete('Access-Control-Allow-Origin');
  return response;
};
