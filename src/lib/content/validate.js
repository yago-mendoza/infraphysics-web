// Fieldnotes validation — browser-safe (no ANSI codes when running in browser)
// 7-phase validation: reference integrity, self-refs, bare trailing refs,
// parent hierarchy, circular refs, segment collisions, isolated notes.
//
// Returns { errors, warnings, infos, issues } for both build-time and editor use.

import { checkSegmentCollisions } from './address.js';

/**
 * @typedef {Object} ValidationResult
 * @property {number} errors
 * @property {number} warnings
 * @property {number} infos
 * @property {Array} issues - structured issue array for interactive fixing
 */

/**
 * Check reference integrity — inline [[refs]] and trailing refs resolve to known UIDs.
 * @param {Array} fieldnotePosts
 * @param {Set<string>} knownUids
 * @returns {{ errors: number, issues: Array }}
 */
export function checkReferenceIntegrity(fieldnotePosts, knownUids) {
  let errors = 0;
  const issues = [];

  for (const post of fieldnotePosts) {
    for (const ref of (post.references || [])) {
      if (!knownUids.has(ref)) {
        issues.push({ code: 'BROKEN_REF', severity: 'ERROR', promptable: false, address: post.address, ref });
        errors++;
      }
    }
    for (const ref of (post.trailingRefs || [])) {
      const uid = typeof ref === 'object' ? ref.uid : ref;
      if (!knownUids.has(uid)) {
        issues.push({ code: 'BROKEN_REF', severity: 'ERROR', promptable: false, address: post.address, ref: uid, trailing: true });
        errors++;
      }
    }
  }

  return { errors, issues };
}

/**
 * Check wiki-links in regular posts point to valid fieldnotes.
 * @param {Array} regularPosts
 * @param {Set<string>} knownUids
 * @returns {{ errors: number, issues: Array }}
 */
export function checkRegularPostWikiLinks(regularPosts, knownUids) {
  let errors = 0;
  const issues = [];
  const uidRegex = /data-uid="([^"]+)"/g;

  for (const post of regularPosts) {
    let match;
    while ((match = uidRegex.exec(post.content)) !== null) {
      if (!knownUids.has(match[1])) {
        issues.push({ code: 'BROKEN_WIKILINK', severity: 'ERROR', promptable: false, postId: post.id, ref: match[1] });
        errors++;
      }
    }
  }

  return { errors, issues };
}

/**
 * Check for self-references in trailing refs.
 * @param {Array} fieldnotePosts
 * @returns {{ warnings: number, issues: Array }}
 */
export function checkSelfReferences(fieldnotePosts) {
  let warnings = 0;
  const issues = [];

  for (const post of fieldnotePosts) {
    for (const ref of (post.trailingRefs || [])) {
      const uid = typeof ref === 'object' ? ref.uid : ref;
      if (uid === post.id) {
        issues.push({ code: 'SELF_REF', severity: 'WARN', promptable: false, address: post.address });
        warnings++;
      }
    }
  }

  return { warnings, issues };
}

/**
 * Check that all trailing refs have :: annotations.
 * @param {Array} fieldnotePosts
 * @returns {{ errors: number, issues: Array }}
 */
export function checkBareTrailingRefs(fieldnotePosts) {
  let errors = 0;
  const issues = [];

  for (const post of fieldnotePosts) {
    for (const ref of (post.trailingRefs || [])) {
      const annotation = typeof ref === 'object' ? ref.annotation : null;
      if (!annotation || annotation.trim() === '') {
        const uid = typeof ref === 'object' ? ref.uid : ref;
        issues.push({ code: 'BARE_TRAILING_REF', severity: 'ERROR', promptable: false, address: post.address, ref: uid });
        errors++;
      }
    }
  }

  return { errors, issues };
}

/**
 * Check parent hierarchy — every address segment should have a dedicated note.
 * @param {Array} fieldnotePosts
 * @param {Set<string>} knownAddresses
 * @returns {{ warnings: number, issues: Array }}
 */
export function checkParentHierarchy(fieldnotePosts, knownAddresses) {
  let warnings = 0;
  const issues = [];
  const missingParents = new Map();

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
    issues.push({ code: 'MISSING_PARENT', severity: 'WARN', promptable: true, parent, children });
    warnings++;
  }

  return { warnings, issues };
}

