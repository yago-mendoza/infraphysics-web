#!/usr/bin/env node
// preflight.js — Pre-creation briefing for fieldnote authoring
//
// Usage:
//   Briefing:    node scripts/preflight.js "MCU" "NPU" "sensor"
//                Dumps content, trailing refs, bilateral status, and interaction candidates
//                for each resolved note. Also shows cross-ref status between all pairs.
//
//   New check:   node scripts/preflight.js --new "robotics//servo" "robotics//PID"
//                Collision check for proposed new addresses against existing notes.
//
//   Mixed:       node scripts/preflight.js "MCU" "sensor" --new "sensor//lidar"
//                Brief existing notes + collision check for new ones.
//
// Address resolution: exact → case-insensitive → alias → last-segment (warns on ambiguous)

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');

// --- ANSI helpers ---

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[90m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

// --- Interaction patterns ---

const INTERACTION_PATTERNS = [
  /\bcontrast\s+with\b/i,
  /\bvs\.?\s/i,
  /\bunlike\b/i,
  /\bwhereas\b/i,
  /\bin contrast\b/i,
  /\bon the other hand\b/i,
  /\bopposite of\b/i,
  /\bdiffers? from\b/i,
  /\brather than\b/i,
];

// --- Parse all fieldnotes ---

function parseAllFieldnotes() {
  if (!fs.existsSync(FIELDNOTES_DIR)) {
    console.error('Fieldnotes directory not found:', FIELDNOTES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(FIELDNOTES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');

  const notes = [];

  for (const filename of files) {
    const filePath = path.join(FIELDNOTES_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: fm, content: bodyMd } = matter(fileContent);

    const address = fm.address;
    if (!address) continue;
    const uid = fm.uid;
    if (!uid) continue;

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

    // Extract trailing refs with annotations
    const bodyLines = bodyMd.split('\n');
    const trailingRefs = [];
    const singleRefAnnotated = /^\s*\[\[([^\]]+)\]\]\s*::\s*(.+)\s*$/;
    const multiRefLine = /^\s*(\[\[[^\]]+\]\]\s*)+$/;
    let trailingSeparatorIdx = -1;

    for (let i = bodyLines.length - 1; i >= 0; i--) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      if (line === '---') { trailingSeparatorIdx = i; break; }
      const annotatedMatch = singleRefAnnotated.exec(line);
      if (annotatedMatch) {
        const raw = annotatedMatch[1];
        const pipeIdx = raw.indexOf('|');
        trailingRefs.push({
          uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim(),
          annotation: annotatedMatch[2].trim(),
        });
      } else if (multiRefLine.test(line)) {
        const lineRefRegex = /\[\[([^\]]+)\]\]/g;
        let lineMatch;
        while ((lineMatch = lineRefRegex.exec(line)) !== null) {
          const raw = lineMatch[1];
          const pipeIdx = raw.indexOf('|');
          trailingRefs.push({
            uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim(),
            annotation: null,
          });
        }
      } else {
        break;
      }
    }

    // Body content (excluding trailing section)
    const bodyContent = trailingSeparatorIdx >= 0
      ? bodyLines.slice(0, trailingSeparatorIdx).join('\n').trim()
      : bodyMd.trim();

    // Body-only refs
    const trailingUids = new Set(trailingRefs.map(r => r.uid));
    const bodyOnlyRefs = allRefs.filter(r => !trailingUids.has(r));

    notes.push({
      filename,
      address,
      uid,
      name: fm.name || address,
      addressParts,
      allRefs,
      bodyOnlyRefs,
      trailingRefs,
      bodyContent,
      bodyLines,
      aliases: fm.aliases || [],
      distinct: fm.distinct || [],
    });
  }

  return notes;
}

// --- Address resolution (fuzzy) ---

function resolveAddress(query, notes) {
  // 1. Exact match
  const exact = notes.find(n => n.address === query);
  if (exact) return exact;

  // 2. Case-insensitive
  const lower = query.toLowerCase();
  const ciMatches = notes.filter(n => n.address.toLowerCase() === lower);
  if (ciMatches.length === 1) return ciMatches[0];
  if (ciMatches.length > 1) {
    console.error(`${C.yellow}AMBIGUOUS${C.reset} "${query}" matches ${ciMatches.length} addresses (case-insensitive):`);
    for (const n of ciMatches) console.error(`  ${n.address}`);
    return null;
  }

  // 3. Alias match
  const aliasMatches = notes.filter(n =>
    n.aliases.some(a => a.toLowerCase() === lower)
  );
  if (aliasMatches.length === 1) return aliasMatches[0];
  if (aliasMatches.length > 1) {
    console.error(`${C.yellow}AMBIGUOUS${C.reset} "${query}" matches ${aliasMatches.length} aliases:`);
    for (const n of aliasMatches) console.error(`  ${n.address} (alias: ${n.aliases.join(', ')})`);
    return null;
  }

  // 4. Last-segment match
  const segMatches = notes.filter(n => {
    const lastSeg = n.addressParts[n.addressParts.length - 1];
    return lastSeg.toLowerCase() === lower;
  });
  if (segMatches.length === 1) return segMatches[0];
  if (segMatches.length > 1) {
    console.error(`${C.yellow}AMBIGUOUS${C.reset} "${query}" matches ${segMatches.length} last segments:`);
    for (const n of segMatches) console.error(`  ${n.address}`);
    return null;
  }

  console.error(`${C.red}NOT FOUND${C.reset} "${query}" — no fieldnote matches this address, alias, or segment.`);
  return null;
}

