#!/usr/bin/env node
// move-hierarchy.js — Cascading hierarchy rename for fieldnotes (UID-based system)
//
// Usage:
//   node scripts/move-hierarchy.js "old prefix" "new prefix"           (dry-run)
//   node scripts/move-hierarchy.js "old prefix" "new prefix" --apply   (execute)
//
// What it does:
//   1. Finds the root note (address === oldPrefix) — must exist
//   2. Finds all descendants (address starts with oldPrefix + "//")
//   3. Updates address: and name: in frontmatter for each
//   4. Updates distinct/supersedes entries in frontmatter
//   5. No cross-file reference rewriting needed (refs use stable UIDs)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const FIELDNOTES_DIR = path.join(PAGES_DIR, 'fieldnotes');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Parse args ---

const args = process.argv.slice(2);
const applyMode = args.includes('--apply');
const positionalArgs = args.filter(a => a !== '--apply');

if (positionalArgs.length !== 2) {
  console.log('Usage: node scripts/move-hierarchy.js "old prefix" "new prefix" [--apply]');
  console.log('');
  console.log('  Moves a fieldnote and all its descendants to a new address prefix.');
  console.log('  No cross-file ref updates needed — refs use stable UIDs.');
  console.log('');
  console.log('  Dry-run by default. Pass --apply to execute changes.');
  process.exit(positionalArgs.length === 0 ? 0 : 1);
}

const [oldPrefix, newPrefix] = positionalArgs;

if (oldPrefix === newPrefix) {
  console.error('ERROR: Old and new prefixes are the same. Nothing to do.');
  process.exit(1);
}

// === Phase 1: Build rename map ===

const fieldnoteFiles = fs.readdirSync(FIELDNOTES_DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');

// Parse address from each fieldnote
const notesByAddress = new Map();
for (const filename of fieldnoteFiles) {
  const filePath = path.join(FIELDNOTES_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^address:\s*"([^"]+)"/m);
  if (match) {
    notesByAddress.set(match[1], { filePath, filename });
  }
}

// Find root note
if (!notesByAddress.has(oldPrefix)) {
  console.error(`ERROR: No fieldnote with address "${oldPrefix}"`);
  console.error('The root note must exist. For orphaned children without a parent, use rename-address.js individually.');
  process.exit(1);
}

// Find all descendants
const renameMap = new Map(); // oldAddress → newAddress
renameMap.set(oldPrefix, newPrefix);

const childPrefix = oldPrefix + '//';
for (const [address] of notesByAddress) {
  if (address.startsWith(childPrefix)) {
    const suffix = address.slice(oldPrefix.length);
    renameMap.set(address, newPrefix + suffix);
  }
}

// Sort by address length descending (process longer addresses first)
const sortedEntries = [...renameMap.entries()].sort((a, b) => b[0].length - a[0].length);

// === Phase 2: Apply ===

console.log(applyMode ? '\n=== APPLY MODE ===' : '\n=== DRY-RUN MODE (pass --apply to execute) ===');
console.log(`Moving: "${oldPrefix}" → "${newPrefix}" (${renameMap.size} note${renameMap.size !== 1 ? 's' : ''})\n`);

// Display the rename map
const displayEntries = [...renameMap.entries()].sort((a, b) => a[0].length - b[0].length);
const maxOldLen = Math.max(...displayEntries.map(([old]) => old.length));
for (const [oldAddr, newAddr] of displayEntries) {
  console.log(`    ${oldAddr.padEnd(maxOldLen)}  →  ${newAddr}`);
}

// Process each note in the rename map
let totalFrontmatterUpdates = 0;

for (const [oldAddr, newAddr] of sortedEntries) {
  const noteInfo = notesByAddress.get(oldAddr);
  if (!noteInfo) continue;

  let content = fs.readFileSync(noteInfo.filePath, 'utf-8');

  // Update address:
  content = content.replace(
    /^(address:\s*)"[^"]+"/m,
    `$1"${newAddr}"`
  );

  // Update name: to new last segment
  const newParts = newAddr.split('//').map(s => s.trim());
  const newName = newParts[newParts.length - 1];
  content = content.replace(
    /^(name:\s*)"[^"]+"/m,
    `$1"${newName}"`
  );

  // Update distinct: and supersedes: entries (these still use addresses)
  for (const [oAddr, nAddr] of sortedEntries) {
    const fmEnd = content.indexOf('\n---', content.indexOf('---') + 3);
    if (fmEnd > 0) {
      const frontmatter = content.slice(0, fmEnd);
      const body = content.slice(fmEnd);
      const pattern = new RegExp(`"${escapeRegex(oAddr)}"`, 'g');
      const updatedFm = frontmatter.replace(
        /^((?:distinct|supersedes):\s*\[.*)"([^"]+)"(.*\])/gm,
        (line) => {
          return line.replace(pattern, () => {
            totalFrontmatterUpdates++;
            return `"${nAddr}"`;
          });
        }
      );
      if (updatedFm !== frontmatter) {
        content = updatedFm + body;
      }
    }
  }

  if (applyMode) {
    fs.writeFileSync(noteInfo.filePath, content, 'utf-8');
  }
}

console.log('');
console.log(`  No cross-file ref updates needed — refs use stable UIDs.`);
if (totalFrontmatterUpdates > 0) {
  console.log(`  ${totalFrontmatterUpdates} distinct/supersedes entries updated.`);
}

console.log('');
if (!applyMode) {
  console.log('  No changes written. Pass --apply to execute.');
} else {
  console.log(`  Done. Run \`npm run build\` to verify.`);
}
