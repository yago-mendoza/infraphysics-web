// Validation for fieldnotes blocks - checks reference integrity

/**
 * Validates fieldnotes blocks for reference integrity.
 * @param {Array} fieldnotePosts - Parsed fieldnote Post objects
 */
export function validateFieldnotes(fieldnotePosts) {
  console.log('\n[FIELDNOTES] Validating...');

  let errors = 0;
  let warnings = 0;

  // Build set of all known addresses
  const knownAddresses = new Set(fieldnotePosts.map(p => p.address));

  for (const post of fieldnotePosts) {
    // Check [[...]] references point to existing blocks
    for (const ref of (post.references || [])) {
      if (!knownAddresses.has(ref)) {
        console.log(`  \x1b[31mERROR: [[${ref}]] referenced in "${post.address}" has no block\x1b[0m`);
        errors++;
      }
    }

    // Check parent segments have their own blocks
    const parts = post.addressParts || [];
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        const segment = parts[i];
        if (!knownAddresses.has(segment)) {
          console.log(`  \x1b[33mWARN:  "${segment}" (from ${post.address}) has no dedicated block\x1b[0m`);
          warnings++;
        }
      }
    }
  }

  console.log(`[FIELDNOTES] ${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}\n`);
}
