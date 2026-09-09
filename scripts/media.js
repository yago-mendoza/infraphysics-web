#!/usr/bin/env node
/**
 * media.js — article images: local masters in media/, optimized copies on Cloudflare R2.
 *
 * Layout (masters are gitignored; this machine plus the bucket's originals/ are the source)
 *   media/articles/<id>/cover.<ext>          hero of an article: index card and article top
 *   media/articles/<id>/figures/<slug>.<ext> illustrations inside the article body
 *   media/site/<path>/<slug>.<ext>           page scaffolding art: home carousel, about, plates
 *   media/.cache/                            encoded outputs keyed by content hash
 *   src/data/media-manifest.json             what is on the CDN: key, size, dimensions, version (tracked)
 *
 * Bucket keys mirror the folders
 *   articles/<id>/cover.webp                 optimized raster (WebP, capped width, no upscaling)
 *   articles/<id>/cover.jpg                  JPEG twin of the cover, for og:image (crawlers dislike WebP)
 *   articles/<id>/figures/<slug>.webp        figures; .svg and .gif are copied as they are
 *   site/<path>/<slug>.webp                  scaffolding art
 *   originals/<same path as media/>          the masters, so `pull` can rebuild media/ on another machine
 *
 * Commands (<scope> is an article id or "site")
 *   node scripts/media.js push [scope …] [--force] [--dry]  optimize + upload what changed, print URLs
 *   node scripts/media.js sync [--soft]                     push everything; --soft never fails the build
 *   node scripts/media.js pull [scope …] [--force]          download masters into media/
 *   node scripts/media.js ls [scope] [--by date|size|name] [--all]
 *   node scripts/media.js status                            local vs manifest vs bucket
 *   node scripts/media.js rm <key …>                        delete bucket objects (explicit keys only)
 *   node scripts/media.js mv <from> <to>                    rename a bucket object without re-uploading
 *   node scripts/media.js url <scope>[/<name>]              print public URLs
 *
 * Credentials come from .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 * optional R2_PUBLIC_BASE). Without them, `sync --soft` skips quietly so CI builds still work.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MEDIA_DIR = path.join(ROOT, 'media');
const CACHE_DIR = path.join(MEDIA_DIR, '.cache');
const MANIFEST_FILE = path.join(ROOT, 'src/data/media-manifest.json');

try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env: read-only commands still work with env vars */ }

const ARTICLES_PREFIX = 'articles';
const SITE_PREFIX = 'site';
const ORIGINALS_PREFIX = 'originals';
const PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || 'https://cdn.infraphysics.net').replace(/\/+$/, '');

// Encoding rules. Bump VERSION when any of this changes so every output is re-encoded.
const RULES = {
  VERSION: 1,
  cover: { width: 1600 },
  figure: { width: 1400 },
  site: { width: 1600 },
  webp: { quality: 82, effort: 4 },
  og: { width: 1200, quality: 80, background: '#0b0b10' },
};
const SETTINGS_HASH = sha1(JSON.stringify(RULES)).slice(0, 8);
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.avif']);
const PASSTHROUGH = { '.svg': 'image/svg+xml', '.gif': 'image/gif' };
const CACHE_CONTROL = { articles: 'public, max-age=31536000, immutable', originals: 'public, max-age=86400' };
const UPLOAD_CONCURRENCY = 6;
const ENCODE_CONCURRENCY = Math.max(2, Math.min(os.cpus().length, 8));

// ---------------------------------------------------------------------------
// Helpers

function sha1(input) { return crypto.createHash('sha1').update(input).digest('hex'); }
function today() { return new Date().toISOString().slice(0, 10); }
function fmtBytes(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : n >= 1e3 ? Math.round(n / 1e3) + ' KB' : n + ' B'; }
function fail(message) { console.error(`\x1b[31m${message}\x1b[0m`); process.exit(1); }
function warn(message) { console.warn(`\x1b[33m${message}\x1b[0m`); }
function publicUrl(key) { return `${PUBLIC_BASE}/${key}`; }

