#!/usr/bin/env node
/**
 * studio-find.js — find pieces in the studio by their frontmatter, so thousands of files stay usable.
 *
 *   npm run find -- --tag agents --mood dry --status ready
 *   npm run find -- --kind reply --lang es --text "MCP"
 *   npm run find -- --tags                       (vocabulary in use, with counts)
 *   npm run find -- --signal out-of-network      (posted pieces that got signal from strangers)
 *
 * Reads every .md under _studio/twitter/ (bank, queue, posted, examples), _studio/inbox/ and _studio/facts/, except
 * READMEs and TAGS.md. Filters combine with AND; --tag may repeat (all must be present). Output is
 * one line per piece: path, kind, status, mood, format, tags, title. The schema is in
 * _studio/twitter/README.md; a tag not listed in _studio/twitter/TAGS.md is flagged.
 *   --tvb <text>   searches the lines of _studio/ai-ctx/tweets/_add-ctx/*.md (expressions, sentences, moves, avoid)
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
const DIRS = ['_studio/twitter', '_studio/inbox', '_studio/facts'];
const SKIP = new Set(['README.md', 'TAGS.md', 'STRATEGY.md']);

const args = process.argv.slice(2);
const filters = { tag: [] };
let listTags = false;
let tvb = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--tags') { listTags = true; continue; }
  if (a === '--tvb') { tvb = String(args[i + 1] || '').toLowerCase(); i++; continue; }
  if (!a.startsWith('--')) continue;
  const key = a.slice(2);
  const value = args[i + 1];
  if (key === 'tag') { filters.tag.push(String(value).toLowerCase()); i++; continue; }
  filters[key] = value; i++;
}

const walk = dir => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return walk(p);
  return e.name.endsWith('.md') && !SKIP.has(e.name) ? [p] : [];
}) : [];

if (tvb !== null) {
  // The hand-written folders beside the generated packs: shared sources, and the author's own material for tweets.
  let n = 0;
  for (const rel of ['_studio/ai-ctx/_add-ctx', '_studio/ai-ctx/tweets/_add-ctx']) {
    const dir = path.join(ROOT, rel);
    for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md') : []) {
      for (const line of fs.readFileSync(path.join(dir, name), 'utf8').split(/\r?\n/)) {
        if (line.startsWith('- ') && (tvb === '' || line.toLowerCase().includes(tvb))) { console.log(`${name.replace(/\.md$/, '').padEnd(15)} ${line.slice(2)}`); n++; }
      }
    }
  }
  console.log(`${n} entries`);
  process.exit(0);
}

const files = DIRS.flatMap(d => walk(path.join(ROOT, d)));
const pieces = files.map(file => {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const tags = (Array.isArray(data.tags) ? data.tags : []).map(t => String(t).toLowerCase());
  return { file: path.relative(ROOT, file).replace(/\\/g, '/'), data, tags, body: content };
});

const known = new Set((fs.existsSync(path.join(ROOT, '_studio/twitter/TAGS.md')) ? fs.readFileSync(path.join(ROOT, '_studio/twitter/TAGS.md'), 'utf8') : '')
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
