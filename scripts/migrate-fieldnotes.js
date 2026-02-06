// One-time migration: split _fieldnotes.md into individual .md files with frontmatter.
// Usage: node scripts/migrate-fieldnotes.js
// After running, verify the files in src/data/pages/fieldnotes/ and delete _fieldnotes.md.bak

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');
const SOURCE_FILE = path.join(FIELDNOTES_DIR, '_fieldnotes.md');
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

if (!fs.existsSync(SOURCE_FILE)) {
  console.error('Source file not found:', SOURCE_FILE);
  process.exit(1);
}

const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
const blocks = content.split(/\n---\n/).map(b => b.trim()).filter(Boolean);

console.log(`Found ${blocks.length} notes to migrate.`);

let created = 0;

for (const block of blocks) {
  const lines = block.split('\n');
  const address = lines[0].trim();
  const body = lines.slice(1).join('\n').trim();

  // Generate filename: // → _, / → -, spaces → -, preserve casing
  const filename = address
    .replace(/\/\//g, '_')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    + '.md';

  const frontmatter = [
    '---',
    `address: "${address}"`,
    `date: "${TODAY}"`,
    '---',
  ].join('\n');

  const fileContent = frontmatter + '\n' + body + '\n';
  const filePath = path.join(FIELDNOTES_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.warn(`  SKIP (exists): ${filename}`);
    continue;
  }

  fs.writeFileSync(filePath, fileContent);
  created++;
  console.log(`  OK: ${filename}`);
}

// Rename source to .bak
const bakPath = SOURCE_FILE + '.bak';
fs.renameSync(SOURCE_FILE, bakPath);

console.log(`\nMigration complete: ${created} files created, source renamed to _fieldnotes.md.bak`);
