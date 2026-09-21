#!/usr/bin/env node
// Check local Markdown links in repository guides, without fetching external URLs.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const includeStudio = process.argv.includes('--studio');
const files = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0'))]
  .filter(f => f.endsWith('.md') && !f.startsWith('room/') && fs.existsSync(path.join(root, f)))
  .filter(f => !f.startsWith('_studio/') || includeStudio)
  .filter(f => !f.startsWith('src/data/pages/') || /^[A-Z][A-Z-]*\.md$/.test(path.basename(f)));
const cache = new Map();
function anchors(file) {
  if (cache.has(file)) return cache.get(file);
  const ids = new Set(), counts = new Map();
  const text = fs.readFileSync(file, 'utf8');
  marked.walkTokens(marked.lexer(text), token => {
    if (token.type !== 'heading') return;
    const base = token.text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/ /g, '-');
    const n = counts.get(base) || 0;
    ids.add(base + (n ? `-${n}` : '')); counts.set(base, n + 1);
  });
  for (const m of text.matchAll(/(?:id|name)=["']([^"']+)["']/g)) ids.add(m[1]);
  cache.set(file, ids); return ids;
}
let links = 0, errors = 0;
for (const file of files) {
  marked.walkTokens(marked.lexer(fs.readFileSync(path.join(root, file), 'utf8')), token => {
    if (!['link', 'image'].includes(token.type) || !token.href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(token.href)) return;
    links++;
    let href;
    try { href = decodeURIComponent(token.href); } catch { href = token.href; }
    const [rel, fragment] = href.split('#');
    const target = rel ? path.resolve(rel.startsWith('/') ? root : path.dirname(path.join(root, file)), rel.replace(/^\//, '').split('?')[0]) : path.join(root, file);
    const issue = !fs.existsSync(target) ? 'missing file' : fragment && target.endsWith('.md') && !anchors(target).has(fragment) ? 'missing heading' : null;
    if (issue) { console.error(`${file}: ${issue}: ${token.href}`); errors++; }
  });
}
console.log(`docs: ${files.length} guides, ${links} local links, ${errors} errors${includeStudio ? ' (including studio, read only)' : ''}`);
if (errors) process.exitCode = 1;
