#!/usr/bin/env node
// check-references.js — Full integrity audit for fieldnotes
//
// Usage: node scripts/check-references.js
//
// Checks:
//   1. Orphan notes (no incoming or outgoing references)
//   2. Weak parents (address segments with no dedicated note)
//   3. One-way trailing refs (A→B but not B→A)
//   4. Redundant trailing refs (also mentioned in body text)
//   5. Potential duplicate addresses (fuzzy similarity)

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');

// --- Parse all fieldnotes ---

function addressToId(address) {
  return address.toLowerCase().replace(/\/\//g, '--').replace(/\//g, '-').replace(/\s+/g, '-');
}

function parseAllFieldnotes() {
  if (!fs.existsSync(FIELDNOTES_DIR)) {
    console.error('Fieldnotes directory not found:', FIELDNOTES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(FIELDNOTES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  const notes = [];

  for (const filename of files) {
    const filePath = path.join(FIELDNOTES_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: bodyMd } = matter(fileContent);

    const address = frontmatter.address;
    if (!address) continue;

    const id = addressToId(address);
    const addressParts = address.split('//').map(s => s.trim());

    // Extract all [[...]] references from body
    const refRegex = /\[\[([^\]]+)\]\]/g;
    const allRefs = [];
    let match;
    while ((match = refRegex.exec(bodyMd)) !== null) {
      const raw = match[1];
      const pipeIdx = raw.indexOf('|');
      allRefs.push(pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim());
    }

    // Extract trailing refs (last lines of body)
    const bodyLines = bodyMd.split('\n');
    const trailingRefs = [];
    const trailingRefPattern = /^\s*(\[\[[^\]]+\]\]\s*)+$/;

    for (let i = bodyLines.length - 1; i >= 0; i--) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      if (trailingRefPattern.test(line)) {
        const lineRefRegex = /\[\[([^\]]+)\]\]/g;
        let lineMatch;
        while ((lineMatch = lineRefRegex.exec(line)) !== null) {
          const raw = lineMatch[1];
          const pipeIdx = raw.indexOf('|');
          trailingRefs.push(pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim());
        }
      } else {
        break;
      }
    }

    // Body-only refs = allRefs minus trailing refs
    const trailingSet = new Set(trailingRefs);
    const bodyOnlyRefs = allRefs.filter(r => !trailingSet.has(r));

    notes.push({
      filename,
      address,
      id,
      addressParts,
      allRefs,
      bodyOnlyRefs,
      trailingRefs,
      description: frontmatter.description || '',
      aliases: frontmatter.aliases || [],
      distinct: frontmatter.distinct || [],
      supersedes: frontmatter.supersedes || null,
    });
  }

  return notes;
}

// --- Checks ---

function checkOrphans(notes) {
  const knownAddresses = new Set(notes.map(n => n.address));
  const referencedAddresses = new Set();

  // Collect all addresses that are referenced by any note
  for (const note of notes) {
    for (const ref of note.allRefs) {
      referencedAddresses.add(ref);
    }
  }

  const orphans = notes.filter(note => {
    const hasOutgoing = note.allRefs.length > 0;
    const hasIncoming = referencedAddresses.has(note.address);
    return !hasOutgoing && !hasIncoming;
  });

  return orphans;
}

function checkWeakParents(notes) {
  const knownAddresses = new Set(notes.map(n => n.address));
  const weakParents = new Map(); // address → child addresses

  for (const note of notes) {
    if (note.addressParts.length <= 1) continue;

    for (let i = 1; i < note.addressParts.length; i++) {
      const parentAddr = note.addressParts.slice(0, i).join('//');
      if (!knownAddresses.has(parentAddr)) {
        if (!weakParents.has(parentAddr)) weakParents.set(parentAddr, []);
        weakParents.get(parentAddr).push(note.address);
      }
    }
  }

  return weakParents;
}

function checkOneWayTrailingRefs(notes) {
  const noteByAddress = new Map(notes.map(n => [n.address, n]));
  const oneWay = [];

  for (const note of notes) {
    for (const ref of note.trailingRefs) {
      const target = noteByAddress.get(ref);
      if (!target) continue; // broken ref — caught by build validation

      const targetHasBack = target.trailingRefs.includes(note.address);
      if (!targetHasBack) {
        oneWay.push({ from: note.address, to: ref });
      }
    }
  }

  return oneWay;
}

function checkRedundantTrailingRefs(notes) {
  const redundant = [];

  for (const note of notes) {
    for (const ref of note.trailingRefs) {
      // Check if this trailing ref also appears in body text
      if (note.bodyOnlyRefs.includes(ref)) {
        redundant.push({ note: note.address, ref });
      }
    }
  }

  return redundant;
}

