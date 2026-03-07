#!/usr/bin/env node
// obsidian-import.js — Import Obsidian vault back to fieldnotes
//
// Usage: node scripts/obsidian-import.js [vault-dir]
//   Default input: ./obsidian-vault
//
// Conversions:
//   Path → address:       ML/Training/DPO.md → ML//Training//DPO
//   _ in filename:        preserved (manual review for / restoration)
//   infraphysics-uid →    update existing note
//   No uid →              generate new UID, create new note
//   [[name]] →            [[uid|name]] (resolved via name-to-uid map)
//   > [!TYPE] →           {bkqt/TYPE}...{/bkqt}
//   Deleted notes →       reported only (not auto-deleted)
//
// Output: transfer report to src/data/pages/fieldnotes/transfers/

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { customAlphabet } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');
const TRANSFERS_DIR = path.join(FIELDNOTES_DIR, 'transfers');

const vaultDir = process.argv[2] || path.join(__dirname, '../obsidian-vault');

const generateUid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8);

// --- Parse existing fieldnotes ---

function parseExistingFieldnotes() {
  const files = fs.readdirSync(FIELDNOTES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  const byUid = new Map();
  const nameToUids = new Map(); // name → [uid, ...] (can be ambiguous)

  for (const filename of files) {
    const filePath = path.join(FIELDNOTES_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: fm } = matter(raw);

    if (!fm.uid || !fm.address) continue;

    const addressParts = fm.address.split('//').map(s => s.trim());
    const name = fm.name || addressParts[addressParts.length - 1];

    byUid.set(fm.uid, { uid: fm.uid, address: fm.address, name, filename });

    const key = name.toLowerCase();
    if (!nameToUids.has(key)) nameToUids.set(key, []);
    nameToUids.get(key).push({ uid: fm.uid, name, address: fm.address });

    // Also index aliases
    for (const alias of (fm.aliases || [])) {
      const aliasKey = alias.toLowerCase();
      if (!nameToUids.has(aliasKey)) nameToUids.set(aliasKey, []);
      nameToUids.get(aliasKey).push({ uid: fm.uid, name, address: fm.address });
    }
  }

  return { byUid, nameToUids };
}

// --- Recursively find .md files in vault ---

function findMdFiles(dir, basePath = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = basePath ? basePath + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      results.push(...findMdFiles(full, rel));
    } else if (entry.name.endsWith('.md')) {
      results.push({ fullPath: full, relPath: rel });
    }
  }
  return results;
}

// --- Derive address from vault path ---

function pathToAddress(relPath) {
  // ML/Training/DPO.md → ML//Training//DPO
  const withoutExt = relPath.replace(/\.md$/, '');
  const parts = withoutExt.split('/');
  return parts.join('//');
}

// --- Convert [[name]] → [[uid|name]] ---

function convertNameLinks(text, nameToUids, ambiguities) {
  return text.replace(/\[\[([^\]]+)\]\]/g, (match, inner) => {
    const pipeIdx = inner.indexOf('|');
    const name = pipeIdx !== -1 ? inner.slice(0, pipeIdx).trim() : inner.trim();
    const display = pipeIdx !== -1 ? inner.slice(pipeIdx + 1).trim() : null;

    // Already a UID? (8 alphanumeric chars)
    if (/^[A-Za-z0-9]{8}$/.test(name)) return match;

    const key = name.toLowerCase();
    const candidates = nameToUids.get(key);
    if (!candidates || candidates.length === 0) return match; // unresolved

    if (candidates.length > 1) {
      // Deduplicate by uid
      const uniqueUids = [...new Set(candidates.map(c => c.uid))];
      if (uniqueUids.length > 1) {
        ambiguities.push({ name, candidates: candidates.map(c => `${c.address} (${c.uid})`) });
        return match; // leave as-is
      }
    }

    const uid = candidates[0].uid;
    const resolvedName = candidates[0].name;
    if (display && display !== resolvedName) {
      return `[[${uid}|${display}]]`;
    }
    return `[[${uid}|${resolvedName}]]`;
  });
}

// --- Convert Obsidian callouts to bkqt syntax ---

function convertCallouts(text) {
  // > [!TYPE] Title\n> content → {bkqt/type|Title}\ncontent\n{/bkqt}
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const calloutMatch = lines[i].match(/^>\s*\[!(\w+)\]\s*(.*)?$/);
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const title = calloutMatch[2]?.trim() || '';
      const contentLines = [];
      i++;

      // Collect continuation lines (starting with >)
      while (i < lines.length && /^>/.test(lines[i])) {
        contentLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }

      const label = title ? `{bkqt/${type}|${title}}` : `{bkqt/${type}}`;
      result.push(label);
      result.push(...contentLines);
      result.push('{/bkqt}');
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join('\n');
}

// --- Build fieldnote frontmatter ---