// --- Briefing for a single note ---

function briefNote(note, notes, noteByUid) {
  const lines = [];
  lines.push(`\n${C.bold}${C.cyan}━━━ ${note.address} ━━━${C.reset}  ${C.dim}(${note.uid})${C.reset}`);

  // Body content
  lines.push(`${C.dim}── body ──${C.reset}`);
  const bodyTrimmed = note.bodyContent || '(empty)';
  lines.push(bodyTrimmed);

  // Trailing refs
  if (note.trailingRefs.length > 0) {
    lines.push(`\n${C.dim}── trailing refs ──${C.reset}`);
    for (const tr of note.trailingRefs) {
      const target = noteByUid.get(tr.uid);
      const targetAddr = target ? target.address : `[${tr.uid}]`;
      const ann = tr.annotation ? ` :: ${tr.annotation}` : '';

      // Check if target has a trailing ref back (duplicate check)
      let biStatus = '';
      if (target) {
        const hasBack = target.trailingRefs.some(r => r.uid === note.uid);
        if (hasBack) {
          biStatus = `  ${C.yellow}⚠ BILATERAL (target also trail-refs back — one side is redundant)${C.reset}`;
        }
      }
      lines.push(`  ${C.green}⟶${C.reset} ${targetAddr}${ann}${biStatus}`);
    }

    // Incoming trailing refs (other notes that trail-ref this one)
    const incoming = notes.filter(n =>
      n.uid !== note.uid && n.trailingRefs.some(r => r.uid === note.uid)
    );
    if (incoming.length > 0) {
      lines.push(`${C.dim}  incoming:${C.reset}`);
      for (const inc of incoming) {
        const tr = inc.trailingRefs.find(r => r.uid === note.uid);
        const ann = tr.annotation ? ` :: ${tr.annotation}` : '';
        lines.push(`  ${C.blue}⟵${C.reset} ${inc.address}${ann}`);
      }
    }
  } else {
    // Still show incoming even if no outgoing
    const incoming = notes.filter(n =>
      n.uid !== note.uid && n.trailingRefs.some(r => r.uid === note.uid)
    );
    if (incoming.length > 0) {
      lines.push(`\n${C.dim}── trailing refs (incoming only) ──${C.reset}`);
      for (const inc of incoming) {
        const tr = inc.trailingRefs.find(r => r.uid === note.uid);
        const ann = tr.annotation ? ` :: ${tr.annotation}` : '';
        lines.push(`  ${C.blue}⟵${C.reset} ${inc.address}${ann}`);
      }
    }
  }

  // Interaction candidates (body lines matching contrast patterns)
  const candidates = [];
  for (const line of note.bodyLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '---') continue;
    for (const pat of INTERACTION_PATTERNS) {
      if (pat.test(trimmed)) {
        candidates.push(trimmed);
        break;
      }
    }
  }
  if (candidates.length > 0) {
    lines.push(`\n${C.yellow}── interaction candidates (body text with contrast language) ──${C.reset}`);
    for (const c of candidates) {
      lines.push(`  ${C.yellow}!${C.reset} ${c}`);
    }
  }

  console.log(lines.join('\n'));
}

// --- Cross-ref matrix between resolved notes ---

function showCrossRefs(resolved, noteByUid) {
  if (resolved.length < 2) return;

  const lines = [];
  lines.push(`\n${C.bold}${C.magenta}━━━ Cross-refs between queried notes ━━━${C.reset}`);

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i];
      const b = resolved[j];

      const aToB = a.trailingRefs.find(r => r.uid === b.uid);
      const bToA = b.trailingRefs.find(r => r.uid === a.uid);
      const aMentionsB = a.bodyOnlyRefs.includes(b.uid);
      const bMentionsA = b.bodyOnlyRefs.includes(a.uid);

      const parts = [];
      if (aToB) {
        const ann = aToB.annotation ? ` :: ${aToB.annotation}` : '';
        parts.push(`${C.green}trail${C.reset} ${a.address} ⟶ ${b.address}${ann}`);
      }
      if (bToA) {
        const ann = bToA.annotation ? ` :: ${bToA.annotation}` : '';
        parts.push(`${C.green}trail${C.reset} ${b.address} ⟶ ${a.address}${ann}`);
      }
      if (aToB && bToA) {
        parts.push(`${C.yellow}⚠ BILATERAL — one side is redundant${C.reset}`);
      }
      if (aMentionsB) parts.push(`${C.dim}mention${C.reset} ${a.address} mentions ${b.address}`);
      if (bMentionsA) parts.push(`${C.dim}mention${C.reset} ${b.address} mentions ${a.address}`);

      if (parts.length === 0) {
        parts.push(`${C.dim}no refs between ${a.address} ↔ ${b.address}${C.reset}`);
      }

      for (const p of parts) lines.push(`  ${p}`);
    }
  }

  console.log(lines.join('\n'));
}

