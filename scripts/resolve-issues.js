// resolve-issues.js — Interactive issue resolver for fieldnotes validation
//
// Called by build-content.js when --interactive flag is set.
// Prompts the user to fix promptable issues (segment collisions, missing parents).
// Uses node:readline/promises for async terminal prompts.
//
// Every prompt accepts (q) to quit early — changes already written are kept.
// At the end, if any merge instructions were generated, a copyable Claude
// instruction block is printed for easy delegation.

import fs from 'fs';
import path from 'path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');

// ANSI color codes
const G = '\x1b[32m';   // green
const Y = '\x1b[33m';   // yellow
const C = '\x1b[36m';   // cyan
const M = '\x1b[35m';   // magenta
const D = '\x1b[90m';   // dim
const B = '\x1b[1m';    // bold
const X = '\x1b[0m';    // reset

// ── Filename convention (matches rename-address.js) ──

function addressToFilename(address) {
  return address.replace(/\/\//g, '_').replace(/\s+/g, '-') + '.md';
}

// ── Frontmatter modification (regex-based, preserves quoting style) ──

/**
 * Add addresses to the `distinct` array in a fieldnote's frontmatter.
 * Uses regex to avoid gray-matter.stringify which changes quoting style.
 *
 * Handles three cases:
 * 1. No `distinct` field → insert before closing `---`
 * 2. Existing inline array → append new entries
 * 3. Already present → skip duplicates
 */
function addDistinctEntry(filePath, addresses) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Parse existing distinct values
  const inlineMatch = content.match(/^distinct:\s*\[([^\]]*)\]/m);
  const existing = new Set();

  if (inlineMatch) {
    // Parse existing inline array entries
    const raw = inlineMatch[1];
    for (const entry of raw.split(',')) {
      const trimmed = entry.trim().replace(/^["']|["']$/g, '');
      if (trimmed) existing.add(trimmed);
    }

    // Filter out addresses that are already present
    const toAdd = addresses.filter(a => !existing.has(a));
    if (toAdd.length === 0) return { changed: false, skipped: addresses };

    // Build new array content
    for (const a of toAdd) existing.add(a);
    const newList = [...existing].map(a => `"${a}"`).join(', ');
    content = content.replace(/^distinct:\s*\[[^\]]*\]/m, `distinct: [${newList}]`);
  } else if (content.match(/^distinct:/m)) {
    // Multi-line YAML array — convert to inline for simplicity
    const toAdd = addresses;
    const newList = toAdd.map(a => `"${a}"`).join(', ');
    content = content.replace(/^distinct:.*(?:\n\s+-.*)*$/m, `distinct: [${newList}]`);
  } else {
    // No distinct field — insert before the closing ---
    const toAdd = addresses;
    const newList = toAdd.map(a => `"${a}"`).join(', ');
    const lines = content.split('\n');
    let dashCount = 0;
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        dashCount++;
        if (dashCount === 2) { insertIdx = i; break; }
      }
    }
    if (insertIdx !== -1) {
      lines.splice(insertIdx, 0, `distinct: [${newList}]`);
      content = lines.join('\n');
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  return { changed: true, added: addresses.filter(a => !existing || !existing.has(a)) };
}

// ── Stub note placeholder phrases ──