function checkPotentialDuplicates(notes) {
  const dupes = [];

  // Normalize for comparison: lowercase, strip //, strip common suffixes
  function normalize(addr) {
    return addr.toLowerCase()
      .replace(/\/\//g, ' ')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Simple Levenshtein distance
  function editDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = normalize(notes[i].address);
      const b = normalize(notes[j].address);

      // Skip if one is a child of the other (shared prefix is expected)
      if (notes[i].address.startsWith(notes[j].address + '//') ||
          notes[j].address.startsWith(notes[i].address + '//')) {
        continue;
      }

      const maxLen = Math.max(a.length, b.length);
      if (maxLen === 0) continue;

      const dist = editDistance(a, b);
      const similarity = 1 - dist / maxLen;

      // Flag if > 80% similar (but not identical — that's caught by build)
      if (similarity > 0.8 && similarity < 1) {
        dupes.push({
          a: notes[i].address,
          b: notes[j].address,
          similarity: Math.round(similarity * 100),
        });
      }
    }
  }

  return dupes;
}

function checkSegmentCollisions(notes) {
  const EXCLUSIONS = new Set([
    'overview', 'intro', 'basics', 'summary', 'notes',
    'example', 'examples', 'reference', 'references',
    'config', 'configuration', 'settings', 'setup',
    'types', 'glossary', 'faq', 'history',
  ]);

  // Suppression pairs from `distinct` frontmatter
  const suppressed = new Set();
  for (const note of notes) {
    for (const other of (note.distinct || [])) {
      suppressed.add([note.address, other].sort().join('\0'));
    }
  }

  // Superseded addresses excluded
  const superseded = new Set(notes.filter(n => n.supersedes).map(n => n.supersedes));

  // Build segment registry
  const registry = new Map();
  for (const note of notes) {
    if (superseded.has(note.address)) continue;
    const parts = note.addressParts;

    for (let i = 1; i < parts.length; i++) {
      const key = parts[i].toLowerCase();
      if (EXCLUSIONS.has(key)) continue;
      if (!registry.has(key)) registry.set(key, []);
      registry.get(key).push({
        fullAddress: note.address,
        parentPath: parts.slice(0, i).join('//'),
        isLeaf: i === parts.length - 1,
        isRoot: false,
      });
    }

    if (parts.length === 1) {
      const key = parts[0].toLowerCase();
      if (!EXCLUSIONS.has(key)) {
        if (!registry.has(key)) registry.set(key, []);
        registry.get(key).push({
          fullAddress: note.address,
          parentPath: null,
          isLeaf: true,
          isRoot: true,
        });
      }
    }
  }

  const collisions = [];

  for (const [segName, entries] of registry) {
    if (entries.length < 2) continue;

    const parentSet = new Set(entries.map(e => (e.parentPath || '__root__').toLowerCase()));
    if (parentSet.size < 2) continue;

    const addrs = entries.map(e => e.fullAddress);
    const filtered = entries.filter(e =>
      !addrs.some(a => a !== e.fullAddress &&
        (e.fullAddress.startsWith(a + '//') || a.startsWith(e.fullAddress + '//')))
    );

    const filteredParents = new Set(filtered.map(e => (e.parentPath || '__root__').toLowerCase()));
    if (filteredParents.size < 2) continue;

    const unsuppressed = filtered.filter(e =>
      filtered.some(o =>
        o.fullAddress !== e.fullAddress &&
        !suppressed.has([e.fullAddress, o.fullAddress].sort().join('\0'))
      )
    );

    const unsuppParents = new Set(unsuppressed.map(e => (e.parentPath || '__root__').toLowerCase()));
    if (unsuppParents.size < 2) continue;

    const leafCount = unsuppressed.filter(e => e.isLeaf).length;
    const rootCount = unsuppressed.filter(e => e.isRoot).length;
    let tier = 'LOW';
    if (leafCount >= 2) tier = 'HIGH';
    else if (rootCount >= 1 || leafCount === 1) tier = 'MED';

    collisions.push({ segment: segName, entries: unsuppressed, tier });
  }

  const tierOrder = { HIGH: 0, MED: 1, LOW: 2 };
  collisions.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

  return collisions;
}

// --- Main ---

console.log('\n=== Fieldnotes Integrity Audit ===\n');

const notes = parseAllFieldnotes();
console.log(`Scanned ${notes.length} fieldnotes.\n`);

let issues = 0;

