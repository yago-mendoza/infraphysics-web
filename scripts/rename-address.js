#!/usr/bin/env node
// rename-address.js — Rename a fieldnote address (UID-based system)
//
// Usage:
//   node scripts/rename-address.js "old address" "new address"           (dry-run)
//   node scripts/rename-address.js "old address" "new address" --apply   (execute)
//
// What it does:
//   1. Finds the source .md file with address: "old address"
//   2. Updates address: and name: in frontmatter
//   3. No cross-file reference rewriting needed (refs use stable UIDs)

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
  console.log('  No cross-file updates needed — refs use stable UIDs.');
  process.exit(1);
}

const [oldAddress, newAddress] = positionalArgs;

if (oldAddress === newAddress) {
  console.log('Old and new addresses are the same. Nothing to do.');
  process.exit(0);
}

// Find source file by scanning frontmatter for address match
const fieldnoteFiles = fs.readdirSync(FIELDNOTES_DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');

let sourceFile = null;
for (const filename of fieldnoteFiles) {
  const filePath = path.join(FIELDNOTES_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const addressMatch = content.match(/^address:\s*"([^"]+)"/m);
  if (addressMatch && addressMatch[1] === oldAddress) {
    sourceFile = { filename, filePath, content };
    break;
  }
}

if (!sourceFile) {
  console.error(`ERROR: No fieldnote found with address "${oldAddress}"`);
  process.exit(1);
}

console.log(applyMode ? '\n=== APPLY MODE ===' : '\n=== DRY-RUN MODE (pass --apply to execute) ===');
console.log(`Renaming: "${oldAddress}" → "${newAddress}"\n`);

// Update address in frontmatter
let updatedContent = sourceFile.content.replace(
  /^(address:\s*)"[^"]+"/m,
  `$1"${newAddress}"`
);

// Update name to new last segment
const newParts = newAddress.split('//').map(s => s.trim());
const newName = newParts[newParts.length - 1];
updatedContent = updatedContent.replace(
  /^(name:\s*)"[^"]+"/m,
  `$1"${newName}"`
);

console.log(`  File: ${sourceFile.filename}`);
console.log(`  address: "${oldAddress}" → "${newAddress}"`);
console.log(`  name: → "${newName}"`);
console.log(`\n  No cross-file updates needed — refs use stable UIDs.`);

if (applyMode) {
  fs.writeFileSync(sourceFile.filePath, updatedContent, 'utf-8');
  console.log('\n  Done. Run `npm run build` to verify.');
} else {
  console.log('\n  No changes written. Pass --apply to execute.');
}
