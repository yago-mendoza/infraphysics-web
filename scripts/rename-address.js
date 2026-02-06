#!/usr/bin/env node
// rename-address.js — Rename a fieldnote address and update all references
//
// Usage:
//   node scripts/rename-address.js "old address" "new address"           (dry-run)
//   node scripts/rename-address.js "old address" "new address" --apply   (execute)
//
// What it does:
//   1. Finds the source .md file with address: "old address"
//   2. Updates its frontmatter to address: "new address"
//   3. Renames the file following the naming convention (// → _, spaces → -)
//   4. Scans ALL .md files and replaces [[old address]] with [[new address]]
//   5. Reports every change made

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const FIELDNOTES_DIR = path.join(PAGES_DIR, 'fieldnotes');

const args = process.argv.slice(2);
const applyMode = args.includes('--apply');
const positionalArgs = args.filter(a => a !== '--apply');

if (positionalArgs.length !== 2) {
  console.log('Usage: node scripts/rename-address.js "old address" "new address" [--apply]');
  console.log('');
  console.log('  Dry-run by default. Pass --apply to execute changes.');
  process.exit(1);
}

const [oldAddress, newAddress] = positionalArgs;

if (oldAddress === newAddress) {
  console.log('Old and new addresses are the same. Nothing to do.');
  process.exit(0);
}

// Address → filename convention: // → _, spaces → -
function addressToFilename(address) {
  return address.replace(/\/\//g, '_').replace(/\s+/g, '-') + '.md';
}

// Recursively find all .md files under a directory
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

// --- Main ---

console.log(applyMode ? '\n=== APPLY MODE ===' : '\n=== DRY-RUN MODE (pass --apply to execute) ===');
console.log(`Renaming: "${oldAddress}" → "${newAddress}"\n`);

// 1. Find source file
const oldFilename = addressToFilename(oldAddress);
const oldFilePath = path.join(FIELDNOTES_DIR, oldFilename);

if (!fs.existsSync(oldFilePath)) {
  console.error(`ERROR: Source file not found: ${oldFilename}`);
  console.error(`Expected at: ${oldFilePath}`);
  process.exit(1);
}

// Verify frontmatter address matches
const sourceContent = fs.readFileSync(oldFilePath, 'utf-8');
const addressMatch = sourceContent.match(/^address:\s*"([^"]+)"/m);
if (!addressMatch || addressMatch[1] !== oldAddress) {
  console.error(`ERROR: File ${oldFilename} has address "${addressMatch?.[1]}" but expected "${oldAddress}"`);
  process.exit(1);
}

// 2. Prepare new file
const newFilename = addressToFilename(newAddress);
const newFilePath = path.join(FIELDNOTES_DIR, newFilename);

if (fs.existsSync(newFilePath) && newFilePath !== oldFilePath) {
  console.error(`ERROR: Target file already exists: ${newFilename}`);
  process.exit(1);
}

// 3. Update frontmatter in source file
const updatedSource = sourceContent.replace(
  /^(address:\s*)"[^"]+"/m,
  `$1"${newAddress}"`
);

console.log(`  Rename file: ${oldFilename} → ${newFilename}`);
console.log(`  Update frontmatter: address: "${oldAddress}" → address: "${newAddress}"`);

if (applyMode) {
  fs.writeFileSync(oldFilePath, updatedSource, 'utf-8');
  if (newFilePath !== oldFilePath) {
    fs.renameSync(oldFilePath, newFilePath);
  }
}

// 4. Scan all .md files for [[old address]] references
const allMdFiles = findMarkdownFiles(PAGES_DIR);
let totalReplacements = 0;
let filesUpdated = 0;
const changes = [];

for (const filePath of allMdFiles) {
  // Skip the source file (we already handled it)
  if (path.resolve(filePath) === path.resolve(oldFilePath) || path.resolve(filePath) === path.resolve(newFilePath)) continue;

  const content = fs.readFileSync(filePath, 'utf-8');

  // Match [[old address]] and [[old address | annotation]]
  const pattern = new RegExp(
    `\\[\\[${escapeRegex(oldAddress)}(\\s*\\|[^\\]]*)?\\]\\]`,
    'g'
  );

  let count = 0;
  const updated = content.replace(pattern, (match, pipePart) => {
    count++;
    return `[[${newAddress}${pipePart || ''}]]`;
  });

  if (count > 0) {
    const relative = path.relative(PAGES_DIR, filePath).replace(/\\/g, '/');
    changes.push({ file: relative, count });
    totalReplacements += count;
    filesUpdated++;

    if (applyMode) {
      fs.writeFileSync(filePath, updated, 'utf-8');
    }
  }
}

// 5. Report
if (changes.length > 0) {
  console.log(`\n  Updated ${totalReplacements} reference${totalReplacements !== 1 ? 's' : ''} across ${filesUpdated} file${filesUpdated !== 1 ? 's' : ''}:`);
  for (const { file, count } of changes) {
    console.log(`    ${file}: [[${oldAddress}]] → [[${newAddress}]]${count > 1 ? ` (x${count})` : ''}`);
  }
} else {
  console.log('\n  No references to update in other files.');
}

if (!applyMode) {
  console.log('\n  No changes written. Pass --apply to execute.');
} else {
  console.log('\n  Done. Run `npm run build` to verify.');
}

// --- Helpers ---

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