function buildFieldnoteFrontmatter(uid, address, name, date, aliases, distinct, supersedes) {
  const lines = ['---'];
  lines.push(`uid: ${uid}`);
  lines.push(`address: "${address}"`);
  lines.push(`name: "${name}"`);
  if (date) lines.push(`date: "${date}"`);
  if (aliases && aliases.length > 0) {
    lines.push(`aliases: [${aliases.map(a => `"${a}"`).join(', ')}]`);
  }
  if (distinct && distinct.length > 0) {
    lines.push(`distinct: [${distinct.map(d => `"${d}"`).join(', ')}]`);
  }
  if (supersedes) {
    lines.push(`supersedes: "${supersedes}"`);
  }
  lines.push('---');
  return lines.join('\n');
}

// --- Main ---

if (!fs.existsSync(vaultDir)) {
  console.error(`Vault directory not found: ${vaultDir}`);
  process.exit(1);
}

const { byUid, nameToUids } = parseExistingFieldnotes();
const vaultFiles = findMdFiles(vaultDir);

const report = [];
const ambiguities = [];
let updated = 0;
let created = 0;
const existingUids = new Set(byUid.keys());
const seenUids = new Set();

for (const { fullPath, relPath } of vaultFiles) {
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { data: fm, content: body } = matter(raw);

  const address = pathToAddress(relPath);
  const name = fm.name || address.split('//').pop();
  const date = fm.date ? String(fm.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const aliases = fm.aliases || null;
  const distinct = fm.distinct || null;
  const supersedes = fm.supersedes || null;

  // Convert Obsidian features back
  let convertedBody = convertCallouts(body.trim());
  convertedBody = convertNameLinks(convertedBody, nameToUids, ambiguities);

  const uid = fm['infraphysics-uid'] || null;

  if (uid && byUid.has(uid)) {
    // Update existing note
    seenUids.add(uid);
    const frontmatter = buildFieldnoteFrontmatter(uid, address, name, date, aliases, distinct, supersedes);
    const content = frontmatter + '\n\n' + convertedBody + '\n';
    const targetPath = path.join(FIELDNOTES_DIR, `${uid}.md`);
    fs.writeFileSync(targetPath, content, 'utf-8');
    updated++;
    report.push(`UPDATE  ${address} (${uid})`);
  } else {
    // Create new note
    const newUid = generateUid();
    seenUids.add(newUid);
    const frontmatter = buildFieldnoteFrontmatter(newUid, address, name, date, aliases, distinct, supersedes);
    const content = frontmatter + '\n\n' + convertedBody + '\n';
    const targetPath = path.join(FIELDNOTES_DIR, `${newUid}.md`);
    fs.writeFileSync(targetPath, content, 'utf-8');
    created++;
    report.push(`CREATE  ${address} (${newUid})`);

    // Register in nameToUids for subsequent link resolution
    const key = name.toLowerCase();
    if (!nameToUids.has(key)) nameToUids.set(key, []);
    nameToUids.get(key).push({ uid: newUid, name, address });
  }
}

// Detect deletions (notes in fieldnotes/ but not in vault)
const deletions = [];
for (const [uid, note] of byUid) {
  if (!seenUids.has(uid)) {
    deletions.push(`MISSING ${note.address} (${uid}) — not found in vault`);
  }
}

// Write transfer report
fs.mkdirSync(TRANSFERS_DIR, { recursive: true });
const timestamp = new Date().toISOString().slice(0, 10);
const reportContent = [
  `# Obsidian Import Report — ${timestamp}`,
  ``,
  `Vault: ${path.resolve(vaultDir)}`,
  `Updated: ${updated}`,
  `Created: ${created}`,
  `Missing from vault: ${deletions.length}`,
  ``,
  ...report,
  '',
  ...(deletions.length > 0 ? ['--- Deletions (not auto-deleted) ---', '', ...deletions, ''] : []),
  ...(ambiguities.length > 0 ? [
    '--- Ambiguous name resolutions ---',
    '',
    ...ambiguities.map(a => `"${a.name}" → ${a.candidates.join(', ')}`),
    '',
  ] : []),
].join('\n');

const reportPath = path.join(TRANSFERS_DIR, `${timestamp}_import.txt`);
fs.writeFileSync(reportPath, reportContent, 'utf-8');

// Console summary
console.log(`\nImport complete:`);
console.log(`  Updated: ${updated}`);
console.log(`  Created: ${created}`);
console.log(`  Missing from vault: ${deletions.length} (not auto-deleted)`);
if (ambiguities.length > 0) {
  console.log(`  Ambiguous links: ${ambiguities.length} (left unresolved)`);
}
console.log(`\nReport: ${path.relative(process.cwd(), reportPath)}`);
console.log(`\nNext: npm run build → node scripts/check-references.js`);
