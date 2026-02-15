#!/usr/bin/env node
// migrate-to-uids.js — One-time migration: address-based → UID-based fieldnotes
//
// Usage:
//   node scripts/migrate-to-uids.js            (dry-run)
//   node scripts/migrate-to-uids.js --apply    (execute)
//
// What it does:
//   1. Reads all fieldnote .md files, generates 8-char nanoid per note
//   2. Adds `uid` and `name` to frontmatter
//   3. Rewrites ALL [[address]] refs across ALL .md files to [[uid]]
//   4. Rewrites trailing refs: [[uid]] :: annotation
//   5. Renames files: old.md → {uid}.md
//   6. Outputs uid-map.json for reference
//
// Atomic: builds full change set in memory, validates, then writes all.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const FIELDNOTES_DIR = path.join(PAGES_DIR, 'fieldnotes');

const applyMode = process.argv.includes('--apply');

// --- Helpers ---

function findMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_') && entry.name !== 'README.md') {
      results.push(fullPath);
    }
  }
  return results;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateUid() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

// --- Main ---

console.log(applyMode ? '\n=== APPLY MODE ===' : '\n=== DRY-RUN MODE (pass --apply to execute) ===\n');

// Phase 1: Read all fieldnotes, generate UIDs
const fieldnoteFiles = fs.readdirSync(FIELDNOTES_DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');

const addressToUid = new Map();   // address → uid
const uidToAddress = new Map();   // uid → address
const uidToName = new Map();      // uid → display name
const fileChanges = new Map();    // filePath → { newContent, newPath }

// Generate UIDs and ensure uniqueness
const usedUids = new Set();
for (const filename of fieldnoteFiles) {
  const filePath = path.join(FIELDNOTES_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const addressMatch = content.match(/^address:\s*"([^"]+)"/m);
  if (!addressMatch) {
    console.error(`  ERROR: ${filename} missing address`);
    continue;
  }
  const address = addressMatch[1];
  let uid;
  do {
    uid = generateUid();
  } while (usedUids.has(uid));
  usedUids.add(uid);

  const parts = address.split('//').map(s => s.trim());
  const name = parts[parts.length - 1];

  addressToUid.set(address, uid);
  uidToAddress.set(uid, address);
  uidToName.set(uid, name);
}

console.log(`Generated UIDs for ${addressToUid.size} fieldnotes.\n`);

// Sort addresses by length descending for replacement (longer first to avoid partial matches)
const sortedAddresses = [...addressToUid.keys()].sort((a, b) => b.length - a.length);

// Phase 2: Build replacement patterns
// We need to replace [[address]] and [[address|text]] with [[uid]] and [[uid|text]]
// Also handle trailing refs: [[address]] :: annotation → [[uid]] :: annotation
function rewriteWikiLinks(content) {
  let result = content;
  for (const address of sortedAddresses) {
    const uid = addressToUid.get(address);
    const pattern = new RegExp(
      `\\[\\[${escapeRegex(address)}(\\s*\\|[^\\]]*)?\\]\\]`,
      'g'
    );
    result = result.replace(pattern, (match, pipePart) => {
      return `[[${uid}${pipePart || ''}]]`;
    });
  }
  return result;
}

// Phase 3: Process fieldnote files (add uid/name to frontmatter + rewrite refs + rename)
for (const filename of fieldnoteFiles) {
  const filePath = path.join(FIELDNOTES_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf-8');
  const addressMatch = content.match(/^address:\s*"([^"]+)"/m);
  if (!addressMatch) continue;
  const address = addressMatch[1];
  const uid = addressToUid.get(address);
  const name = uidToName.get(uid);

  // Add uid and name after address line in frontmatter
  content = content.replace(
    /^(address:\s*"[^"]+")/m,
    `uid: "${uid}"\n$1\nname: "${name}"`
  );

  // Rewrite [[refs]] in body
  content = rewriteWikiLinks(content);

  const newFilename = `${uid}.md`;
  const newFilePath = path.join(FIELDNOTES_DIR, newFilename);

  fileChanges.set(filePath, { newContent: content, newPath: newFilePath, uid, address });
}

// Phase 4: Process all other .md files (rewrite [[refs]])
const allMdFiles = findMarkdownFiles(PAGES_DIR);
for (const filePath of allMdFiles) {
  // Skip fieldnotes (already handled above)
  if (filePath.startsWith(FIELDNOTES_DIR)) continue;

  const content = fs.readFileSync(filePath, 'utf-8');
  const rewritten = rewriteWikiLinks(content);

  if (rewritten !== content) {
    fileChanges.set(filePath, { newContent: rewritten, newPath: filePath });
  }
}

// Phase 5: Validate
const uidSet = new Set(addressToUid.values());
if (uidSet.size !== addressToUid.size) {
  console.error('ERROR: UID collision detected!');
  process.exit(1);
}

// Phase 6: Report
console.log('Fieldnote UID assignments:');
const maxAddrLen = Math.max(...[...addressToUid.keys()].map(a => a.length));
for (const [address, uid] of [...addressToUid.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${address.padEnd(maxAddrLen)}  →  ${uid}  (${uidToName.get(uid)})`);
}

const fieldnoteChanges = [...fileChanges.entries()].filter(([fp]) => fp.startsWith(FIELDNOTES_DIR));
const otherChanges = [...fileChanges.entries()].filter(([fp]) => !fp.startsWith(FIELDNOTES_DIR));

console.log(`\n  ${fieldnoteChanges.length} fieldnote files to update + rename`);
console.log(`  ${otherChanges.length} other files with wiki-link rewrites`);

if (otherChanges.length > 0) {
  console.log('\n  Files with wiki-link updates:');
  for (const [fp] of otherChanges) {
    console.log(`    ${path.relative(PAGES_DIR, fp).replace(/\\/g, '/')}`);
  }
}

// Phase 7: Apply
if (applyMode) {
  console.log('\nApplying changes...');

  // Write updated fieldnote content first (before renaming)
  for (const [oldPath, { newContent }] of fileChanges) {
    if (oldPath.startsWith(FIELDNOTES_DIR)) {
      fs.writeFileSync(oldPath, newContent, 'utf-8');
    }
  }

  // Rename fieldnote files
  for (const [oldPath, { newPath }] of fileChanges) {
    if (oldPath.startsWith(FIELDNOTES_DIR) && oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
    }
  }

  // Write other files
  for (const [filePath, { newContent, newPath }] of fileChanges) {
    if (!filePath.startsWith(FIELDNOTES_DIR)) {
      fs.writeFileSync(newPath, newContent, 'utf-8');
    }
  }

  // Output uid-map.json
  const uidMap = {};
  for (const [address, uid] of addressToUid) {
    uidMap[address] = { uid, name: uidToName.get(uid) };
  }
  const mapPath = path.join(__dirname, '../uid-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(uidMap, null, 2));
  console.log(`\n  uid-map.json written to ${mapPath}`);

  console.log('\n  Done. Run `npm run build` to verify.');
} else {
  console.log('\n  No changes written. Pass --apply to execute.');
}
