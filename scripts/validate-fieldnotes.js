// Validation for content integrity — runs at build time
// Checks reference integrity, structural consistency, and address ambiguity.
//
// 7 phases:
//   1. Reference integrity    (ERROR — fails build)
//   2. Self-references        (WARN)
//   3. Bare trailing refs     (ERROR — fails build)
//   4. Parent hierarchy       (WARN)
//   5. Circular references    (WARN)
//   6. Segment collisions     (HIGH / MED / LOW)
//   7. Orphan notes           (INFO)
//
// Returns { errors, warnings, infos, issues } where issues[] is a structured
// array used by resolve-issues.js for interactive fixing.

/**
 * Validates fieldnotes and content integrity.
 * @param {Array} fieldnotePosts - Parsed fieldnote Post objects
 * @param {Array} allPosts - All posts (regular + fieldnotes) with processed HTML
 * @param {Object} cfg - Validation flags from compiler config
 */
export function validateFieldnotes(fieldnotePosts, allPosts, cfg) {
  // ANSI color codes
  const R = '\x1b[31m';   // red (errors)
  const G = '\x1b[32m';   // green
  const Y = '\x1b[33m';   // yellow (warnings)
  const C = '\x1b[36m';   // cyan (info)
  const D = '\x1b[90m';   // dim
  const B = '\x1b[1m';    // bold
  const X = '\x1b[0m';    // reset

  console.log(`\n${B}[VALIDATE]${X} ${D}scripts/validate-fieldnotes.js${X}`);

  let errors = 0;
  let warnings = 0;
  let infos = 0;
  const issues = [];

  const knownUids = new Set(fieldnotePosts.map(p => p.id));
  const knownAddresses = new Set(fieldnotePosts.map(p => p.address));

  // ── Phase 1: Reference integrity (ERROR) ────────────────────────

  if (cfg.validateFieldnoteRefs) {
    for (const post of fieldnotePosts) {
      // Inline [[refs]] must resolve (refs are now UIDs)
      for (const ref of (post.references || [])) {
        if (!knownUids.has(ref)) {
          console.log(`  ${R}ERROR${X}  [BROKEN_REF] [[${ref}]] in "${post.address}" → no block`);
          issues.push({ code: 'BROKEN_REF', severity: 'ERROR', promptable: false, address: post.address, ref });
          errors++;
        }
      }
      // Trailing refs must resolve (uid field)
      for (const ref of (post.trailingRefs || [])) {
        const uid = typeof ref === 'object' ? ref.uid : ref;
        if (!knownUids.has(uid)) {
          console.log(`  ${R}ERROR${X}  [BROKEN_REF] trailing [[${uid}]] in "${post.address}" → no block`);
          issues.push({ code: 'BROKEN_REF', severity: 'ERROR', promptable: false, address: post.address, ref: uid, trailing: true });
          errors++;
        }
      }
    }
  }

  if (cfg.validateRegularPostWikiLinks) {
    const regularPosts = allPosts.filter(p => p.category !== 'fieldnotes');
    const uidRegex = /data-uid="([^"]+)"/g;
    for (const post of regularPosts) {
      let match;
      while ((match = uidRegex.exec(post.content)) !== null) {
        if (!knownUids.has(match[1])) {
          console.log(`  ${R}ERROR${X}  [BROKEN_WIKILINK] [[${match[1]}]] in post "${post.id}" → no fieldnote`);
          issues.push({ code: 'BROKEN_WIKILINK', severity: 'ERROR', promptable: false, postId: post.id, ref: match[1] });
          errors++;
        }
      }
    }
  }

  // ── Phase 2: Self-references (WARN) ─────────────────────────────

  for (const post of fieldnotePosts) {
    for (const ref of (post.trailingRefs || [])) {
      const uid = typeof ref === 'object' ? ref.uid : ref;
      if (uid === post.id) {
        console.log(`  ${Y}WARN ${X}  [SELF_REF] "${post.address}" trails a ref to itself`);
        issues.push({ code: 'SELF_REF', severity: 'WARN', promptable: false, address: post.address });
        warnings++;
      }
    }
  }

  // ── Phase 3: Bare trailing refs (ERROR) ─────────────────────────
  // Every trailing ref MUST have a :: annotation. Bare refs are prohibited.

  for (const post of fieldnotePosts) {
    for (const ref of (post.trailingRefs || [])) {
      const annotation = typeof ref === 'object' ? ref.annotation : null;
      if (!annotation || annotation.trim() === '') {
        const uid = typeof ref === 'object' ? ref.uid : ref;
        console.log(`  ${R}ERROR${X}  [BARE_TRAILING_REF] "${post.address}" has trailing ref [[${uid}]] without :: annotation`);
        issues.push({ code: 'BARE_TRAILING_REF', severity: 'ERROR', promptable: false, address: post.address, ref: uid });
        errors++;
      }
    }
  }

  // ── Phase 4: Parent hierarchy (WARN) ─────────────────────────────
  // Checks full parent paths (CPU//mutex, not just "mutex").
  // Deduplicated: each missing parent warned once with child count.

  if (cfg.validateParentSegments) {
    const missingParents = new Map(); // parentAddr → [childAddr, ...]

    for (const post of fieldnotePosts) {
      const parts = post.addressParts || [];
      if (parts.length <= 1) continue;

      for (let i = 1; i < parts.length; i++) {
        const parentAddr = parts.slice(0, i).join('//');
        if (!knownAddresses.has(parentAddr)) {
          if (!missingParents.has(parentAddr)) missingParents.set(parentAddr, []);
          missingParents.get(parentAddr).push(post.address);
        }
      }
    }

    for (const [parent, children] of missingParents) {
      const extra = children.length > 1 ? ` +${children.length - 1} more` : '';
      console.log(`  ${Y}WARN ${X}  [MISSING_PARENT] "${parent}" has no block ${D}(parent of ${children[0]}${extra})${X}`);
      issues.push({ code: 'MISSING_PARENT', severity: 'WARN', promptable: true, parent, children });
      warnings++;
    }
  }

  // ── Phase 5: Circular references (WARN) ─────────────────────────
  // DFS cycle detection. Deduplicated: each unique node-set reported once.
  // Off by default — knowledge graphs naturally have many reference cycles.

  if (cfg.detectCircularRefs) {
    const adj = new Map();
    for (const post of fieldnotePosts) {
      adj.set(post.address, (post.references || []).filter(r => knownAddresses.has(r) && r !== post.address));
    }

    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map();
    for (const addr of knownAddresses) color.set(addr, WHITE);

    const seen = new Set();  // deduplicate by sorted node-set
    const cycles = [];
    const stack = [];

    function dfs(node) {
      color.set(node, GRAY);
      stack.push(node);
      for (const nb of (adj.get(node) || [])) {
        if (color.get(nb) === GRAY) {
          const start = stack.indexOf(nb);
          const nodes = stack.slice(start);
          const key = [...nodes].sort().join('\0');
          if (!seen.has(key)) {
            seen.add(key);
            cycles.push([...nodes, nb]);
          }
        } else if (color.get(nb) === WHITE) {
          dfs(nb);
        }
      }
      stack.pop();
      color.set(node, BLACK);
    }

    for (const addr of knownAddresses) {
      if (color.get(addr) === WHITE) dfs(addr);
    }

    for (const cycle of cycles) {
      console.log(`  ${Y}WARN ${X}  [CIRCULAR_REF] circular ref: ${cycle.join(' → ')}`);
      issues.push({ code: 'CIRCULAR_REF', severity: 'WARN', promptable: false, cycle });
      warnings++;
    }
  }

  // ── Phase 6: Segment collisions (HIGH / MED / LOW) ──────────────
  // Detects shared segment names across different address hierarchies.
  // Also checks alias collisions and supports `distinct` suppression.

  if (cfg.detectSegmentCollisions !== false) {
    const exclusions = new Set(
      (cfg.segmentCollisionExclusions || [
        'overview', 'intro', 'basics', 'summary', 'notes',
        'example', 'examples', 'reference', 'references',
        'config', 'configuration', 'settings', 'setup',
        'types', 'glossary', 'faq', 'history',
      ]).map(s => s.toLowerCase())
    );

    // Suppression pairs from `distinct` frontmatter (bilateral)
    const suppressed = new Set();
    for (const post of fieldnotePosts) {
      for (const other of (post.distinct || [])) {
        suppressed.add([post.address, other].sort().join('\0'));
      }
    }

    // Superseded addresses excluded from analysis
    const superseded = new Set(
      fieldnotePosts.filter(p => p.supersedes).map(p => p.supersedes)
    );

    // Build segment registry: lowercased name → [entries]
    const registry = new Map();

    for (const post of fieldnotePosts) {
      if (superseded.has(post.address)) continue;
      const parts = post.addressParts || post.address.split('//').map(s => s.trim());

      // Non-root segments
      for (let i = 1; i < parts.length; i++) {
        const key = parts[i].toLowerCase();
        if (exclusions.has(key)) continue;
        if (!registry.has(key)) registry.set(key, []);
        registry.get(key).push({
          fullAddress: post.address,
          parentPath: parts.slice(0, i).join('//'),
          isLeaf: i === parts.length - 1,
          isRoot: false,
        });
      }

      // Root addresses (for root-vs-nonroot cross-check)
      if (parts.length === 1) {
        const key = parts[0].toLowerCase();
        if (!exclusions.has(key)) {
          if (!registry.has(key)) registry.set(key, []);
          registry.get(key).push({
            fullAddress: post.address,
            parentPath: null,
            isLeaf: true,
            isRoot: true,
          });
        }
      }
    }

    // Alias registry: lowercased alias → [{ fullAddress, alias }]
    const aliasMap = new Map();
    for (const post of fieldnotePosts) {
      if (superseded.has(post.address)) continue;
      for (const alias of (post.aliases || [])) {
        const key = alias.toLowerCase();
        if (!aliasMap.has(key)) aliasMap.set(key, []);
        aliasMap.get(key).push({ fullAddress: post.address, alias });
      }
    }

    const collisions = [];

    // --- Segment-vs-segment ---
    for (const [segName, entries] of registry) {
      if (entries.length < 2) continue;

      // Need different parent paths
      const parentSet = new Set(entries.map(e => (e.parentPath || '__root__').toLowerCase()));
      if (parentSet.size < 2) continue;

      // Remove hierarchical children (keep top-most representative per tree)
      const addrs = entries.map(e => e.fullAddress);
      const filtered = entries.filter(e =>
        !addrs.some(a => a !== e.fullAddress &&
          e.fullAddress.startsWith(a + '//'))
      );

      const filteredParents = new Set(filtered.map(e => (e.parentPath || '__root__').toLowerCase()));
      if (filteredParents.size < 2) continue;

      // Remove suppressed pairs
      const unsuppressed = filtered.filter(e =>
        filtered.some(o =>
          o.fullAddress !== e.fullAddress &&
          !suppressed.has([e.fullAddress, o.fullAddress].sort().join('\0'))
        )
      );

      const unsuppParents = new Set(unsuppressed.map(e => (e.parentPath || '__root__').toLowerCase()));
      if (unsuppParents.size < 2) continue;

      // Classify tier
      const leafCount = unsuppressed.filter(e => e.isLeaf).length;
      const rootCount = unsuppressed.filter(e => e.isRoot).length;
      let tier = 'LOW';
      if (leafCount >= 2) tier = 'HIGH';
      else if (rootCount >= 1 || leafCount === 1) tier = 'MED';

      collisions.push({ segment: segName, entries: unsuppressed, tier, type: 'segment' });
    }

    // --- Segment-vs-alias ---
    for (const [segName, segEntries] of registry) {
      if (!aliasMap.has(segName)) continue;
      const segAddrs = new Set(segEntries.map(e => e.fullAddress));
      for (const aliasEntry of aliasMap.get(segName)) {
        if (!segAddrs.has(aliasEntry.fullAddress)) {
          collisions.push({
            segment: segName, type: 'alias', tier: 'HIGH',
            segEntries, aliasEntry,
          });
        }
      }
    }

    // --- Alias-vs-alias ---
    for (const [aliasName, aliasEntries] of aliasMap) {
      if (aliasEntries.length < 2) continue;
      collisions.push({
        segment: aliasName, type: 'alias-alias', tier: 'HIGH',
        entries: aliasEntries,
      });
    }

    // Sort: HIGH first, then MED, then LOW
    const tierOrder = { HIGH: 0, MED: 1, LOW: 2 };
    collisions.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

    if (collisions.length > 0) {
      const tierColor = { HIGH: R, MED: Y, LOW: D };
      const tierPad  = { HIGH: 'HIGH', MED: 'MED ', LOW: 'LOW ' };

      for (const col of collisions) {
        const tc = tierColor[col.tier];
        const tl = tierPad[col.tier];
        const codeTag = col.type === 'segment' ? 'SEGMENT_COLLISION'
          : col.type === 'alias' ? 'ALIAS_COLLISION'
          : 'ALIAS_ALIAS_COLLISION';

        if (col.type === 'segment') {
          const locs = col.entries.map(e => {
            const role = e.isRoot ? 'root' : e.isLeaf ? 'leaf' : 'mid';
            return `${e.fullAddress} (${role})`;
          }).join(', ');
          console.log(`  ${tc}${tl}${X}  [${codeTag}] segment "${col.segment}" exists at: ${locs}`);
          console.log(`  ${D}       → same concept? add distinct: ["..."] to suppress${X}`);
          issues.push({
            code: codeTag, severity: col.tier, promptable: true,
            segment: col.segment, entries: col.entries.map(e => ({ fullAddress: e.fullAddress, isLeaf: e.isLeaf, isRoot: e.isRoot })),
          });
        } else if (col.type === 'alias') {
          const segLocs = col.segEntries.map(e => e.fullAddress).join(', ');
          console.log(`  ${tc}${tl}${X}  [${codeTag}] "${col.segment}" is segment in [${segLocs}] and alias on "${col.aliasEntry.fullAddress}"`);
          issues.push({
            code: codeTag, severity: col.tier, promptable: true,
            segment: col.segment, segAddresses: col.segEntries.map(e => e.fullAddress), aliasAddress: col.aliasEntry.fullAddress,
          });
        } else if (col.type === 'alias-alias') {
          const locs = col.entries.map(e => e.fullAddress).join(', ');
          console.log(`  ${tc}${tl}${X}  [${codeTag}] alias "${col.segment}" shared by: ${locs}`);
          issues.push({
            code: codeTag, severity: col.tier, promptable: true,
            segment: col.segment, addresses: col.entries.map(e => e.fullAddress),
          });
        }

        warnings++;
      }
    }

    // Stale distinct references
    for (const post of fieldnotePosts) {
      for (const addr of (post.distinct || [])) {
        if (!knownAddresses.has(addr)) {
          console.log(`  ${Y}WARN ${X}  [STALE_DISTINCT] stale distinct: "${addr}" in "${post.address}" → no block`);
          issues.push({ code: 'STALE_DISTINCT', severity: 'WARN', promptable: false, address: post.address, staleRef: addr });
          warnings++;
        }
      }
    }
  }

  // ── Phase 7: Orphan notes (INFO) ────────────────────────────────
  // Notes with no incoming or outgoing references.

  if (cfg.detectOrphans !== false) {
    const referenced = new Set();
    for (const post of fieldnotePosts) {
      for (const ref of (post.references || [])) referenced.add(ref);
    }

    for (const post of fieldnotePosts) {
      const hasOut = (post.references || []).length > 0;
      const hasIn = referenced.has(post.id);
      if (!hasOut && !hasIn) {
        console.log(`  ${C}INFO ${X}  [ORPHAN_NOTE] "${post.address}" has no connections (orphan)`);
        issues.push({ code: 'ORPHAN_NOTE', severity: 'INFO', promptable: false, address: post.address });
        infos++;
      }
    }
  }

  // ── Legend ─────────────────────────────────────────────────────

  if (issues.length > 0) {
    const codes = new Set(issues.map(i => i.code));
    const legend = {
      BROKEN_REF: 'inline [[ref]] to nonexistent fieldnote',
      BROKEN_WIKILINK: '[[wiki-link]] in post to nonexistent fieldnote',
      SELF_REF: 'note trails a ref to itself',
      BARE_TRAILING_REF: 'trailing ref without :: annotation (must explain why)',
      MISSING_PARENT: 'parent address has no dedicated note',
      CIRCULAR_REF: 'cycle in reference graph',
      SEGMENT_COLLISION: 'same segment name at different hierarchy paths',
      ALIAS_COLLISION: 'alias collides with a segment name',
      ALIAS_ALIAS_COLLISION: 'same alias on multiple notes',
      STALE_DISTINCT: 'distinct entry points to deleted note',
      ORPHAN_NOTE: 'no incoming or outgoing references',
    };
    console.log(`\n  ${D}Legend:${X}`);
    for (const code of codes) {
      if (legend[code]) console.log(`  ${D}  ${code} — ${legend[code]}${X}`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────

  const parts = [];
  if (errors > 0) parts.push(`${R}${errors} error${errors !== 1 ? 's' : ''}${X}`);
  if (warnings > 0) parts.push(`${Y}${warnings} warning${warnings !== 1 ? 's' : ''}${X}`);
  if (infos > 0) parts.push(`${C}${infos} info${X}`);
  if (parts.length === 0) parts.push('\x1b[32mall clear\x1b[0m');

  console.log(`${B}[VALIDATE]${X} ${parts.join(', ')}`);

  const promptableCount = issues.filter(i => i.promptable).length;
  if (promptableCount > 0) {
    const M = '\x1b[35m';  // magenta
    console.log('');
    console.log(`  ${M}${B}╭─────────────────────────────────────────────────╮${X}`);
    console.log(`  ${M}${B}│${X}  ${B}${promptableCount} issue${promptableCount !== 1 ? 's' : ''} can be fixed interactively${X}            ${M}${B}│${X}`);
    console.log(`  ${M}${B}│${X}  Run: ${G}npm run content:fix${X}                       ${M}${B}│${X}`);
    console.log(`  ${M}${B}╰─────────────────────────────────────────────────╯${X}`);
  }
  console.log('');

  return { errors, warnings, infos, issues };
}