// 1. Orphans
const orphans = checkOrphans(notes);
if (orphans.length > 0) {
  console.log(`\x1b[33m[ORPHANS]\x1b[0m ${orphans.length} note${orphans.length !== 1 ? 's' : ''} with no incoming or outgoing references:`);
  for (const o of orphans) {
    console.log(`  ${o.address}`);
  }
  console.log('');
  issues += orphans.length;
} else {
  console.log(`\x1b[32m[ORPHANS]\x1b[0m None found.\n`);
}

// 2. Weak parents
const weakParents = checkWeakParents(notes);
if (weakParents.size > 0) {
  console.log(`\x1b[33m[WEAK PARENTS]\x1b[0m ${weakParents.size} address segment${weakParents.size !== 1 ? 's' : ''} with no dedicated note:`);
  for (const [parent, children] of weakParents) {
    console.log(`  "${parent}" — used by: ${children.join(', ')}`);
  }
  console.log('');
  issues += weakParents.size;
} else {
  console.log(`\x1b[32m[WEAK PARENTS]\x1b[0m All address segments have dedicated notes.\n`);
}

// 3. One-way trailing refs
const oneWay = checkOneWayTrailingRefs(notes);
if (oneWay.length > 0) {
  console.log(`\x1b[33m[ONE-WAY TRAILING REFS]\x1b[0m ${oneWay.length} trailing ref${oneWay.length !== 1 ? 's' : ''} without a reciprocal:`);
  for (const { from, to } of oneWay) {
    console.log(`  ${from} → ${to}  (but ${to} does not trail-ref back)`);
  }
  console.log('');
  issues += oneWay.length;
} else {
  console.log(`\x1b[32m[ONE-WAY TRAILING REFS]\x1b[0m All trailing refs are bilateral.\n`);
}

// 4. Redundant trailing refs
const redundant = checkRedundantTrailingRefs(notes);
if (redundant.length > 0) {
  console.log(`\x1b[33m[REDUNDANT TRAILING REFS]\x1b[0m ${redundant.length} trailing ref${redundant.length !== 1 ? 's' : ''} also mentioned in body text:`);
  for (const { note, ref } of redundant) {
    console.log(`  "${note}" has [[${ref}]] in both body and trailing refs`);
  }
  console.log('');
  issues += redundant.length;
} else {
  console.log(`\x1b[32m[REDUNDANT TRAILING REFS]\x1b[0m No trailing refs are redundant.\n`);
}

// 5. Potential duplicates
const dupes = checkPotentialDuplicates(notes);
if (dupes.length > 0) {
  console.log(`\x1b[33m[POTENTIAL DUPLICATES]\x1b[0m ${dupes.length} pair${dupes.length !== 1 ? 's' : ''} with similar addresses:`);
  for (const { a, b, similarity } of dupes) {
    console.log(`  "${a}" ↔ "${b}" (${similarity}% similar)`);
  }
  console.log('');
  issues += dupes.length;
} else {
  console.log(`\x1b[32m[POTENTIAL DUPLICATES]\x1b[0m No suspicious address pairs.\n`);
}

// 6. Segment collisions
const collisions = checkSegmentCollisions(notes);
if (collisions.length > 0) {
  const tierColor = { HIGH: '\x1b[31m', MED: '\x1b[33m', LOW: '\x1b[90m' };
  const tierPad   = { HIGH: 'HIGH', MED: 'MED ', LOW: 'LOW ' };
  console.log(`\x1b[33m[SEGMENT COLLISIONS]\x1b[0m ${collisions.length} potential ${collisions.length !== 1 ? 'ambiguities' : 'ambiguity'}:`);
  for (const col of collisions) {
    const tc = tierColor[col.tier];
    const tl = tierPad[col.tier];
    const locs = col.entries.map(e => {
      const role = e.isRoot ? 'root' : e.isLeaf ? 'leaf' : 'mid';
      return `${e.fullAddress} (${role})`;
    }).join(', ');
    console.log(`  ${tc}${tl}\x1b[0m  "${col.segment}": ${locs}`);
  }
  console.log('  \x1b[90mSuppress with distinct: ["other//address"] in frontmatter.\x1b[0m');
  console.log('');
  issues += collisions.length;
} else {
  console.log(`\x1b[32m[SEGMENT COLLISIONS]\x1b[0m No ambiguities found.\n`);
}

// Summary
console.log('---');
if (issues > 0) {
  console.log(`\x1b[33m${issues} issue${issues !== 1 ? 's' : ''} found.\x1b[0m Review and fix as needed.`);
} else {
  console.log(`\x1b[32mAll checks passed.\x1b[0m`);
}
console.log('');