const STUB_PHRASES = [
  'This neuron hasn\'t fired yet.',
  'Null. But with potential.',
  'An empty space is an invitation to think.',
  'This note exists in superposition: it contains every possible idea until I write one.',
  'This note contains exactly what the Board has deemed necessary at this time.',
  'For a minute there, I lost my thought. I lost my thought.',
  'This could be a historic note. But right now, it\'s nothing.',
  'I\'ve been staring at this note for three hours. It\'s winning.',
  'Please enjoy each note equally. Even the empty ones.',
  'The work is mysterious and important. This note is mysterious and empty.',
  'My outie may have had a thought. My innie did not record it.',
  'You know what? I had a thought. A great thought. And now it\'s gone.',
  'A man who leaves a note empty is a man who is not paying attention.',
  'TARS: Humor setting: 75%. Note content: 0%. Adjusting expectations.',
  'And so, the blank note sits alone — a creature of infinite potential, yet profoundly still.',
  'The empty note is a choice. A terrible choice, but a choice nonetheless.',
  'fix: added note (empty) (will fill later) (I promise)',
  'I used to be a note full of ideas, then I took an arrow to the knee.',
  'Here we observe the empty note in its natural habitat. It waits. Patiently. Hoping to be filled before the season ends.',
  'I\'m sorry, Dave. I\'m afraid there\'s nothing here.',
  'There are no mistakes in here, only happy little empty notes.',
  'This note should have been filled 47 minutes ago. You can stand by.',
  'The only thing I know is that this note knows nothing.',
  'For sale: one note, never written.',
  'The definition of insanity is opening this note again and expecting content.',
  'TL;DR: there\'s nothing here. You\'re welcome.',
  'Don\'t panic. It\'s just an empty note.',
  '"One morning, upon waking from restless dreams, the note found itself transformed into something empty."',
  '"You miss 100% of the thoughts you don\'t write down."',
  '"The real treasure was the notes we forgot to write along the way."',
  '"It\'s not possible. — No. It\'s necessary. Write something."',
  '"Don\'t let me leave, Murph. Not with this note empty."',
  '"Stanley looked at the empty note. The empty note looked back at Stanley. Neither did anything productive."',
  '"This is the part where you write something profound ... We\'re waiting, Stanley."',
  '"A note never arrives empty nor full. It arrives precisely when it means to be written."',
];

function randomStubPhrase() {
  return STUB_PHRASES[Math.floor(Math.random() * STUB_PHRASES.length)];
}

/**
 * Generate a random 8-character alphanumeric UID.
 * Checks against existing filenames to avoid collisions.
 */
function generateUid() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const existing = new Set(
    fs.readdirSync(FIELDNOTES_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
  );
  let uid;
  do {
    uid = '';
    for (let i = 0; i < 8; i++) uid += chars[Math.floor(Math.random() * chars.length)];
  } while (existing.has(uid));
  return uid;
}

/**
 * Create a minimal stub fieldnote for a missing parent address.
 */
