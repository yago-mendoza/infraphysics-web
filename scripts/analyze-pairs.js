#!/usr/bin/env node
// analyze-pairs.js — Relationship analyzer for fieldnote pairs
//
// Usage:
//   Pair mode:  node scripts/analyze-pairs.js "CPU" "RAM" "GPU" "CPU//core"
//               Analyzes consecutive pairs: CPU↔RAM, GPU↔CPU//core
//
//   All mode:   node scripts/analyze-pairs.js "CPU" --all
//               Lists every relationship for one address, grouped by type
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
};

const CHECK = `${C.green}✓${C.reset}`;
const CROSS = `${C.red}✗${C.reset}`;

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
    const { data: frontmatter, content: bodyMd } = matter(fileContent);

    const address = frontmatter.address;
    if (!address) continue;

    const uid = frontmatter.uid;
    if (!uid) continue;
    const id = uid;
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

    // Extract trailing refs with annotations (matches build-content.js:748-770)
    const bodyLines = bodyMd.split('\n');
    const trailingRefs = [];
    const singleRefAnnotated = /^\s*\[\[([^\]]+)\]\]\s*::\s*(.+)\s*$/;
    const multiRefLine = /^\s*(\[\[[^\]]+\]\]\s*)+$/;

    for (let i = bodyLines.length - 1; i >= 0; i--) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      const annotatedMatch = singleRefAnnotated.exec(line);
      if (annotatedMatch) {
        const raw = annotatedMatch[1];
        const pipeIdx = raw.indexOf('|');
        trailingRefs.push({
          address: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim(),
          annotation: annotatedMatch[2].trim(),
        });
      } else if (multiRefLine.test(line)) {
        const lineRefRegex = /\[\[([^\]]+)\]\]/g;
        let lineMatch;
        while ((lineMatch = lineRefRegex.exec(line)) !== null) {
          const raw = lineMatch[1];
          const pipeIdx = raw.indexOf('|');
          trailingRefs.push({
            address: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim(),
            annotation: null,
          });
        }
      } else {
        break;
      }
    }

    // Body-only refs = allRefs minus trailing refs
    const trailingAddrs = new Set(trailingRefs.map(r => r.address));
    const bodyOnlyRefs = allRefs.filter(r => !trailingAddrs.has(r));

    notes.push({
      filename,
      address,
      id,
      addressParts,
      allRefs,
      bodyOnlyRefs,
      trailingRefs,
      aliases: frontmatter.aliases || [],
    });
  }

  return notes;
}

// --- Address resolution ---

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

// --- Relationship analysis ---

function analyzeRelationship(noteA, noteB) {
  const result = { structural: [], trailing: [], body: [] };

  // --- Structural ---
  const addrA = noteA.address;
  const addrB = noteB.address;

  if (addrA.startsWith(addrB + '//')) {
    const depth = addrA.slice(addrB.length).split('//').length - 1;
    if (depth === 1) {
      result.structural.push(`${addrB} is the ${C.cyan}direct parent${C.reset} of ${addrA}`);
    } else {
      result.structural.push(`${addrB} is an ${C.cyan}ancestor${C.reset} of ${addrA} (${depth} levels up)`);
    }
  } else if (addrB.startsWith(addrA + '//')) {
    const depth = addrB.slice(addrA.length).split('//').length - 1;
    if (depth === 1) {
      result.structural.push(`${addrA} is the ${C.cyan}direct parent${C.reset} of ${addrB}`);
    } else {
      result.structural.push(`${addrA} is an ${C.cyan}ancestor${C.reset} of ${addrB} (${depth} levels up)`);
    }
  } else {
    // Check for siblings (shared parent)
    const partsA = noteA.addressParts;
    const partsB = noteB.addressParts;
    if (partsA.length > 1 && partsB.length > 1) {
      const parentA = partsA.slice(0, -1).join('//');
      const parentB = partsB.slice(0, -1).join('//');
      if (parentA === parentB) {
        result.structural.push(`${C.cyan}siblings${C.reset} under "${parentA}"`);
      }
    }
    // Both are root-level
    if (partsA.length === 1 && partsB.length === 1) {
      result.structural.push(`${C.dim}both are root-level notes${C.reset}`);
    }
  }

  // --- Trailing refs ---
  const aToB = noteA.trailingRefs.find(r => r.address === noteB.id);
  const bToA = noteB.trailingRefs.find(r => r.address === noteA.id);

  if (aToB) {
    const ann = aToB.annotation ? ` :: "${aToB.annotation}"` : '';
    result.trailing.push(`${addrA} → ${addrB}${ann}`);
  }
  if (bToA) {
    const ann = bToA.annotation ? ` :: "${bToA.annotation}"` : '';
    result.trailing.push(`${addrB} → ${addrA}${ann}`);
  }

  // --- Body mentions ---
  if (noteA.bodyOnlyRefs.includes(noteB.id)) {
    result.body.push(`${addrA} mentions ${addrB} in body text`);
  }
  if (noteB.bodyOnlyRefs.includes(noteA.id)) {
    result.body.push(`${addrB} mentions ${addrA} in body text`);
  }

  return result;
}

