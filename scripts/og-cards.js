#!/usr/bin/env node
/**
 * og-cards.js — the share cards (og:image) of every shareable url, photographed from the site itself.
 *
 * How it works
 *   The dev server renders one card at a time at /og/card/<kind>/<id> (OgCardView, dev-only). This
 *   script drives a headless Chrome over CDP through every card, screenshots the 1200 x 630 viewport,
 *   encodes a JPEG (crawlers dislike WebP; WhatsApp wants under 600 KB) and uploads it to R2 under
 *   og/<kind>/<id>.jpg. src/data/og-cards.json (tracked) records each card's key, version and the
 *   hash of what it shows, so a run only regenerates cards whose text, cover or design changed.
 *   build-content.js reads that file and points og-manifest.json at the CDN url of each card.
 *
 *   node scripts/og-cards.js [scope …] [--base http://localhost:3000] [--force] [--dry] [--limit N]
 *
 *   scope    article | playground | wiki | section | page, or one id (a post id, a note uid, a page id)
 *   --base   where the dev server runs (default http://localhost:3000, or OG_BASE in the environment)
 *   --force  regenerate every card in scope even if nothing changed
 *   --dry    render and encode, write nothing to R2 or to the manifest
 *   --limit  stop after N cards (a quick check of the pipeline)
 *
 * Credentials come from .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 * optional R2_PUBLIC_BASE), as for media.js. Chrome is looked up in the usual places or CHROME_PATH.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { routeEntries } from './content-files.js';
import { createContentRoutes } from '../src/lib/content/routes.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env: --dry still works */ }

const MANIFEST_FILE = path.join(ROOT, 'src', 'data', 'og-cards.json');
const PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || 'https://cdn.infraphysics.net').replace(/\/+$/, '');
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const WIDTH = 1200, HEIGHT = 630, MAX_BYTES = 550 * 1024;
const CDP_PORT = 9342;

const sha1 = input => crypto.createHash('sha1').update(input).digest('hex');
const today = () => new Date().toISOString().slice(0, 10);
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = message => { console.error(`\x1b[31m${message}\x1b[0m`); process.exit(1); };

// ---------------------------------------------------------------------------
// Which cards exist. Mirrors src/lib/shareCards.ts: keep both lists in step.

const SECTIONS = [
  { id: 'projects', path: '/lab/projects' }, { id: 'essays', path: '/blog/essays' }, { id: 'bits2bricks', path: '/blog/bits2bricks' }, { id: 'wikinotes', path: '/wiki' },
];
const PAGES = [
  { id: 'home', path: '/home' }, { id: 'about', path: '/about' }, { id: 'cv', path: '/about/cv' }, { id: 'stack', path: '/about/stack' }, { id: 'contact', path: '/contact' },
];

/** Everything a card shows is hashed, together with the design sources, so any change regenerates it. */
const DESIGN_HASH = sha1([
  fs.readFileSync(path.join(ROOT, 'src', 'views', 'shareCardDesigns.tsx'), 'utf8'),
  fs.readFileSync(path.join(ROOT, 'src', 'styles', 'share-cards.css'), 'utf8'),
  fs.readFileSync(path.join(ROOT, 'src', 'lib', 'shareCards.ts'), 'utf8'),
].join('\n')).slice(0, 12);

function listCards() {
  const posts = readJson(path.join(ROOT, 'src', 'data', 'posts-index.generated.json')).filter(p => !p.hidden);
  const notes = readJson(path.join(ROOT, 'public', 'wikinotes-index.json'));
  const noteList = Array.isArray(notes) ? notes : notes.notes;
  const routes = createContentRoutes(routeEntries());
  const cards = [];

  for (const post of posts) {
    cards.push({ kind: 'article', id: post.id, path: routes.path(post.category, post.id), facts: [post.displayTitle || post.title, post.subtitle || '', post.category, post.thumbnail || '', post.thumbnailFocus ?? ''] });
  }
  const playgroundsDir = path.join(ROOT, 'public', 'playgrounds');
  if (fs.existsSync(playgroundsDir)) {
    for (const article of fs.readdirSync(playgroundsDir)) {
      const dir = path.join(playgroundsDir, article);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
        const name = file.replace(/\.html$/, '');
        const parent = posts.find(p => p.id === article);
        cards.push({ kind: 'playground', id: `${article}--${name}`, path: `/playgrounds/${article}/${file}`, facts: [name, parent?.displayTitle || parent?.title || '', parent?.category || ''] });
      }
    }
  }
  for (const note of noteList) cards.push({ kind: 'wiki', id: note.id, path: routes.path('wikinotes', note.id), facts: [note.displayTitle || note.title, note.address, note.description || ''] });
  for (const s of SECTIONS) cards.push({ kind: 'section', id: s.id, path: s.path, facts: [s.id] });
  for (const p of PAGES) cards.push({ kind: 'page', id: p.id, path: p.path, facts: [p.id] });
  for (const card of cards) {
    card.key = `og/${card.kind}/${card.id}.jpg`;
    card.hash = sha1(JSON.stringify([DESIGN_HASH, card.kind, card.id, card.facts])).slice(0, 12);
  }
  return cards;
}

// ---------------------------------------------------------------------------
// Manifest

function loadManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) return { version: 1, publicBase: PUBLIC_BASE, updated: today(), cards: {} };
  return readJson(MANIFEST_FILE);
}
function saveManifest(manifest) {
  const sorted = Object.fromEntries(Object.entries(manifest.cards).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify({ version: 1, publicBase: PUBLIC_BASE, updated: today(), cards: sorted }, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// R2

function credentials() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}
async function r2() {
  const creds = credentials();
  if (!creds) fail('og-cards: missing R2 credentials in .env (use --dry to render without uploading)');
  const s3 = await import('@aws-sdk/client-s3');
  const { NodeHttpHandler } = await import('@smithy/node-http-handler');
  const client = new s3.S3Client({ region: 'auto', endpoint: `https://${creds.accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey }, maxAttempts: 4, requestHandler: new NodeHttpHandler({ connectionTimeout: 10_000, requestTimeout: 120_000 }) });
  return {
    put: (key, buffer) => client.send(new s3.PutObjectCommand({ Bucket: creds.bucket, Key: key, Body: buffer, ContentType: 'image/jpeg', CacheControl: CACHE_CONTROL })),
    remove: key => client.send(new s3.DeleteObjectCommand({ Bucket: creds.bucket, Key: key })),
  };
}

// ---------------------------------------------------------------------------
// Chrome over CDP

function chromePath() {
  const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const found = candidates.find(c => fs.existsSync(c));
  if (!found) fail('og-cards: Chrome not found (set CHROME_PATH)');
  return found;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJson = url => new Promise((resolve, reject) => http.get(url, res => { let body = ''; res.on('data', d => body += d); res.on('end', () => resolve(JSON.parse(body))); }).on('error', reject));

async function browser() {
  const profile = path.join(ROOT, 'media', '.cache', 'og-chrome');
  fs.mkdirSync(profile, { recursive: true });
  const proc = spawn(chromePath(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--remote-debugging-port=${CDP_PORT}`, `--window-size=${WIDTH},${HEIGHT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let targets = null;
  for (let i = 0; i < 60 && !targets; i++) { try { targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json`); } catch { await sleep(250); } }
  if (!targets) { proc.kill(); fail('og-cards: Chrome did not answer on the debugging port'); }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0; const pending = new Map();
  ws.onmessage = event => { const m = JSON.parse(event.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(resolve => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;
  return {
    async shoot(url) {
      await send('Page.navigate', { url });
      const started = Date.now();
      while (Date.now() - started < 20_000) {
        if (await evaluate('window.__ogReady === true')) break;
        await sleep(120);
      }
      if (!(await evaluate('window.__ogReady === true'))) throw new Error(`card never became ready: ${url}`);
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } });
      return Buffer.from(shot.result.data, 'base64');
    },
    close() { ws.close(); proc.kill(); },
  };
}

async function encode(png) {
  for (const quality of [84, 78, 72, 66]) {
    const jpeg = await sharp(png).jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
    if (jpeg.length <= MAX_BYTES) return jpeg;
  }
  return sharp(png).jpeg({ quality: 60, mozjpeg: true }).toBuffer();
}

// ---------------------------------------------------------------------------
// Main

function parseArgs(argv) {
  const flags = {}, positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base' || arg === '--limit') flags[arg.slice(2)] = argv[++i];
    else if (arg.startsWith('--')) flags[arg.slice(2)] = true;
    else positional.push(arg);
  }
  return { flags, positional };
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const base = (flags.base || process.env.OG_BASE || 'http://localhost:3000').replace(/\/+$/, '');
  const dry = Boolean(flags.dry);
  const limit = flags.limit ? Number(flags.limit) : Infinity;

  const all = listCards();
  const inScope = positional.length ? all.filter(c => positional.includes(c.kind) || positional.includes(c.id)) : all;
  if (!inScope.length) fail('og-cards: nothing matches that scope');
  const manifest = loadManifest();
  const jobs = inScope.filter(c => flags.force || manifest.cards[c.path]?.hash !== c.hash).slice(0, limit);
  const stale = Object.keys(manifest.cards).filter(p => !all.some(c => c.path === p));
  console.log(`og-cards: ${all.length} cards, ${inScope.length} in scope, ${jobs.length} to render${stale.length ? `, ${stale.length} stale` : ''}${dry ? ' (dry run)' : ''}`);
  if (!jobs.length && !stale.length) return;

  try { await getJson(`${base}/wikinotes-index.json`.replace(/^https?:\/\/([^/]+)/, 'http://$1')); } catch { fail(`og-cards: no dev server at ${base} (start it with npm run dev, or pass --base)`); }
  const store = dry ? null : await r2();
  const chrome = await browser();
  let done = 0, bytes = 0;
  try {
    for (const card of jobs) {
      const png = await chrome.shoot(`${base}/og/card/${card.kind}/${card.id}`);
      const jpeg = await encode(png);
      const v = sha1(jpeg).slice(0, 8);
      if (!dry) {
        await store.put(card.key, jpeg);
        manifest.cards[card.path] = { key: card.key, hash: card.hash, v, bytes: jpeg.length, updated: today() };
        saveManifest(manifest);
      }
      done++; bytes += jpeg.length;
      console.log(`  ${String(done).padStart(4)}/${jobs.length}  ${card.kind.padEnd(10)} ${card.path.padEnd(52)} ${Math.round(jpeg.length / 1024)} KB`);
    }
    if (!dry) {
      for (const p of stale) {
        const key = manifest.cards[p].key;
        try { await store.remove(key); } catch { /* already gone */ }
        delete manifest.cards[p];
        console.log(`  removed ${key}`);
      }
      saveManifest(manifest);
    }
  } finally {
    chrome.close();
  }
  console.log(`og-cards: ${done} rendered, ${(bytes / 1e6).toFixed(1)} MB${dry ? ', nothing written' : `, manifest → ${path.relative(ROOT, MANIFEST_FILE)}`}`);
  if (!dry && done) console.log('og-cards: run npm run content (or the build) so og-manifest.json points at the new cards');
}

main().catch(error => { console.error(error); process.exit(1); });
