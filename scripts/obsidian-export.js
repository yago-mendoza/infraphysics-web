#!/usr/bin/env node
// obsidian-export.js — Export fieldnotes to Obsidian vault structure
//
// Usage: node scripts/obsidian-export.js [output-dir]
//   Default output: ./obsidian-vault
//
// Conversions:
//   Address → folders:   ML//Training//DPO → ML/Training/DPO.md
//   / in segment → _:    TCP/IP → TCP_IP.md
//   Filename = name:     preserve original casing
//   Frontmatter:         name, infraphysics-uid, date (+ aliases, distinct, supersedes)
//   [[uid|display]] →    [[name|display]] (resolved via uid-to-name map)
//   ^[exp] →             ^[exp] (already compatible)
//   ## Interactions →    already compatible (wikilinks converted to names)

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');

const outputDir = process.argv[2] || path.join(__dirname, '../obsidian-vault');

// --- Parse all fieldnotes ---

function parseAllFieldnotes() {
  const files = fs.readdirSync(FIELDNOTES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  const notes = [];
  const uidToName = new Map();

  for (const filename of files) {
    const filePath = path.join(FIELDNOTES_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: fm, content: body } = matter(raw);

    if (!fm.uid || !fm.address) continue;

    const addressParts = fm.address.split('//').map(s => s.trim());
    const name = fm.name || addressParts[addressParts.length - 1];

    uidToName.set(fm.uid, name);

    notes.push({
      uid: fm.uid,
      address: fm.address,
      name,
      date: fm.date ? String(fm.date).slice(0, 10) : '',
      aliases: fm.aliases || null,
      distinct: fm.distinct || null,
      supersedes: fm.supersedes || null,
      addressParts,
      body: body.trim(),
    });
  }

  return { notes, uidToName };
}

// --- Sanitize filename for Windows/macOS ---

function sanitizeFilename(name) {
  return name
    .replace(/\//g, '_')       // / in segment name → _
    .replace(/[<>:"\\|?*]/g, '_')  // Windows-forbidden chars
    .replace(/\s+/g, ' ')     // collapse whitespace
    .trim();
}

// --- Convert [[uid|display]] → [[name|display]] ---

function convertWikiLinks(text, uidToName) {
  return text.replace(/\[\[([^\]]+)\]\]/g, (match, inner) => {
    const pipeIdx = inner.indexOf('|');
    const uid = pipeIdx !== -1 ? inner.slice(0, pipeIdx).trim() : inner.trim();
    const display = pipeIdx !== -1 ? inner.slice(pipeIdx + 1).trim() : null;

    const resolvedName = uidToName.get(uid);
    if (!resolvedName) return match; // unresolved, leave as-is

    if (display && display !== resolvedName) {
      return `[[${resolvedName}|${display}]]`;
    }
    return `[[${resolvedName}]]`;
  });
}

// --- Build Obsidian frontmatter ---

function buildFrontmatter(note) {
  const lines = ['---'];
  lines.push(`name: "${note.name}"`);
  lines.push(`infraphysics-uid: ${note.uid}`);
  if (note.date) lines.push(`date: "${note.date}"`);
  if (note.aliases && note.aliases.length > 0) {
    lines.push(`aliases: [${note.aliases.map(a => `"${a}"`).join(', ')}]`);
  }
  if (note.distinct && note.distinct.length > 0) {
    lines.push(`distinct: [${note.distinct.map(d => `"${d}"`).join(', ')}]`);
  }
  if (note.supersedes) {
    lines.push(`supersedes: "${note.supersedes}"`);
  }
  lines.push('---');
  return lines.join('\n');
}

// --- Main ---

const { notes, uidToName } = parseAllFieldnotes();

// Clean output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}

let exported = 0;

for (const note of notes) {
  // Build path: ML//Training//DPO → ML/Training/DPO.md
  const parts = note.addressParts.map(sanitizeFilename);
  const filename = parts[parts.length - 1] + '.md';
  const dirParts = parts.slice(0, -1);

  const targetDir = dirParts.length > 0
    ? path.join(outputDir, ...dirParts)
    : outputDir;

  fs.mkdirSync(targetDir, { recursive: true });

  // Convert body wiki-links from uid to name
  const convertedBody = convertWikiLinks(note.body, uidToName);

  // Build file content
  const frontmatter = buildFrontmatter(note);
  const content = frontmatter + '\n\n' + convertedBody + '\n';

  const targetPath = path.join(targetDir, filename);

  // Handle name collisions within same directory
  if (fs.existsSync(targetPath)) {
    const altPath = path.join(targetDir, `${parts[parts.length - 1]}_${note.uid.slice(0, 4)}.md`);
    fs.writeFileSync(altPath, content, 'utf-8');
    console.log(`  ⚠ collision: ${note.address} → ${path.relative(outputDir, altPath)}`);
  } else {
    fs.writeFileSync(targetPath, content, 'utf-8');
  }

  exported++;
}

console.log(`\nExported ${exported} fieldnotes → ${path.relative(process.cwd(), outputDir)}`);
console.log(`UID map: ${uidToName.size} entries resolved.`);