// --- Output formatting ---

function formatPairOutput(addrA, addrB, rel) {
  const headerLine = `${C.bold}═══ ${addrA} ↔ ${addrB} ═══${C.reset}`;
  const lines = ['\n' + headerLine, ''];

  // Structural
  if (rel.structural.length > 0) {
    for (const s of rel.structural) {
      lines.push(`  ${C.bold}STRUCTURAL${C.reset}    ${CHECK} ${s}`);
    }
  } else {
    lines.push(`  ${C.bold}STRUCTURAL${C.reset}    ${CROSS} no structural relationship`);
  }

  // Trailing
  if (rel.trailing.length > 0) {
    for (let i = 0; i < rel.trailing.length; i++) {
      const label = i === 0 ? `${C.bold}TRAILING${C.reset}      ` : '              ';
      lines.push(`  ${label}${CHECK} ${rel.trailing[i]}`);
    }
  } else {
    lines.push(`  ${C.bold}TRAILING${C.reset}      ${CROSS} no trailing refs between them`);
  }

  // Body
  if (rel.body.length > 0) {
    for (let i = 0; i < rel.body.length; i++) {
      const label = i === 0 ? `${C.bold}BODY${C.reset}          ` : '              ';
      lines.push(`  ${label}${CHECK} ${rel.body[i]}`);
    }
  } else {
    lines.push(`  ${C.bold}BODY${C.reset}          ${CROSS} no body mentions`);
  }

  console.log(lines.join('\n'));
}

function formatAllOutput(target, notes) {
  const structural = { parents: [], children: [], ancestors: [], descendants: [], siblings: [] };
  const trailingOut = [];  // target → other
  const trailingIn = [];   // other → target
  const bodyOut = [];       // target mentions other
  const bodyIn = [];        // other mentions target
  const unrelated = [];

  for (const note of notes) {
    if (note.address === target.address) continue;

    const rel = analyzeRelationship(target, note);
    const hasAny = rel.structural.length > 0 || rel.trailing.length > 0 || rel.body.length > 0;

    if (!hasAny) {
      unrelated.push(note.address);
      continue;
    }

    // Classify structural
    const addr = note.address;
    if (addr.startsWith(target.address + '//')) {
      const depth = addr.slice(target.address.length).split('//').length - 1;
      if (depth === 1) structural.children.push(addr);
      else structural.descendants.push(addr);
    } else if (target.address.startsWith(addr + '//')) {
      const depth = target.address.slice(addr.length).split('//').length - 1;
      if (depth === 1) structural.parents.push(addr);
      else structural.ancestors.push(addr);
    } else {
      const partsT = target.addressParts;
      const partsN = note.addressParts;
      if (partsT.length > 1 && partsN.length > 1) {
        const parentT = partsT.slice(0, -1).join('//');
        const parentN = partsN.slice(0, -1).join('//');
        if (parentT === parentN) structural.siblings.push(addr);
      }
    }

    // Classify trailing
    const tOut = target.trailingRefs.find(r => r.address === note.id);
    const tIn = note.trailingRefs.find(r => r.address === target.id);
    if (tOut) {
      trailingOut.push({ address: addr, annotation: tOut.annotation });
    }
    if (tIn) {
      trailingIn.push({ address: addr, annotation: tIn.annotation });
    }

    // Classify body
    if (target.bodyOnlyRefs.includes(note.id)) bodyOut.push(addr);
    if (note.bodyOnlyRefs.includes(target.id)) bodyIn.push(addr);
  }

  console.log(`\n${C.bold}═══ All relationships for "${target.address}" ═══${C.reset}\n`);

  // Structural
  const structEntries = [
    ['Parent', structural.parents],
    ['Children', structural.children],
    ['Ancestors', structural.ancestors],
    ['Descendants', structural.descendants],
    ['Siblings', structural.siblings],
  ];
  let hasStruct = false;
  for (const [label, items] of structEntries) {
    if (items.length > 0) {
      hasStruct = true;
      console.log(`  ${C.cyan}${label}${C.reset} (${items.length}):`);
      for (const item of items) console.log(`    ${item}`);
    }
  }
  if (!hasStruct) {
    console.log(`  ${C.dim}No structural relationships (root-level note with no children)${C.reset}`);
  }

  // Trailing out
  console.log('');
  if (trailingOut.length > 0) {
    console.log(`  ${C.green}Trailing refs out${C.reset} (${target.address} →) (${trailingOut.length}):`);
    for (const t of trailingOut) {
      const ann = t.annotation ? `${C.dim} :: ${t.annotation}${C.reset}` : '';
      console.log(`    ${t.address}${ann}`);
    }
  } else {
    console.log(`  ${C.dim}No trailing refs out${C.reset}`);
  }

  // Trailing in
  if (trailingIn.length > 0) {
    console.log(`  ${C.green}Trailing refs in${C.reset} (→ ${target.address}) (${trailingIn.length}):`);
    for (const t of trailingIn) {
      const ann = t.annotation ? `${C.dim} :: ${t.annotation}${C.reset}` : '';
      console.log(`    ${t.address}${ann}`);
    }
  } else {
    console.log(`  ${C.dim}No trailing refs in${C.reset}`);
  }

  // Body
  console.log('');
  if (bodyOut.length > 0) {
    console.log(`  ${C.magenta}Mentions in body${C.reset} (${target.address} mentions) (${bodyOut.length}):`);
    for (const b of bodyOut) console.log(`    ${b}`);
  }
  if (bodyIn.length > 0) {
    console.log(`  ${C.magenta}Mentioned by${C.reset} (others mention ${target.address}) (${bodyIn.length}):`);
    for (const b of bodyIn) console.log(`    ${b}`);
  }
  if (bodyOut.length === 0 && bodyIn.length === 0) {
    console.log(`  ${C.dim}No body mentions${C.reset}`);
  }

  // Summary
  const connected = notes.length - 1 - unrelated.length;
  console.log(`\n  ${C.dim}${connected} connected / ${unrelated.length} unrelated out of ${notes.length - 1} total notes${C.reset}\n`);
}