function parseArgs(argv) {
  const flags = {}; const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [name, inline] = arg.slice(2).split('=');
      if (inline !== undefined) flags[name] = inline;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--') && ['by', 'width'].includes(name)) { flags[name] = argv[i + 1]; i += 1; }
      else flags[name] = true;
    } else positional.push(arg);
  }
  return { flags, positional };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const index = next; next += 1; results[index] = await worker(items[index], index); }
  }));
  return results;
}

// ---------------------------------------------------------------------------
// Manifest

function loadManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) return { version: 1, publicBase: PUBLIC_BASE, settings: SETTINGS_HASH, files: {}, originals: {} };
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  manifest.files ||= {}; manifest.originals ||= {};
  return manifest;
}

function saveManifest(manifest) {
  const sorted = (object) => Object.fromEntries(Object.keys(object).sort().map(key => [key, object[key]]));
  const out = { version: 1, publicBase: PUBLIC_BASE, settings: SETTINGS_HASH, updated: today(), files: sorted(manifest.files), originals: sorted(manifest.originals) };
  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(out, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Local scan

/**
 * Every master under media/, with its content hash and derived outputs. The folder
 * says what a file is, and the bucket key mirrors the folder:
 *   media/articles/<id>/cover.<ext>            hero of an article (index card + article top)
 *   media/articles/<id>/figures/<slug>.<ext>   illustration inside the article body
 *   media/site/<path>/<slug>.<ext>             page scaffolding: home, about, carousel art
 * Anything else is reported and skipped. `only` filters by article id or by 'site'.
 */
function classify(rel) {
  const parts = rel.split('/');
  const file = parts[parts.length - 1];
  const ext = path.extname(file).toLowerCase();
  const name = file.slice(0, -ext.length);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) return { error: 'names must be lowercase slugs (a-z, 0-9, dashes)' };
  if (!RASTER.has(ext) && !PASSTHROUGH[ext]) return { error: 'unsupported extension' };
  if (parts[0] === SITE_PREFIX && parts.length >= 2 && parts.slice(1, -1).every(segment => /^[a-z0-9-]+$/.test(segment))) return { role: 'site', scope: SITE_PREFIX, name, ext, file };
  if (parts[0] === ARTICLES_PREFIX && /^\d+$/.test(parts[1] || '')) {
    if (parts.length === 3 && name === 'cover') return { role: 'cover', scope: parts[1], name, ext, file };
    if (parts.length === 4 && parts[2] === 'figures') return { role: 'figure', scope: parts[1], name, ext, file };
    if (parts.length === 3) return { error: `figures go in ${ARTICLES_PREFIX}/${parts[1]}/figures/, only cover.<ext> sits beside them` };
  }
  return { error: `expected ${ARTICLES_PREFIX}/<id>/cover.<ext>, ${ARTICLES_PREFIX}/<id>/figures/<slug>.<ext> or ${SITE_PREFIX}/<path>/<slug>.<ext>` };
}

function walkFiles(dir, base = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkFiles(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

function scanLocal(only) {
  const sources = [];
  for (const rel of walkFiles(MEDIA_DIR)) {
    const info = classify(rel);
    if (info.error) { warn(`  skip ${rel}: ${info.error}`); continue; }
    if (only?.length && !only.includes(info.scope)) continue;
    const absolute = path.join(MEDIA_DIR, rel);
    const buffer = fs.readFileSync(absolute);
    const hash = sha1(buffer).slice(0, 12);
    const stem = rel.slice(0, -info.ext.length);
    const outputs = [];
    if (RASTER.has(info.ext)) {
      outputs.push({ key: `${stem}.webp`, kind: 'webp', role: info.role, type: 'image/webp' });
      if (info.role === 'cover') outputs.push({ key: `${stem}.jpg`, kind: 'og', role: info.role, type: 'image/jpeg' });
    } else {
      outputs.push({ key: rel, kind: 'copy', role: info.role, type: PASSTHROUGH[info.ext] });
    }
    sources.push({ id: info.scope, name: info.name, ext: info.ext, file: info.file, rel, absolute, buffer, hash, outputs });
  }
  return sources.sort((a, b) => a.rel.localeCompare(b.rel));
}

// ---------------------------------------------------------------------------
// Encoding (cached by source hash + settings)

async function encode(source, output) {
  if (output.kind === 'copy') return { buffer: source.buffer, width: null, height: null };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cacheFile = path.join(CACHE_DIR, `${source.hash}-${SETTINGS_HASH}-${output.kind}${output.kind === 'og' ? '.jpg' : '.webp'}`);
  const metaFile = cacheFile + '.json';
  if (fs.existsSync(cacheFile) && fs.existsSync(metaFile)) {
    return { buffer: fs.readFileSync(cacheFile), ...JSON.parse(fs.readFileSync(metaFile, 'utf8')) };
  }
  const { default: sharp } = await import('sharp');
  let pipeline = sharp(source.buffer, { failOn: 'none' }).rotate();
  if (output.kind === 'og') {
    pipeline = pipeline.resize({ width: RULES.og.width, withoutEnlargement: true }).flatten({ background: RULES.og.background }).jpeg({ quality: RULES.og.quality, mozjpeg: true });
  } else {
    const width = RULES[output.role]?.width ?? RULES.figure.width;
    pipeline = pipeline.resize({ width, withoutEnlargement: true }).webp({ quality: RULES.webp.quality, effort: RULES.webp.effort });
  }
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const meta = { width: info.width, height: info.height };
  fs.writeFileSync(cacheFile, data);
  fs.writeFileSync(metaFile, JSON.stringify(meta));
  return { buffer: data, ...meta };
}

// ---------------------------------------------------------------------------
// R2 client

let s3Module = null;
function credentials() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}

async function client() {
  const creds = credentials();
  if (!creds) fail('media: missing R2 credentials in .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)');
  s3Module ||= await import('@aws-sdk/client-s3');
  // A stalled socket once hung an upload for good; cap every request and let the SDK retry.
  const { NodeHttpHandler } = await import('@smithy/node-http-handler');
  const s3 = new s3Module.S3Client({
    region: 'auto',
    endpoint: `https://${creds.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey },
    maxAttempts: 4,
    requestHandler: new NodeHttpHandler({ connectionTimeout: 10_000, requestTimeout: 120_000 }),
  });
  const Bucket = creds.bucket;
  return {
    async list(prefix = '') {
      const objects = []; let ContinuationToken;
      do {
        const page = await s3.send(new s3Module.ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken }));
        for (const object of page.Contents || []) objects.push({ key: object.Key, size: object.Size, date: object.LastModified, etag: (object.ETag || '').replace(/"/g, '') });
        ContinuationToken = page.NextContinuationToken;
      } while (ContinuationToken);
      return objects;
    },
    async head(key) {
      try { const r = await s3.send(new s3Module.HeadObjectCommand({ Bucket, Key: key })); return { size: r.ContentLength, etag: (r.ETag || '').replace(/"/g, ''), type: r.ContentType, cache: r.CacheControl }; }
      catch (error) { if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') return null; throw error; }
    },
    async put(key, buffer, type, cacheControl) {
      await s3.send(new s3Module.PutObjectCommand({ Bucket, Key: key, Body: buffer, ContentType: type, CacheControl: cacheControl }));
    },
    async get(key) {
      const r = await s3.send(new s3Module.GetObjectCommand({ Bucket, Key: key }));
      return Buffer.from(await r.Body.transformToByteArray());
    },
    async remove(key) { await s3.send(new s3Module.DeleteObjectCommand({ Bucket, Key: key })); },
    /** Server-side rename: copy then delete, nothing is re-uploaded. */
    async move(from, to) {
      await s3.send(new s3Module.CopyObjectCommand({ Bucket, Key: to, CopySource: `/${Bucket}/${encodeURIComponent(from).replace(/%2F/g, '/')}`, MetadataDirective: 'COPY' }));
      await s3.send(new s3Module.DeleteObjectCommand({ Bucket, Key: from }));
    },
  };
}

// ---------------------------------------------------------------------------
// Commands

async function push({ positional, flags }, { soft = false } = {}) {
  if (soft && !credentials()) { console.log('media: no R2 credentials, skipping upload (manifest left as is)'); return; }
  const manifest = loadManifest();
  const sources = scanLocal(positional);
  if (!sources.length) { console.log('media: nothing under media/ to push'); return; }
  const settingsChanged = manifest.settings !== SETTINGS_HASH;
  if (settingsChanged) console.log(`media: encoding rules changed (${manifest.settings} → ${SETTINGS_HASH}), re-encoding everything`);

  // Decide the work before touching the network.
  const jobs = [];
  for (const source of sources) {
    for (const output of source.outputs) {
      const entry = manifest.files[output.key];
      const upToDate = entry && entry.srcHash === source.hash && !settingsChanged && !flags.force;
      if (!upToDate) jobs.push({ source, output });
    }
    const original = manifest.originals[source.rel];
    if (!original || original.hash !== source.hash || flags.force) jobs.push({ source, output: { key: `${ORIGINALS_PREFIX}/${source.rel}`, kind: 'original', type: mimeOf(source.ext) } });
  }
  if (!jobs.length) { console.log(`media: ${sources.length} masters, everything already on the CDN`); return; }

  const encodeJobs = jobs.filter(job => job.output.kind !== 'original');
  console.log(`media: ${encodeJobs.length} file(s) to encode, ${jobs.length} object(s) to upload${flags.dry ? ' (dry run)' : ''}`);
  const encoded = await mapLimit(encodeJobs, ENCODE_CONCURRENCY, async job => ({ job, ...(await encode(job.source, job.output)) }));
  for (const item of encoded) {
    const ratio = item.job.output.kind === 'copy' ? '' : `  ${fmtBytes(item.job.source.buffer.length)} → ${fmtBytes(item.buffer.length)}`;
    console.log(`  ${item.job.output.key}${item.width ? `  ${item.width}x${item.height}` : ''}${ratio}`);
  }
  if (flags.dry) return;

  const r2 = await client();
  const uploads = [
    ...encoded.map(item => ({ key: item.job.output.key, buffer: item.buffer, type: item.job.output.type, cache: CACHE_CONTROL.articles, item })),
    ...jobs.filter(job => job.output.kind === 'original').map(job => ({ key: job.output.key, buffer: job.source.buffer, type: job.output.type, cache: CACHE_CONTROL.originals, job })),
  ];
  // Resumable: an object the bucket already holds at the same size is not sent again
  // (an interrupted push, or a manifest lost between machines).
  let sent = 0, reused = 0;
  await mapLimit(uploads, UPLOAD_CONCURRENCY, async upload => {
    const existing = flags.force ? null : await r2.head(upload.key);
    if (existing && existing.size === upload.buffer.length) reused += 1;
    else { await r2.put(upload.key, upload.buffer, upload.type, upload.cache); sent += upload.buffer.length; }
    if (upload.item) {
      const { job, buffer, width, height } = upload.item;
      const previous = manifest.files[job.output.key];
      manifest.files[job.output.key] = { src: job.source.rel, srcHash: job.source.hash, v: sha1(buffer).slice(0, 8), width, height, bytes: buffer.length, type: job.output.type, updated: today() };
      if (previous && previous.v !== manifest.files[job.output.key].v) warn(`  replaced ${job.output.key}: the build stamps ?v=${manifest.files[job.output.key].v} on its URLs, so cached copies refresh on the next deploy`);
    } else {
      manifest.originals[upload.job.source.rel] = { hash: upload.job.source.hash, bytes: upload.buffer.length, updated: today() };
    }
  });
  saveManifest(manifest);
  console.log(`media: uploaded ${uploads.length - reused} object(s), ${fmtBytes(sent)}${reused ? `, ${reused} already on the CDN` : ''}; manifest written to src/data/media-manifest.json`);
  const touched = new Set(encoded.map(item => item.job.source.id));
  for (const id of [...touched].sort()) printUrls(manifest, id);
}

function mimeOf(ext) {
  return { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.tif': 'image/tiff', '.tiff': 'image/tiff', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.gif': 'image/gif' }[ext] || 'application/octet-stream';
}

function printUrls(manifest, id, name) {
  const prefix = id === SITE_PREFIX ? `${SITE_PREFIX}/` : `${ARTICLES_PREFIX}/${id}/`;
  const keys = Object.keys(manifest.files).filter(key => key.startsWith(prefix) && (!name || path.basename(key).replace(/\.[^.]+$/, '') === name));
  if (!keys.length) { warn(`  no CDN files for ${id}${name ? '/' + name : ''}`); return; }
  console.log(`  ${id}:`);
  for (const key of keys) console.log(`    ${publicUrl(key)}`);
}

async function sync({ flags }) {
  try { await push({ positional: [], flags }, { soft: Boolean(flags.soft) }); }
  catch (error) {
    if (!flags.soft) throw error;
    warn(`media: upload failed (${error?.message || error}); continuing with the existing manifest`);
  }
}

async function pull({ positional, flags }) {
  const r2 = await client();
  const originals = await r2.list(`${ORIGINALS_PREFIX}/`);
  const optimized = [...await r2.list(`${ARTICLES_PREFIX}/`), ...await r2.list(`${SITE_PREFIX}/`)];
  // Masters first; an optimized copy is only pulled when no master exists for that stem.
  const wanted = new Map();
  for (const object of originals) wanted.set(object.key.slice(ORIGINALS_PREFIX.length + 1), object.key);
  const stems = new Set([...wanted.keys()].map(rel => rel.replace(/\.[^.]+$/, '')));
  for (const object of optimized) {
    const stem = object.key.replace(/\.[^.]+$/, '');
    if (object.key.endsWith('cover.jpg') || stems.has(stem)) continue;
    wanted.set(object.key, object.key); stems.add(stem);
  }
  const scopeOf = rel => rel.startsWith(`${SITE_PREFIX}/`) ? SITE_PREFIX : rel.split('/')[1];
  const targets = [...wanted].filter(([rel]) => !positional.length || positional.includes(scopeOf(rel)));
  const missing = targets.filter(([rel]) => flags.force || !fs.existsSync(path.join(MEDIA_DIR, rel)));
  console.log(`media: ${targets.length} master(s) on the CDN, ${missing.length} to download`);
  let bytes = 0;
  await mapLimit(missing, UPLOAD_CONCURRENCY, async ([rel, key]) => {
    const buffer = await r2.get(key);
    const target = path.join(MEDIA_DIR, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer);
    bytes += buffer.length;
    console.log(`  ${rel}  ${fmtBytes(buffer.length)}${key.startsWith(ORIGINALS_PREFIX) ? '' : '  (optimized copy: no master on the CDN)'}`);
  });
  console.log(`media: downloaded ${fmtBytes(bytes)} into media/`);
}

async function ls({ positional, flags }) {
  const r2 = await client();
  const manifest = loadManifest();
  const prefix = flags.all ? '' : positional[0] === SITE_PREFIX ? `${SITE_PREFIX}/` : positional[0] ? `${ARTICLES_PREFIX}/${positional[0]}/` : '';
  const objects = prefix || flags.all ? await r2.list(prefix) : [...await r2.list(`${ARTICLES_PREFIX}/`), ...await r2.list(`${SITE_PREFIX}/`)];
  const by = flags.by || 'date';
  objects.sort((a, b) => by === 'size' ? b.size - a.size : by === 'name' ? a.key.localeCompare(b.key) : b.date - a.date);
  const total = objects.reduce((sum, object) => sum + object.size, 0);
  console.log(`${objects.length} object(s), ${fmtBytes(total)}  (${prefix || 'whole bucket'}, by ${by})`);
  for (const object of objects) {
    const tracked = manifest.files[object.key] ? '' : object.key.startsWith(ORIGINALS_PREFIX) ? '' : '  (not in manifest)';
    console.log(`  ${object.date.toISOString().slice(0, 10)}  ${fmtBytes(object.size).padStart(8)}  ${object.key}${tracked}`);
  }
}

async function status() {
  const manifest = loadManifest();
  const sources = scanLocal();
  const localByKey = new Map();
  for (const source of sources) for (const output of source.outputs) localByKey.set(output.key, source);
  const fresh = [], changed = [], stale = [];
  for (const [key, source] of localByKey) {
    const entry = manifest.files[key];
    if (!entry) fresh.push(key);
    else if (entry.srcHash !== source.hash) changed.push(key);
  }
  for (const key of Object.keys(manifest.files)) if (!localByKey.has(key)) stale.push(key);
  console.log(`local masters: ${sources.length}   manifest entries: ${Object.keys(manifest.files).length}`);
  if (fresh.length) console.log(`\nnew (never pushed):\n  ${fresh.join('\n  ')}`);
  if (changed.length) console.log(`\nchanged locally (push to update):\n  ${changed.join('\n  ')}`);
  if (stale.length) console.log(`\nin manifest but no local master (pull, or rm to drop):\n  ${stale.join('\n  ')}`);
  if (!credentials()) { warn('\nno R2 credentials: skipped the bucket comparison'); return; }
  const r2 = await client();
  const remote = new Map([...await r2.list(`${ARTICLES_PREFIX}/`), ...await r2.list(`${SITE_PREFIX}/`)].map(object => [object.key, object]));
  const missingRemote = Object.keys(manifest.files).filter(key => !remote.has(key));
  const orphans = [...remote.keys()].filter(key => !manifest.files[key]);
  const sizeMismatch = Object.entries(manifest.files).filter(([key, entry]) => remote.has(key) && remote.get(key).size !== entry.bytes).map(([key]) => key);
  if (missingRemote.length) console.log(`\nin manifest but missing on the CDN (push --force):\n  ${missingRemote.join('\n  ')}`);
  if (sizeMismatch.length) console.log(`\nCDN object differs from manifest (push --force):\n  ${sizeMismatch.join('\n  ')}`);
  if (orphans.length) console.log(`\non the CDN but not in the manifest (rm to delete):\n  ${orphans.join('\n  ')}`);
  if (!fresh.length && !changed.length && !stale.length && !missingRemote.length && !orphans.length && !sizeMismatch.length) console.log('\neverything in sync');
}

async function rm({ positional }) {
  if (!positional.length) fail('media rm: give the bucket keys to delete, e.g. articles/1234567/old-figure.webp');
  const r2 = await client();
  const manifest = loadManifest();
  for (const key of positional) {
    await r2.remove(key);
    delete manifest.files[key];
    if (key.startsWith(`${ORIGINALS_PREFIX}/`)) delete manifest.originals[key.slice(ORIGINALS_PREFIX.length + 1)];
    console.log(`  deleted ${key}`);
  }
  saveManifest(manifest);
}

async function mv({ positional }) {
  if (positional.length !== 2) fail('media mv: give <from-key> <to-key>');
  const [from, to] = positional;
  const r2 = await client();
  const manifest = loadManifest();
  await r2.move(from, to);
  if (manifest.files[from]) { manifest.files[to] = manifest.files[from]; delete manifest.files[from]; saveManifest(manifest); }
  console.log(`  ${from} → ${to}`);
}

function url({ positional }) {
  if (!positional.length) fail('media url: give an article id (or "site"), optionally id/name');
  const manifest = loadManifest();
  for (const target of positional) { const [id, name] = target.split('/'); printUrls(manifest, id, name); }
}

// ---------------------------------------------------------------------------

const { flags, positional } = parseArgs(process.argv.slice(2));
const [command, ...rest] = positional;
const commands = { push, sync, pull, ls, status, rm, mv, url };
if (!command || !commands[command]) {
  console.log('usage: node scripts/media.js <push|sync|pull|ls|status|rm|mv|url> [args] [--force] [--dry] [--soft] [--by date|size|name] [--all]');
  process.exit(command ? 1 : 0);
}
try { await commands[command]({ positional: rest, flags }); }
catch (error) { fail(`media ${command}: ${error?.message || error}`); }
