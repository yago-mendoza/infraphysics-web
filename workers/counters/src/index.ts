import { DurableObject } from 'cloudflare:workers';

type Entry = { key: string; value: string; expires: number | null };
type Input = { op: string; slug?: string; hash?: string; mutate?: boolean; slugs?: string[];
  path?: string; visitorId?: string; sessionId?: string; country?: string;
  referrer?: string; device?: string; language?: string; cursor?: string;
  snapshot?: string; entries?: Entry[]; expected?: number; from?: string; to?: string };
const DAY = 86400;
const json = (value: unknown, status = 200) => Response.json(value, { status });
export const migratable = (key: string) => /^(views:|hearts:|seen:|hearted:|analytics:)/.test(key) || key === 'presence:last';

// Only a bound Worker can reach this object. The Worker itself has no public API.
export class Counters extends DurableObject {
  private sql: SqlStorage;
  constructor(ctx: DurableObjectState, env: Record<string, unknown>) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS entries (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER);
      CREATE INDEX IF NOT EXISTS entries_expiry ON entries(expires) WHERE expires IS NOT NULL;
      CREATE TABLE IF NOT EXISTS daily (day TEXT, key TEXT, value INTEGER NOT NULL, PRIMARY KEY(day,key));
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  }
  private now() { return Math.floor(Date.now() / 1000); }
  private get(key: string) {
    return this.sql.exec<{ value: string }>('SELECT value FROM entries WHERE key=? AND (expires IS NULL OR expires>?)', key, this.now()).toArray()[0]?.value ?? null;
  }
  private put(key: string, value: string, ttl?: number) {
    this.sql.exec('INSERT INTO entries VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,expires=excluded.expires', key, value, ttl ? this.now() + ttl : null);
  }
  private count(key: string) { return Number.parseInt(this.get(key) || '0', 10) || 0; }
  private bump(key: string) { const n = this.count(key) + 1; this.put(key, String(n)); return n; }
  private daily(key: string) {
    this.sql.exec('INSERT INTO daily VALUES(?,?,1) ON CONFLICT(day,key) DO UPDATE SET value=value+1', new Date().toISOString().slice(0, 10), key);
  }
  private meta(key: string) { return this.sql.exec<{value: string}>('SELECT value FROM meta WHERE key=?', key).toArray()[0]?.value; }
  private setMeta(key: string, value: string) { this.sql.exec('INSERT INTO meta VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, value); }

  async fetch(request: Request) {
    let input: Input;
    try { input = await request.json(); } catch { return json({error: 'Invalid JSON'}, 400); }
    // Every read-modify-write operation below is synchronous within one SQL transaction.
    // Do not insert awaits into handle(): DO requests can interleave across awaits.
    try {
      const result = this.ctx.storage.transactionSync(() => this.handle(input));
      if (this.meta('state') === 'ready' && await this.ctx.storage.getAlarm() === null) {
        await this.ctx.storage.setAlarm(Date.now() + DAY * 1000);
      }
      return json(result);
    } catch (error) {
      return json({error: error instanceof Error ? error.message : 'Counter operation failed'}, 409);
    }
  }
  private handle(i: Input): unknown {
    const state = this.meta('state') || 'empty';
    if (i.op === 'status') return {state, snapshot: this.meta('snapshot') || null};
    if (i.op === 'begin') {
      if (!i.snapshot || !/^[a-zA-Z0-9-]{1,80}$/.test(i.snapshot)) throw new Error('Invalid snapshot');
      if (state !== 'empty' && (state !== 'staging' || this.meta('snapshot') !== i.snapshot)) throw new Error('Object already initialized');
      this.setMeta('snapshot', i.snapshot); this.setMeta('state', 'staging');
      return {ok: true};
    }
    if (i.op === 'import') {
      if (state !== 'staging' || this.meta('snapshot') !== i.snapshot) throw new Error('Wrong migration state');
      if (!Array.isArray(i.entries) || i.entries.length > 100) throw new Error('Invalid batch');
      for (const row of i.entries) {
        if (!row || typeof row.key !== 'string' || !migratable(row.key) || row.key.length > 512 || typeof row.value !== 'string' || row.value.length > 4096 || (row.expires !== null && (!Number.isInteger(row.expires) || row.expires <= 0))) throw new Error('Invalid entry');
        const old = this.sql.exec<Entry>('SELECT * FROM entries WHERE key=?', row.key).toArray()[0];
        if (old && (old.value !== row.value || old.expires !== row.expires)) throw new Error('Snapshot conflict');
        this.sql.exec('INSERT OR IGNORE INTO entries VALUES(?,?,?)', row.key, row.value, row.expires);
      }
      return {ok: true};
    }
    if (i.op === 'activate') {
      if (state !== 'staging' || this.meta('snapshot') !== i.snapshot) throw new Error('Wrong migration state');
      const count = this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM entries').one().n;
      if (!Number.isInteger(i.expected) || count !== i.expected) throw new Error('Snapshot size mismatch');
      this.setMeta('state', 'ready'); this.setMeta('started', new Date().toISOString());
      return {ok: true, count};
    }
    if (i.op === 'export') {
      const entries = this.sql.exec<Entry>('SELECT * FROM entries WHERE key>? ORDER BY key LIMIT 100', i.cursor || '').toArray();
      return {entries, cursor: entries.length === 100 ? entries[entries.length - 1].key : null};
    }
    if (state !== 'ready') throw new Error('Counters not activated');
    if (i.op === 'report') {
      const from = i.from || '0000-01-01', to = i.to || '9999-12-31';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) throw new Error('Invalid date range');
      return {
      started: this.meta('started'), totals: {pageviews: this.count('analytics:pageviews'), sessions: this.count('analytics:sessions'), visitors: this.count('analytics:visitors')},
      daily: this.sql.exec('SELECT day,key,value FROM daily WHERE day>=? AND day<=? ORDER BY day DESC,key LIMIT 10000', from, to).toArray(),
      pages: this.sql.exec("SELECT key,value FROM entries WHERE key LIKE 'analytics:path:%' ORDER BY CAST(value AS INTEGER) DESC LIMIT 100").toArray(),
      limits: {dailyRows: 10000, topPages: 100},
    }; }
    if (i.op === 'stats') return Object.fromEntries((i.slugs || []).slice(0,50).map(slug => [slug, {views: this.count(`views:${slug}`)}]));
    if (i.op === 'presence') return {lastVisitor: this.get('presence:last') ? JSON.parse(this.get('presence:last')!) : null,
      pageViews: this.count('analytics:pageviews'), visits: this.count('analytics:sessions'), visitors: this.count('analytics:visitors')};
    if (i.op === 'view') {
      const key = `views:${i.slug}`;
      if (i.mutate && !this.get(`seen:${i.hash}`)) { this.bump(key); this.put(`seen:${i.hash}`, '1', DAY); this.daily(key); }
      return {slug: i.slug, views: this.count(key)};
    }
    if (i.op === 'heart') {
      const key = `hearts:${i.slug}`, seen = `hearted:${i.hash}`;
      let hearted = !!this.get(seen), hearts = this.count(key);
      if (i.mutate) {
        hearts = Math.max(0, hearts + (hearted ? -1 : 1));
        this.put(key, String(hearts));
        if (hearted) this.sql.exec('DELETE FROM entries WHERE key=?', seen); else this.put(seen, '1');
        this.daily(hearted ? 'hearts_removed' : 'hearts_added'); hearted = !hearted;
      }
      return {slug: i.slug, hearts, hearted};
    }
    if (i.op === 'pageview') {
      const visitor = `analytics:visitor:${i.visitorId}`, session = `analytics:session:${i.sessionId}`;
      const seen = `analytics:seen:${i.sessionId}:${i.path}`;
      if (!this.get(visitor)) { this.put(visitor, '1'); this.bump('analytics:visitors'); this.daily('visitors'); }
      if (!this.get(session)) {
        this.put(session, '1', DAY * 90); this.bump('analytics:sessions'); this.daily('sessions');
        this.daily(`entry:${i.path}`); this.daily(`referrer:${i.referrer || 'direct'}`);
        this.daily(`country:${i.country || 'unknown'}`); this.daily(`device:${i.device || 'unknown'}`); this.daily(`language:${i.language || 'unknown'}`);
      }
      if (!this.get(seen)) {
        this.put(seen, '1', 1800); this.bump('analytics:pageviews'); this.bump(`analytics:path:${i.path}`);
        this.daily('pageviews'); this.daily(`path:${i.path}`);
      }
      // Public presence keeps its contract without revealing a last visitor's city.
      if (i.country && this.get('presence:last') !== JSON.stringify({city: '', country: i.country})) this.put('presence:last', JSON.stringify({city: '', country: i.country}));
      return {ok: true};
    }
    throw new Error('Unknown operation');
  }
  async alarm() {
    this.sql.exec('DELETE FROM entries WHERE expires IS NOT NULL AND expires<=?', this.now());
    // Daily aggregates and all-time totals have no automatic expiry.
    await this.ctx.storage.setAlarm(Date.now() + DAY * 1000);
  }
}

export default { fetch() { return new Response('Not found', {status: 404}); } };