// --- Collision check for new addresses ---

function checkNewAddresses(newAddrs, notes) {
  if (newAddrs.length === 0) return;

  const lines = [];
  lines.push(`\n${C.bold}${C.blue}━━━ Collision check for new addresses ━━━${C.reset}`);

  for (const addr of newAddrs) {
    const parts = addr.split('//').map(s => s.trim());
    const lastSeg = parts[parts.length - 1].toLowerCase();

    lines.push(`\n  ${C.bold}${addr}${C.reset}`);

    // Exact match
    const exact = notes.find(n => n.address.toLowerCase() === addr.toLowerCase());
    if (exact) {
      lines.push(`    ${C.red}EXACT MATCH${C.reset} — "${exact.address}" already exists (${exact.uid})`);
      continue;
    }

    // Last-segment collision
    const segMatches = notes.filter(n => {
      const nLastSeg = n.addressParts[n.addressParts.length - 1].toLowerCase();
      return nLastSeg === lastSeg;
    });
    if (segMatches.length > 0) {
      lines.push(`    ${C.yellow}SEGMENT COLLISION${C.reset} — "${lastSeg}" also appears in:`);
      for (const m of segMatches) {
        lines.push(`      ${m.address} (${m.uid})`);
      }
      lines.push(`    ${C.dim}If same concept ⟶ enrich existing. If different ⟶ add distinct.${C.reset}`);
    } else {
      lines.push(`    ${C.green}CLEAR${C.reset} — no collisions`);
    }

    // Check parent exists
    if (parts.length > 1) {
      const parentAddr = parts.slice(0, -1).join('//');
      const parentExists = notes.some(n => n.address.toLowerCase() === parentAddr.toLowerCase());
      if (!parentExists) {
        lines.push(`    ${C.yellow}MISSING PARENT${C.reset} — "${parentAddr}" has no note (will need stub)`);
      }
    }
  }

  console.log(lines.join('\n'));
}

// --- Usage ---

function printUsage() {
  console.log(`
${C.bold}preflight.js${C.reset} — Pre-creation briefing for fieldnote authoring

${C.bold}Usage:${C.reset}
  ${C.cyan}Brief${C.reset}    node scripts/preflight.js "MCU" "NPU" "sensor"
            Dumps content, trailing refs, bilateral status, interaction
            candidates, and cross-ref matrix for each resolved note.

  ${C.cyan}New${C.reset}      node scripts/preflight.js --new "robotics//servo" "robotics//PID"
            Collision check for proposed new addresses.

  ${C.cyan}Mixed${C.reset}    node scripts/preflight.js "MCU" "sensor" --new "sensor//lidar"
            Brief existing + collision check for new.

${C.bold}Address resolution:${C.reset}
  exact ⟶ case-insensitive ⟶ alias ⟶ last-segment (warns on ambiguous)

${C.bold}Sections:${C.reset}
  ${C.dim}body${C.reset}                 Full note content
  ${C.dim}trailing refs${C.reset}        Outgoing and incoming, with bilateral warnings
  ${C.dim}interaction candidates${C.reset} Body lines with contrast language (vs, unlike, ...)
  ${C.dim}cross-refs${C.reset}           Ref status between all queried notes
  ${C.dim}collision check${C.reset}      Exact, segment, and parent checks for --new addresses
`);
}

// --- Main ---

const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  process.exit(0);
}

// Split args into existing queries and --new addresses
const existingQueries = [];
const newAddresses = [];
let inNew = false;

for (const arg of args) {
  if (arg === '--new') {
    inNew = true;
    continue;
  }
  if (arg.startsWith('--')) {
    inNew = false;
    continue;
  }
  if (inNew) {
    newAddresses.push(arg);
  } else {
    existingQueries.push(arg);
  }
}

const notes = parseAllFieldnotes();
const noteByUid = new Map(notes.map(n => [n.uid, n]));
console.log(`${C.dim}Scanned ${notes.length} fieldnotes.${C.reset}`);

// Brief existing notes
const resolved = [];
for (const query of existingQueries) {
  const note = resolveAddress(query, notes);
  if (note) {
    resolved.push(note);
    briefNote(note, notes, noteByUid);
  }
}

// Cross-ref matrix
showCrossRefs(resolved, noteByUid);

// Collision check for new addresses
checkNewAddresses(newAddresses, notes);

console.log('');