// --- Usage ---

function printUsage() {
  console.log(`
${C.bold}analyze-pairs.js${C.reset} — Relationship analyzer for fieldnote pairs

${C.bold}Usage:${C.reset}
  ${C.cyan}Pair mode${C.reset}   node scripts/analyze-pairs.js "addr1" "addr2" ["addr3" ...]
              Analyzes consecutive pairs: addr1↔addr2, addr3↔addr4, ...

  ${C.cyan}All mode${C.reset}    node scripts/analyze-pairs.js "addr" --all
              Lists every relationship for one address, grouped by type

${C.bold}Address resolution:${C.reset}
  exact → case-insensitive → alias → last-segment (warns on ambiguous)

${C.bold}Relationship types:${C.reset}
  STRUCTURAL   parent→child, ancestor→descendant, siblings, root peers
  TRAILING     trailing [[refs]] with optional :: annotations
  BODY         [[mentions]] in body text (not trailing section)
`);
}

// --- Main ---

const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  process.exit(0);
}

const notes = parseAllFieldnotes();
console.log(`${C.dim}Scanned ${notes.length} fieldnotes.${C.reset}`);

// Detect mode
const allFlagIdx = args.indexOf('--all');

if (allFlagIdx !== -1) {
  // --all mode: expect exactly one address
  const addrArgs = args.filter((_, i) => i !== allFlagIdx);
  if (addrArgs.length !== 1) {
    console.error(`${C.red}ERROR${C.reset} --all mode requires exactly one address. Got ${addrArgs.length}.`);
    process.exit(1);
  }

  const target = resolveAddress(addrArgs[0], notes);
  if (!target) process.exit(1);

  formatAllOutput(target, notes);
} else {
  // Pair mode: need at least 2 addresses, pairs are consecutive
  if (args.length < 2) {
    console.error(`${C.red}ERROR${C.reset} Pair mode requires at least 2 addresses.`);
    printUsage();
    process.exit(1);
  }

  if (args.length % 2 !== 0) {
    console.error(`${C.yellow}WARNING${C.reset} Odd number of addresses — last one ("${args[args.length - 1]}") has no pair.`);
  }

  for (let i = 0; i + 1 < args.length; i += 2) {
    const noteA = resolveAddress(args[i], notes);
    const noteB = resolveAddress(args[i + 1], notes);

    if (!noteA || !noteB) {
      console.error(`${C.dim}Skipping pair "${args[i]}" ↔ "${args[i + 1]}"${C.reset}\n`);
      continue;
    }

    const rel = analyzeRelationship(noteA, noteB);
    formatPairOutput(noteA.address, noteB.address, rel);
  }

  console.log('');
}
