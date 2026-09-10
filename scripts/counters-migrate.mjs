// Run only while public counter writes are paused; reads remain available in KV.
// Credentials come from the environment, never command-line arguments or URLs.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';

const [command = 'help', filename] = process.argv.slice(2);
if (!['export-kv','import','export-durable'].includes(command)) {
  console.log('COUNTERS_URL=https://infraphysics.net COUNTERS_ADMIN_TOKEN=<secret>\nCommands: export-kv | import <snapshot.json> | export-durable');
  process.exit(command === 'help' ? 0 : 1);
}
const token = process.env.COUNTERS_ADMIN_TOKEN;
const base = new URL(process.env.COUNTERS_URL || 'https://infraphysics.net');
if (base.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(base.hostname)) throw new Error('HTTPS required');
if (!token || token.length < 32) throw new Error('Set COUNTERS_ADMIN_TOKEN (at least 32 characters)');
const api = async body => {
  const response = await fetch(new URL('/api/admin/counters', base), {method:'POST', redirect:'error', headers:{Authorization:`Bearer ${token}`, 'Content-Type':'application/json'}, body:JSON.stringify(body)});
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error || 'Request failed'}`);
  return result;
};
async function collect(op) {
  const entries = []; let cursor;
  do { const page = await api({op,cursor}); entries.push(...page.entries); cursor = page.cursor; } while (cursor);
  return entries.sort((a,b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}
// TTL records can expire between snapshots. Compare only records valid at the comparison time.
const live = rows => rows.filter(row => row.expires === null || row.expires > Date.now()/1000);
if (command === 'import') {
  if (!filename) throw new Error('Snapshot filename required');
  const snapshot = JSON.parse(await readFile(filename, 'utf8'));
  if (snapshot.version !== 1 || snapshot.source !== base.origin || !Array.isArray(snapshot.entries)) throw new Error('Invalid snapshot or origin mismatch');
  // Compare the frozen source again: refuse a stale backup or a write made during cutover.
  assert.deepEqual(live(await collect('kv-export')), live(snapshot.entries), 'KV changed since export; create a fresh snapshot');
  await api({op:'begin', snapshot:snapshot.id});
  for (let n=0;n<snapshot.entries.length;n+=100) await api({op:'import', snapshot:snapshot.id, entries:snapshot.entries.slice(n,n+100)});
  assert.deepEqual(await collect('export'), snapshot.entries, 'Durable snapshot differs; activation refused');
  await api({op:'activate', snapshot:snapshot.id, expected:snapshot.entries.length});
  console.log(`Verified and activated ${snapshot.entries.length} entries. Set COUNTERS_BACKEND=durable, redeploy while still paused, verify, then unpause.`);
} else {
  const op = command === 'export-kv' ? 'kv-export' : 'export';
  const entries = await collect(op);
  if (op === 'kv-export') {
    console.log('Waiting 65 seconds for a second KV snapshot. Public writes must stay paused.');
    for (let n=0;n<13;n++) await new Promise(resolve => setTimeout(resolve, 5000));
    assert.deepEqual(live(await collect(op)), live(entries), 'KV is still changing; keep paused and retry');
  }
  const id = randomUUID(), path = `room/counters-backups/${id}.json`;
  await mkdir('room/counters-backups', {recursive:true});
  await writeFile(path, JSON.stringify({version:1, id, source:base.origin, created:new Date().toISOString(), entries},null,2), {flag:'wx'});
  console.log(`Saved ${entries.length} entries to ${path}. This backup contains pseudonymous identifiers; keep it private.`);
}
