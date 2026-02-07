#!/usr/bin/env node
// move-hierarchy.js — Cascading hierarchy rename for fieldnotes
//
// Usage:
//   node scripts/move-hierarchy.js "old prefix" "new prefix"           (dry-run)
//   node scripts/move-hierarchy.js "old prefix" "new prefix" --apply   (execute)
//
// What it does:
//   1. Finds the root note (address === oldPrefix) — must exist
//   2. Finds all descendants (address starts with oldPrefix + "//")
//   3. Computes new address for each: replaces oldPrefix with newPrefix
//   4. Validates: no target filename/address/ID collisions
//   5. Updates ALL .md files in one pass (address fields, distinct/supersedes, [[refs]])
//   6. Renames files for moved notes (after all content updates)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const FIELDNOTES_DIR = path.join(PAGES_DIR, 'fieldnotes');

// --- Helpers ---

function addressToFilename(address) {
  return address.replace(/\/\//g, '_').replace(/\s+/g, '-') + '.md';
}

function addressToId(address) {
  return address.replace(/\/\//g, '--').replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      results.push(fullPath);
    }
  }
  return results;
}

// --- Parse args ---

const args = process.argv.slice(2);
const applyMode = args.includes('--apply');
const positionalArgs = args.filter(a => a !== '--apply');

if (positionalArgs.length !== 2) {
  console.log('Usage: node scripts/move-hierarchy.js "old prefix" "new prefix" [--apply]');
  console.log('');
  console.log('  Moves a fieldnote and all its descendants to a new address prefix.');
  console.log('  Updates all references, distinct/supersedes entries, and filenames.');
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

const fieldnoteFiles = findMarkdownFiles(FIELDNOTES_DIR);

// Parse address from each fieldnote
const notesByAddress = new Map();
for (const filePath of fieldnoteFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^address:\s*"([^"]+)"/m);
  if (match) {
    notesByAddress.set(match[1], filePath);
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

// Sort by address length descending (process longer addresses first for safety)
const sortedEntries = [...renameMap.entries()].sort((a, b) => b[0].length - a[0].length);

// === Phase 2: Validate ===

// Check for target filename collisions
const collisions = [];
for (const [oldAddr, newAddr] of sortedEntries) {
  const newFilename = addressToFilename(newAddr);
  const newFilePath = path.join(FIELDNOTES_DIR, newFilename);

  if (fs.existsSync(newFilePath)) {
    // Check it's not a file we're moving (self-collision is OK)
    const existingAddr = [...notesByAddress.entries()].find(([, fp]) =>
      path.resolve(fp) === path.resolve(newFilePath)
    );
    if (!existingAddr || !renameMap.has(existingAddr[0])) {
      collisions.push({ oldAddr, newAddr, newFilename });
    }
  }
}

if (collisions.length > 0) {
  console.error('ERROR: Target filename collision(s):');
  for (const { oldAddr, newAddr, newFilename } of collisions) {
    console.error(`  "${oldAddr}" → "${newAddr}" collides with existing file: ${newFilename}`);
  }
  process.exit(1);
}

// Check for target ID collisions (two new addresses normalize to same slug)
const newIds = new Map();
for (const [oldAddr, newAddr] of sortedEntries) {
  const id = addressToId(newAddr);
  if (newIds.has(id)) {
    console.error(`ERROR: Target ID collision — "${newAddr}" and "${newIds.get(id)}" both normalize to ID "${id}"`);
    process.exit(1);
  }
  newIds.set(id, newAddr);
}

// === Phase 3: Apply ===

console.log(applyMode ? '\n=== APPLY MODE ===' : '\n=== DRY-RUN MODE (pass --apply to execute) ===');
console.log(`Moving: "${oldPrefix}" → "${newPrefix}" (${renameMap.size} note${renameMap.size !== 1 ? 's' : ''})\n`);

// Display the rename map
console.log(`  ${renameMap.size} note${renameMap.size !== 1 ? 's' : ''} to move:`);
// Show in natural order (shortest/parent first) for readability
const displayEntries = [...renameMap.entries()].sort((a, b) => a[0].length - b[0].length);
const maxOldLen = Math.max(...displayEntries.map(([old]) => old.length));
for (const [oldAddr, newAddr] of displayEntries) {
  console.log(`    ${oldAddr.padEnd(maxOldLen)}  →  ${newAddr}`);
}

// Show file renames
console.log('\n  File renames:');
const maxOldFilenameLen = Math.max(...displayEntries.map(([old]) => addressToFilename(old).length));
for (const [oldAddr, newAddr] of displayEntries) {
  const oldFn = addressToFilename(oldAddr);
  const newFn = addressToFilename(newAddr);
  console.log(`    ${oldFn.padEnd(maxOldFilenameLen)}  →  ${newFn}`);
}

// Process all .md files under pages/
const allMdFiles = findMarkdownFiles(PAGES_DIR);
let totalRefUpdates = 0;
let filesWithRefUpdates = 0;
let totalFrontmatterUpdates = 0;
let filesWithFrontmatterUpdates = 0;

// Build set of file paths being moved (resolved) for tracking
const movedFilePaths = new Set();
for (const [oldAddr] of renameMap) {
  movedFilePaths.add(path.resolve(notesByAddress.get(oldAddr)));
}

for (const filePath of allMdFiles) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  const resolvedPath = path.resolve(filePath);
  const isMovedNote = movedFilePaths.has(resolvedPath);

  // Step 1: If this is a moved note, update address: field
  if (isMovedNote) {
    const addrMatch = content.match(/^address:\s*"([^"]+)"/m);
    if (addrMatch && renameMap.has(addrMatch[1])) {
      const oldAddr = addrMatch[1];
      const newAddr = renameMap.get(oldAddr);
      content = content.replace(
        /^(address:\s*)"[^"]+"/m,
        `$1"${newAddr}"`
      );
      changed = true;
    }
  }

  // Step 2: Update distinct: and supersedes: entries in frontmatter
  // These are always double-quoted strings in YAML arrays
  let fmUpdates = 0;
  for (const [oldAddr, newAddr] of sortedEntries) {
    // Match "oldAddr" in frontmatter context (distinct/supersedes arrays)
    const fmPattern = new RegExp(`"${escapeRegex(oldAddr)}"`, 'g');

    // Only replace within frontmatter (between --- delimiters)
    const fmEnd = content.indexOf('\n---', content.indexOf('---') + 3);
    if (fmEnd > 0) {
      const frontmatter = content.slice(0, fmEnd);
      const body = content.slice(fmEnd);

      // Don't re-replace the address: field (already handled above)
      // Only target distinct: and supersedes: lines
      const updatedFm = frontmatter.replace(
        /^((?:distinct|supersedes):\s*\[.*)"([^"]+)"(.*\])/gm,
        (line) => {
          let lineChanged = false;
          const result = line.replace(fmPattern, (match) => {
            // Don't replace if this is the address: line
            if (line.trimStart().startsWith('address:')) return match;
            fmUpdates++;
            lineChanged = true;
            return `"${newAddr}"`;
          });
          return result;
        }
      );

      if (updatedFm !== frontmatter) {
        content = updatedFm + body;
        changed = true;
      }
    }
  }

  if (fmUpdates > 0) {
    totalFrontmatterUpdates += fmUpdates;
    filesWithFrontmatterUpdates++;
  }

  // Step 3: Update [[refs]] in body text
  let refUpdates = 0;
  for (const [oldAddr, newAddr] of sortedEntries) {
    const refPattern = new RegExp(
      `\\[\\[${escapeRegex(oldAddr)}(\\s*\\|[^\\]]*)?\\]\\]`,
      'g'
    );
    content = content.replace(refPattern, (match, pipePart) => {
      refUpdates++;
      return `[[${newAddr}${pipePart || ''}]]`;
    });
  }

  if (refUpdates > 0) {
    totalRefUpdates += refUpdates;
    filesWithRefUpdates++;
    changed = true;
  }

  // Write updated content
  if (changed && applyMode) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