function createStubNote(address) {
  // Check if any existing file already has this address
  const files = fs.readdirSync(FIELDNOTES_DIR).filter(f => f.endsWith('.md') && f !== 'README.md');
  for (const file of files) {
    const content = fs.readFileSync(path.join(FIELDNOTES_DIR, file), 'utf-8');
    const addrMatch = content.match(/^address:\s*["']?(.+?)["']?\s*$/m);
    if (addrMatch && addrMatch[1] === address) return { created: false, reason: 'already exists' };
  }

  const uid = generateUid();
  const filename = `${uid}.md`;
  const filePath = path.join(FIELDNOTES_DIR, filename);
  const today = new Date().toISOString().split('T')[0];
  const name = address.split('//').pop().trim();
  const phrase = randomStubPhrase();
  const content = `---\nuid: "${uid}"\naddress: "${address}"\nname: "${name}"\ndate: "${today}"\n---\n${phrase}\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
  return { created: true, filePath };
}

/**
 * Find the .md file for a given fieldnote address.
 * First tries the filename convention, then scans all files.
 */
function findFileForAddress(address) {
  const conventionName = addressToFilename(address);
  const conventionPath = path.join(FIELDNOTES_DIR, conventionName);
  if (fs.existsSync(conventionPath)) return conventionPath;

  const files = fs.readdirSync(FIELDNOTES_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');
  for (const file of files) {
    const filePath = path.join(FIELDNOTES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const addrMatch = content.match(/^address:\s*["']?(.+?)["']?\s*$/m);
    if (addrMatch && addrMatch[1] === address) return filePath;
  }
  return null;
}

// ── Session state ──

// Tracks merge instructions across the session for the final summary.
// Each entry: { segment, keep, others: string[] }
const pendingMerges = [];

// Sentinel returned by ask() when the user wants to quit
const QUIT = Symbol('quit');

// ── Interactive flows ──

/**
 * Resolve all promptable issues interactively.
 * @param {Array} issues - Structured issues from validateFieldnotes()
 * @returns {Promise<{ filesModified: number }>}
 */
export async function resolveIssues(issues) {
  const promptable = issues.filter(i => i.promptable);
  if (promptable.length === 0) {
    console.log(`${D}No interactive issues to resolve.${X}`);
    return { filesModified: 0 };
  }

  // Non-TTY guard
  if (!process.stdin.isTTY) {
    console.log(`${Y}${promptable.length} fixable issue(s) detected but stdin is not a TTY.${X}`);
    console.log(`${D}Run interactively: npm run content:fix${X}`);
    return { filesModified: 0 };
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let filesModified = 0;
  let quit = false;

  console.log(`\n${B}[RESOLVE]${X} ${promptable.length} fixable issue${promptable.length !== 1 ? 's' : ''}  ${D}(q = quit at any prompt)${X}\n`);

  try {
    for (let i = 0; i < promptable.length; i++) {
      if (quit) break;

      const issue = promptable[i];
      const label = `${D}[${i + 1}/${promptable.length}]${X}`;

      let result = 0;
      if (issue.code === 'SEGMENT_COLLISION') {
        result = await resolveSegmentCollision(rl, issue, label);
      } else if (issue.code === 'ALIAS_COLLISION' || issue.code === 'ALIAS_ALIAS_COLLISION') {
        result = await resolveAliasCollision(rl, issue, label);
      } else if (issue.code === 'MISSING_PARENT') {
        result = await resolveMissingParent(rl, issue, label);
      }

      if (result === QUIT) {
        quit = true;
        const remaining = promptable.length - i - 1;
        if (remaining > 0) {
          console.log(`  ${D}Quit — ${remaining} issue${remaining !== 1 ? 's' : ''} skipped. Changes so far are saved.${X}\n`);
        }
      } else {
        filesModified += result;
      }
    }
  } finally {
    rl.close();
  }

  printSummary(filesModified);
  return { filesModified };
}

// ── Individual resolvers ──

async function resolveSegmentCollision(rl, issue, label) {
  const { segment, entries } = issue;

  console.log(`${label} ${Y}SEGMENT_COLLISION${X} (${issue.severity})`);
  console.log(`  Segment "${B}${segment}${X}" exists at:`);
  for (let j = 0; j < entries.length; j++) {
    const e = entries[j];
    const role = e.isRoot ? 'root' : e.isLeaf ? 'leaf' : 'mid';
    console.log(`    ${j + 1}. ${e.fullAddress}  ${D}(${role})${X}`);
  }
  console.log('');
  console.log(`  ${C}(d)${X} Different concepts — add ${B}distinct${X} to suppress`);
  console.log(`  ${C}(s)${X} Same concept — collect merge instructions`);
  console.log(`  ${D}(k) Skip  (q) Quit${X}`);

  const answer = await ask(rl, '  > ');
  if (answer === QUIT) return QUIT;

  if (answer === 'd' || answer === 'D') {
    return applyDistinct(entries);
  } else if (answer === 's' || answer === 'S') {
    collectMerge(segment, entries);
    return 0;
  } else {
    console.log(`  ${D}Skipped.${X}\n`);
    return 0;
  }
}

async function resolveAliasCollision(rl, issue, label) {
  console.log(`${label} ${Y}${issue.code}${X} (${issue.severity})`);

  if (issue.code === 'ALIAS_COLLISION') {
    console.log(`  "${B}${issue.segment}${X}" is a segment in [${issue.segAddresses.join(', ')}]`);
    console.log(`  and an alias on "${issue.aliasAddress}"`);
  } else {
    console.log(`  Alias "${B}${issue.segment}${X}" shared by: ${issue.addresses.join(', ')}`);
  }

  console.log('');
  console.log(`  ${D}(k) Skip — resolve manually  (q) Quit${X}`);

  const answer = await ask(rl, '  > ');
  if (answer === QUIT) return QUIT;

  console.log(`  ${D}Skipped.${X}\n`);
  return 0;
}

async function resolveMissingParent(rl, issue, label) {
  const { parent, children } = issue;
  const childList = children.length > 2
    ? `${children[0]}, ${children[1]} +${children.length - 2} more`
    : children.join(', ');

  console.log(`${label} ${Y}MISSING_PARENT${X}`);
  console.log(`  "${B}${parent}${X}" has no block ${D}(parent of ${childList})${X}`);
  console.log('');
  console.log(`  ${C}(c)${X} Create stub note`);
  console.log(`  ${D}(k) Skip  (q) Quit${X}`);

  const answer = await ask(rl, '  > ');
  if (answer === QUIT) return QUIT;

  if (answer === 'c' || answer === 'C') {
    const result = createStubNote(parent);
    if (result.created) {
      const relPath = path.relative(path.join(__dirname, '..'), result.filePath);
      console.log(`  ${G}✓ Created ${relPath}${X}\n`);
      return 1;
    } else {
      console.log(`  ${D}Already exists. Skipped.${X}\n`);
      return 0;
    }
  } else {
    console.log(`  ${D}Skipped.${X}\n`);
    return 0;
  }
}

// ── Helpers ──

function applyDistinct(entries) {
  // Pick the "target" note to receive the distinct entries.
  // Strategy: pick the deepest (most segments), then latest alphabetically.
  const sorted = [...entries].sort((a, b) => {
    const depthA = a.fullAddress.split('//').length;
    const depthB = b.fullAddress.split('//').length;
    if (depthB !== depthA) return depthB - depthA;
    return a.fullAddress.localeCompare(b.fullAddress);
  });

  const target = sorted[0];
  const others = sorted.slice(1).map(e => e.fullAddress);

  const filePath = findFileForAddress(target.fullAddress);
  if (!filePath) {
    console.log(`  ${Y}Could not find file for "${target.fullAddress}". Skipped.${X}\n`);
    return 0;
  }

  const result = addDistinctEntry(filePath, others);
  if (result.changed) {
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`  ${G}✓ Added distinct: [${others.map(a => `"${a}"`).join(', ')}] to ${relPath}${X}\n`);
    return 1;
  } else {
    console.log(`  ${D}Already suppressed. Skipped.${X}\n`);
    return 0;
  }
}

function collectMerge(segment, entries) {
  const addresses = entries.map(e => e.fullAddress);
  const keep = addresses[0];
  const others = addresses.slice(1);
  pendingMerges.push({ segment, keep, others });

  console.log(`  ${M}✎ Merge "${segment}" queued${X} — instructions will appear at the end.\n`);
}

async function ask(rl, prompt) {
  try {
    const answer = await rl.question(prompt);
    const trimmed = answer.trim().toLowerCase();
    if (trimmed === 'q') return QUIT;
    return answer.trim();
  } catch {
    // Ctrl+C or EOF — treat as quit
    return QUIT;
  }
}

// ── End-of-session summary ──

function printSummary(filesModified) {
  // Files modified
  if (filesModified > 0) {
    console.log(`\n${G}${B}[RESOLVE]${X} ${G}${filesModified} file${filesModified !== 1 ? 's' : ''} modified.${X}`);
    console.log(`${Y}Rebuild required — run: npm run content${X}`);
  } else if (pendingMerges.length === 0) {
    console.log(`\n${D}[RESOLVE] No changes made.${X}\n`);
    return;
  }

  // Pending merges — Claude instruction block
  if (pendingMerges.length > 0) {
    console.log('');
    console.log(`${M}${B}╭──────────────────────────────────────────────────────────────────╮${X}`);
    console.log(`${M}${B}│${X}  ${B}${pendingMerges.length} pending merge${pendingMerges.length !== 1 ? 's' : ''}${X} — copy the block below into Claude to execute  ${M}${B}│${X}`);
    console.log(`${M}${B}╰──────────────────────────────────────────────────────────────────╯${X}`);
    console.log('');

    // Build the copyable instruction block
    const lines = [];
    lines.push('Merge the following fieldnotes. For each group:');
    lines.push('1. Run the rename commands with --apply');
    lines.push('2. Manually combine the note bodies (keep the richer content)');
    lines.push('3. After all merges, run npm run build to verify');
    lines.push('');

    for (let i = 0; i < pendingMerges.length; i++) {
      const m = pendingMerges[i];
      lines.push(`Group ${i + 1}: "${m.segment}" — keep "${m.keep}"`);
      for (const other of m.others) {
        lines.push(`  node scripts/rename-address.js "${other}" "${m.keep}" --apply`);
      }
      lines.push('');
    }

    // Print with a distinct visual style (dim border, content is plain for copying)
    const maxLen = Math.max(...lines.map(l => l.length));
    const bar = '─'.repeat(maxLen + 4);

    console.log(`${D}┌${bar}┐${X}`);
    for (const line of lines) {
      const pad = ' '.repeat(maxLen - line.length);
      console.log(`${D}│${X}  ${line}${pad}  ${D}│${X}`);
    }
    console.log(`${D}└${bar}┘${X}`);
  }

  console.log('');
}
