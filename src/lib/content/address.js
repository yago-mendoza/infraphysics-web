// Address utilities for fieldnote hierarchical naming
// Browser-safe — no Node dependencies

/**
 * Parse an address into its segments.
 * @param {string} address - e.g. "Hardware//CPU//cache"
 * @returns {string[]} - e.g. ["Hardware", "CPU", "cache"]
 */
export function parseAddress(address) {
  return address.split('//').map(s => s.trim());
}

/**
 * Get the parent address (everything except the last segment).
 * @param {string} address
 * @returns {string|null} - null if root-level
 */
export function getParentAddress(address) {
  const parts = parseAddress(address);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('//');
}

/**
 * Get the leaf (last) segment of an address.
 * @param {string} address
 * @returns {string}
 */
export function getLeafSegment(address) {
  const parts = parseAddress(address);
  return parts[parts.length - 1];
}

/**
 * Get all ancestor addresses for a given address.
 * @param {string} address - e.g. "A//B//C"
 * @returns {string[]} - e.g. ["A", "A//B"]
 */
export function getAncestors(address) {
  const parts = parseAddress(address);
  const ancestors = [];
  for (let i = 1; i < parts.length; i++) {
    ancestors.push(parts.slice(0, i).join('//'));
  }
  return ancestors;
}

/**
 * Check for segment collisions among a set of notes.
 * Returns collision objects with tier classification.
 *
 * @param {Array<{address: string, addressParts?: string[], aliases?: string[], distinct?: string[], supersedes?: string}>} notes
 * @param {Object} [options]
 * @param {Set<string>} [options.exclusions] - segment names to ignore
 * @returns {Array<{segment: string, entries: Array, tier: string, type: string}>}
 */
export function checkSegmentCollisions(notes, options = {}) {
  const exclusions = options.exclusions || new Set([
    'overview', 'intro', 'basics', 'summary', 'notes',
    'example', 'examples', 'reference', 'references',
    'config', 'configuration', 'settings', 'setup',
    'types', 'glossary', 'faq', 'history',
  ]);

  // Suppression pairs from `distinct` frontmatter (bilateral)
  const suppressed = new Set();
  for (const note of notes) {
    for (const other of (note.distinct || [])) {
      suppressed.add([note.address, other].sort().join('\0'));
    }
  }

  // Superseded addresses excluded from analysis
  const superseded = new Set(
    notes.filter(n => n.supersedes).map(n => n.supersedes)
  );

  // Build segment registry: lowercased name → [entries]
  const registry = new Map();

  for (const note of notes) {
    if (superseded.has(note.address)) continue;
    const parts = note.addressParts || parseAddress(note.address);

    // Non-root segments
    for (let i = 1; i < parts.length; i++) {
      const key = parts[i].toLowerCase();
      if (exclusions.has(key)) continue;
      if (!registry.has(key)) registry.set(key, []);
      registry.get(key).push({
        fullAddress: note.address,
        parentPath: parts.slice(0, i).join('//'),
        isLeaf: i === parts.length - 1,
        isRoot: false,
      });
    }

    // Root addresses
    if (parts.length === 1) {
      const key = parts[0].toLowerCase();
      if (!exclusions.has(key)) {
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

  // Alias registry
  const aliasMap = new Map();
  for (const note of notes) {
    if (superseded.has(note.address)) continue;
    for (const alias of (note.aliases || [])) {
      const key = alias.toLowerCase();
      if (!aliasMap.has(key)) aliasMap.set(key, []);
      aliasMap.get(key).push({ fullAddress: note.address, alias });
    }
  }

  const collisions = [];

  // Segment-vs-segment
  for (const [segName, entries] of registry) {
    if (entries.length < 2) continue;

    const parentSet = new Set(entries.map(e => (e.parentPath || '__root__').toLowerCase()));
    if (parentSet.size < 2) continue;

    const addrs = entries.map(e => e.fullAddress);
    const filtered = entries.filter(e =>
      !addrs.some(a => a !== e.fullAddress && e.fullAddress.startsWith(a + '//'))
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

    collisions.push({ segment: segName, entries: unsuppressed, tier, type: 'segment' });
  }

  // Segment-vs-alias
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

  // Alias-vs-alias
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

  return collisions;
}