// Step 4: Rename files (after all content updates)
if (applyMode) {
  // Rename in reverse order (children first) to avoid path conflicts
  for (const [oldAddr, newAddr] of sortedEntries) {
    const oldFilePath = notesByAddress.get(oldAddr);
    const newFilename = addressToFilename(newAddr);
    const newFilePath = path.join(FIELDNOTES_DIR, newFilename);

    if (path.resolve(oldFilePath) !== path.resolve(newFilePath)) {
      fs.renameSync(oldFilePath, newFilePath);
    }
  }
}

// === Phase 4: Report ===

console.log('');

if (totalRefUpdates > 0) {
  console.log(`  Reference updates: ${totalRefUpdates} ref${totalRefUpdates !== 1 ? 's' : ''} across ${filesWithRefUpdates} file${filesWithRefUpdates !== 1 ? 's' : ''}`);
}

if (totalFrontmatterUpdates > 0) {
  console.log(`  Distinct/supersedes updates: ${totalFrontmatterUpdates} entr${totalFrontmatterUpdates !== 1 ? 'ies' : 'y'} in ${filesWithFrontmatterUpdates} file${filesWithFrontmatterUpdates !== 1 ? 's' : ''}`);
}

if (totalRefUpdates === 0 && totalFrontmatterUpdates === 0) {
  console.log('  No references to update in other files.');
}

console.log('');
if (!applyMode) {
  console.log('  No changes written. Pass --apply to execute.');
} else {
  console.log(`  Done. Run \`npm run build\` to verify.`);
}
