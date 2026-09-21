#!/usr/bin/env node
/**
 * studio-find.js — find pieces in the studio by their frontmatter, so thousands of files stay usable.
 *
 *   npm run find -- --tag agents --mood dry --status ready
 *   npm run find -- --kind reply --lang es --text "MCP"
 *   npm run find -- --folder projects            (bank category comes from its folder)
 *   npm run find -- --tags                       (vocabulary in use, with counts)
 *   npm run find -- --signal out-of-network      (posted pieces that got signal from strangers)
 *   npm run find -- --links                      (bank <-> article topics, with the breaks)
 *
 * Reads every .md under _studio/_inbox/ (the bank and its facts), _studio/twitter/ (queue) and
 * _studio/articles/ (queue), except READMEs, the tag vocabulary and the generated packs. Filters
 * combine with AND; --tag may repeat (all must be present). Output is one line per piece: path,
 * kind, status, mood, format, tags, title. A tag not listed in the vocabulary is flagged.
 *   --tvb <text>   searches the lines of _studio/twitter/gen_prompts/_format_ctx/*.md (expressions,
 *                  sentences, moves, avoid): the author's own material, hand-written
 *   --links        prints the traceability graph between _inbox/bank/ and articles/queue/: which
 *                  bank items each topic is built on, and which topics each bank item feeds. The
 *                  link is written on both sides (`bank:` on the topic, `topics:` on the bank item);
 *                  this mode is what keeps the two halves in step, so run it after editing either.
 *
 * This script is a tool for whoever is searching, the agent included: nothing else depends on its
 * interface. When a question would be answered faster with a new filter, a different output or a
 * new source folder, change the script; do not work around it by reading the folders.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['_studio/_inbox', '_studio/twitter', '_studio/articles'];
const SKIP = new Set(['README.md', 'TAGS.md', 'STRATEGY.md', 'ACCOUNT.md', 'NO-TICS.md']);
// Generated packs and the hand-written colour files are not pieces: they carry no frontmatter.
const SKIP_DIRS = new Set(['articles-format', '_format_ctx']);
const TAGS_FILE = '_studio/twitter/gen_prompts/_format_ctx/_vocabulary/TAGS.md';
// The hand-written line-per-entry files: the author's own material for tweets, and the sources list.
const TVB_DIRS = ['_studio/twitter/gen_prompts/_format_ctx', '_studio/_inbox/motherlode'];
const BANK = '_studio/_inbox/bank';
const TOPICS = '_studio/articles/queue';
const folderKinds = { essays: 'essay', projects: 'project', bits2bricks: 'bits2bricks', wikinotes: 'wikinotes', quotes: 'quote', additions: 'addition', ideas: 'idea', facts: 'fact' };
const bankFolder = file => {
  const relative = path.relative(path.join(ROOT, BANK), file).replace(/\\/g, '/');
  return relative.startsWith('../') || path.isAbsolute(relative) ? null : relative.includes('/') ? relative.slice(0, relative.lastIndexOf('/')) : null;
};
const readPiece = file => {
  const parsed = matter(fs.readFileSync(file, 'utf8'));
  const folder = bankFolder(file);
  // Folder is authoritative in the bank, even if an old file still contains kind.
  if (folder) {
    const category = folder.split('/').reverse().find(segment => folderKinds[segment]);
    parsed.data = { ...parsed.data, kind: folderKinds[category] ?? folder };
  }
  return { ...parsed, folder };
};

const args = process.argv.slice(2);
const filters = { tag: [] };
let listTags = false, listLinks = false;
let tvb = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--tags') { listTags = true; continue; }
  if (a === '--links') { listLinks = true; continue; }
  if (a === '--tvb') { tvb = String(args[i + 1] || '').toLowerCase(); i++; continue; }
  if (!a.startsWith('--')) continue;
  const key = a.slice(2);
  const value = args[i + 1];
  if (key === 'tag') { filters.tag.push(String(value).toLowerCase()); i++; continue; }
  filters[key] = value; i++;
}

const walk = dir => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(p);
  return e.name.endsWith('.md') && !SKIP.has(e.name) ? [p] : [];
}) : [];

if (tvb !== null) {
  // The author's own material, hand-written: expressions, sentences, moves, allergies, sources.
  let n = 0;
  for (const rel of TVB_DIRS) {
    const dir = path.join(ROOT, rel);
    for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md') && !SKIP.has(f)) : []) {
      for (const line of fs.readFileSync(path.join(dir, name), 'utf8').split(/\r?\n/)) {
        if (line.startsWith('- ') && (tvb === '' || line.toLowerCase().includes(tvb))) { console.log(`${name.replace(/\.md$/, '').padEnd(15)} ${line.slice(2)}`); n++; }
      }
    }
  }
  console.log(`${n} entries`);
  process.exit(0);
}

const list = rel => {
  const dir = path.join(ROOT, rel);
  return walk(dir).map(file => {
    const { data, folder } = readPiece(file);
    return { slug: path.relative(dir, file).replace(/\\/g, '/').replace(/\.md$/, ''), data, folder };
  }).filter(item => typeof item.data.title === 'string' && item.data.title.trim());
};

if (listLinks) {
  // Traceability: an article topic says which bank items it is built on, and every one of those
  // items says it feeds that topic. A link written on one side only is a break, and so is a slug
  // that points at a file that does not exist.
  const bank = list(BANK), topics = list(TOPICS);
  const bankBySlug = new Map(bank.map(item => [item.slug, item]));
  const topicBySlug = new Map(topics.map(item => [item.slug, item]));
  const arr = v => (Array.isArray(v) ? v : v ? [v] : []).map(String);
  const bankSlugs = new Set(bank.map(b => b.slug)), topicSlugs = new Set(topics.map(t => t.slug));
  const breaks = [];

  console.log(`${TOPICS}/`);
  for (const t of topics) {
    const from = arr(t.data.bank);
    console.log(`  ${t.slug}${t.data.kind ? `  (${t.data.kind}, ${t.data.status || '?'})` : ''}`);
    if (!from.length) { console.log('      <- no bank source recorded'); breaks.push(`${t.slug}: no bank source recorded`); }
    for (const b of from) {
      const missing = !bankSlugs.has(b);
      const oneWay = !missing && !arr(bankBySlug.get(b).data.topics).includes(t.slug);
      console.log(`      <- ${b}${missing ? '   NO SUCH BANK ITEM' : oneWay ? '   ONE-WAY (bank item does not list this topic)' : ''}`);
      if (missing) breaks.push(`${t.slug} -> ${b}: no such bank item`);
      else if (oneWay) breaks.push(`${t.slug} -> ${b}: one-way, add topics: [${t.slug}] to the bank item`);
    }
  }

  console.log(`\n${BANK}/`);
  for (const b of bank) {
    const to = arr(b.data.topics);
    console.log(`  ${b.slug}${b.data.kind ? `  (${b.data.kind}, ${b.data.status || '?'})` : ''}${to.length ? '' : '   [unused]'}`);
    for (const t of to) {
      const missing = !topicSlugs.has(t);
      const oneWay = !missing && !arr(topicBySlug.get(t).data.bank).includes(b.slug);
      console.log(`      -> ${t}${missing ? '   NO SUCH TOPIC' : oneWay ? '   ONE-WAY (topic does not list this item)' : ''}`);
      if (missing) breaks.push(`${b.slug} -> ${t}: no such topic in the queue`);
      else if (oneWay) breaks.push(`${b.slug} -> ${t}: one-way, add bank: [${b.slug}] to the topic`);
    }
  }

  console.log(`\n${topics.length} topics, ${bank.length} bank items, ${bank.filter(b => !arr(b.data.topics).length).length} of them unused.`);
  if (breaks.length) { console.log(`\n${breaks.length} to fix:`); for (const b of breaks) console.log(`  ${b}`); }
  process.exit(0);
}

const files = DIRS.flatMap(d => walk(path.join(ROOT, d)));
const pieces = files.map(file => {
  const { data, content, folder } = readPiece(file);
  const tags = (Array.isArray(data.tags) ? data.tags : []).map(t => String(t).toLowerCase());
  return { file: path.relative(ROOT, file).replace(/\\/g, '/'), data, tags, folder, body: content };
}).filter(piece => typeof piece.data.title === 'string' && piece.data.title.trim());

const known = new Set((fs.existsSync(path.join(ROOT, TAGS_FILE)) ? fs.readFileSync(path.join(ROOT, TAGS_FILE), 'utf8') : '')
  .match(/`([a-z0-9-]+)`/g)?.map(t => t.slice(1, -1)) || []);

if (listTags) {
  const counts = new Map();
  for (const p of pieces) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  const rows = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [t, n] of rows) console.log(`${String(n).padStart(4)}  ${t}${known.has(t) ? '' : '   (not in TAGS.md)'}`);
  console.log(`${rows.length} tags in use across ${pieces.length} pieces`);
  process.exit(0);
}

const eq = (a, b) => a != null && String(a).toLowerCase() === String(b).toLowerCase();
const hits = pieces.filter(p => {
  const d = p.data;
  if (filters.folder) {
    const wanted = String(filters.folder).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').toLowerCase();
    const folder = p.folder?.toLowerCase();
    if (!wanted || !folder || !(wanted.includes('/') ? folder === wanted || folder.startsWith(wanted + '/') : folder.split('/').includes(wanted))) return false;
  }
  if (filters.kind && !eq(d.kind, filters.kind)) return false;
  if (filters.status && !eq(d.status, filters.status)) return false;
  if (filters.mood && !eq(d.mood, filters.mood)) return false;
  if (filters.format && !eq(d.format, filters.format)) return false;
  if (filters.lang && !eq(d.language, filters.lang)) return false;
  if (filters.signal && !eq(d.signal, filters.signal)) return false;
  if (filters.source && !String(d.source || '').toLowerCase().includes(String(filters.source).toLowerCase())) return false;
  if (filters.tag.length && !filters.tag.every(t => p.tags.includes(t))) return false;
  if (filters.text) {
    const needle = String(filters.text).toLowerCase();
    if (!(String(d.title || '').toLowerCase().includes(needle) || p.body.toLowerCase().includes(needle))) return false;
  }
  return true;
});

for (const p of hits) {
  const d = p.data;
  const unknown = p.tags.filter(t => !known.has(t));
  console.log(`${p.file}\n    ${[d.kind, d.status, d.mood, d.format, d.language].filter(Boolean).join(' · ')}  [${p.tags.join(', ')}]${unknown.length ? `  (not in TAGS.md: ${unknown.join(', ')})` : ''}\n    ${d.title || ''}`);
}
console.log(`${hits.length} of ${pieces.length} pieces`);