/**
 * Check frontmatter schema for a single fieldnote.
 * Returns issues for missing required fields and invalid values.
 * @param {Object} frontmatter
 * @returns {Array} issues
 */
export function checkFrontmatterSchema(frontmatter) {
  const issues = [];
  if (!frontmatter.uid) issues.push({ code: 'MISSING_UID', severity: 'ERROR', message: 'Missing uid in frontmatter' });
  if (!frontmatter.address) issues.push({ code: 'MISSING_ADDRESS', severity: 'ERROR', message: 'Missing address in frontmatter' });
  if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(frontmatter.date))) {
    issues.push({ code: 'INVALID_DATE', severity: 'WARN', message: `Date "${frontmatter.date}" doesn't match YYYY-MM-DD format` });
  }
  return issues;
}

/**
 * Full validation pipeline — runs all 7 phases.
 * This is the main entry point used by build-content.js.
 *
 * @param {Array} fieldnotePosts - Parsed fieldnote Post objects
 * @param {Array} allPosts - All posts (regular + fieldnotes) with processed HTML
 * @param {Object} cfg - Validation flags from compiler config
 * @param {Object} [options]
 * @param {boolean} [options.silent] - suppress console output (for browser use)
 * @returns {ValidationResult}
 */
export function validateFieldnotes(fieldnotePosts, allPosts, cfg, options = {}) {
  const silent = options.silent || false;

  // ANSI color codes (no-op in silent mode)
  const R = silent ? '' : '\x1b[31m';
  const G = silent ? '' : '\x1b[32m';
  const Y = silent ? '' : '\x1b[33m';
  const C = silent ? '' : '\x1b[36m';
  const D = silent ? '' : '\x1b[90m';
  const B = silent ? '' : '\x1b[1m';
  const X = silent ? '' : '\x1b[0m';

  if (!silent) console.log(`\n${B}[VALIDATE]${X} ${D}scripts/validate-fieldnotes.js${X}`);

  let errors = 0;
  let warnings = 0;
  let infos = 0;
  const issues = [];

  const knownUids = new Set(fieldnotePosts.map(p => p.id));
  const knownAddresses = new Set(fieldnotePosts.map(p => p.address));

  // ── Phase 1: Reference integrity ──
  if (cfg.validateFieldnoteRefs) {
    const refResult = checkReferenceIntegrity(fieldnotePosts, knownUids);
    errors += refResult.errors;
    for (const issue of refResult.issues) {
      issues.push(issue);
      if (!silent) {
        const label = issue.trailing ? 'trailing' : 'inline';
        console.log(`  ${R}ERROR${X}  [BROKEN_REF] ${label} [[${issue.ref}]] in "${issue.address}" → no block`);
      }
    }
  }

  if (cfg.validateRegularPostWikiLinks) {
    const regularPosts = allPosts.filter(p => p.category !== 'fieldnotes');
    const wlResult = checkRegularPostWikiLinks(regularPosts, knownUids);
    errors += wlResult.errors;
    for (const issue of wlResult.issues) {
      issues.push(issue);
      if (!silent) console.log(`  ${R}ERROR${X}  [BROKEN_WIKILINK] [[${issue.ref}]] in post "${issue.postId}" → no fieldnote`);
    }
  }

  // ── Phase 2: Self-references ──
  {
    const selfResult = checkSelfReferences(fieldnotePosts);
    warnings += selfResult.warnings;
    for (const issue of selfResult.issues) {
      issues.push(issue);
      if (!silent) console.log(`  ${Y}WARN ${X}  [SELF_REF] "${issue.address}" trails a ref to itself`);
    }
  }

  // ── Phase 3: Bare trailing refs ──
  {
    const bareResult = checkBareTrailingRefs(fieldnotePosts);
    errors += bareResult.errors;
    for (const issue of bareResult.issues) {
      issues.push(issue);
      if (!silent) console.log(`  ${R}ERROR${X}  [BARE_TRAILING_REF] "${issue.address}" has trailing ref [[${issue.ref}]] without :: annotation`);
    }
  }

  // ── Phase 4: Parent hierarchy ──
  if (cfg.validateParentSegments) {
    const parentResult = checkParentHierarchy(fieldnotePosts, knownAddresses);
    warnings += parentResult.warnings;
    for (const issue of parentResult.issues) {
      issues.push(issue);
      if (!silent) {
        const extra = issue.children.length > 1 ? ` +${issue.children.length - 1} more` : '';
        console.log(`  ${Y}WARN ${X}  [MISSING_PARENT] "${issue.parent}" has no block ${D}(parent of ${issue.children[0]}${extra})${X}`);
      }
    }
  }

  // ── Phase 5: Circular references ──
  if (cfg.detectCircularRefs) {
    const adj = new Map();
    for (const post of fieldnotePosts) {
      adj.set(post.address, (post.references || []).filter(r => knownAddresses.has(r) && r !== post.address));
    }

    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map();
    for (const addr of knownAddresses) color.set(addr, WHITE);

    const seen = new Set();
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
      if (!silent) console.log(`  ${Y}WARN ${X}  [CIRCULAR_REF] circular ref: ${cycle.join(' → ')}`);
      issues.push({ code: 'CIRCULAR_REF', severity: 'WARN', promptable: false, cycle });
      warnings++;
    }
  }

  // ── Phase 6: Segment collisions ──
  if (cfg.detectSegmentCollisions !== false) {
    const exclusions = new Set(
      (cfg.segmentCollisionExclusions || [
        'overview', 'intro', 'basics', 'summary', 'notes',
        'example', 'examples', 'reference', 'references',
        'config', 'configuration', 'settings', 'setup',
        'types', 'glossary', 'faq', 'history',
      ]).map(s => s.toLowerCase())
    );

    const collisions = checkSegmentCollisions(fieldnotePosts, { exclusions });

    if (collisions.length > 0 && !silent) {
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
          if (!silent) console.log(`  ${Y}WARN ${X}  [STALE_DISTINCT] stale distinct: "${addr}" in "${post.address}" → no block`);
          issues.push({ code: 'STALE_DISTINCT', severity: 'WARN', promptable: false, address: post.address, staleRef: addr });
          warnings++;
        }
      }
    }
  }

  // ── Phase 7: Isolated notes ──
  if (cfg.detectIsolated !== false) {
    const referenced = new Set();
    for (const post of fieldnotePosts) {
      for (const ref of (post.references || [])) referenced.add(ref);
    }

    for (const post of fieldnotePosts) {
      const hasOut = (post.references || []).length > 0;
      const hasIn = referenced.has(post.id);
      if (!hasOut && !hasIn) {
        if (!silent) console.log(`  ${C}INFO ${X}  [ISOLATED_NOTE] "${post.address}" has no connections (isolated)`);
        issues.push({ code: 'ISOLATED_NOTE', severity: 'INFO', promptable: false, address: post.address });
        infos++;
      }
    }
  }

  // ── Legend + Summary ──
  if (!silent) {
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
        ISOLATED_NOTE: 'no incoming or outgoing references',
      };
      console.log(`\n  ${D}Legend:${X}`);
      for (const code of codes) {
        if (legend[code]) console.log(`  ${D}  ${code} — ${legend[code]}${X}`);
      }
    }

    const parts = [];
    if (errors > 0) parts.push(`${R}${errors} error${errors !== 1 ? 's' : ''}${X}`);
    if (warnings > 0) parts.push(`${Y}${warnings} warning${warnings !== 1 ? 's' : ''}${X}`);
    if (infos > 0) parts.push(`${C}${infos} info${X}`);
    if (parts.length === 0) parts.push(`${G}all clear${X}`);

    console.log(`${B}[VALIDATE]${X} ${parts.join(', ')}`);

    const promptableCount = issues.filter(i => i.promptable).length;
    if (promptableCount > 0) {
      const M = '\x1b[35m';
      console.log('');
      console.log(`  ${M}${B}╭─────────────────────────────────────────────────╮${X}`);
      console.log(`  ${M}${B}│${X}  ${B}${promptableCount} issue${promptableCount !== 1 ? 's' : ''} can be fixed interactively${X}            ${M}${B}│${X}`);
      console.log(`  ${M}${B}│${X}  Run: ${G}npm run content:fix${X}                       ${M}${B}│${X}`);
      console.log(`  ${M}${B}╰─────────────────────────────────────────────────╯${X}`);
    }
    console.log('');
  }

  return { errors, warnings, infos, issues };
}
