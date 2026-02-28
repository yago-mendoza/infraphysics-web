// Fieldnote parsing — browser-safe (no gray-matter, no Node fs)
// Extracts frontmatter, references, trailing refs, and description from raw markdown.

import { load as loadYaml } from 'js-yaml';

/**
 * Parse frontmatter from raw markdown using regex + js-yaml.
 * Returns { frontmatter, body } or null if no valid frontmatter found.
 * @param {string} raw - full file content including ---
 * @returns {{ frontmatter: Object, body: string } | null}
 */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  try {
    const frontmatter = loadYaml(match[1]) || {};
    // Normalize date to YYYY-MM-DD string (js-yaml parses bare dates as Date objects)
    if (frontmatter.date instanceof Date) {
      frontmatter.date = frontmatter.date.toISOString().slice(0, 10);
    } else if (frontmatter.date) {
      frontmatter.date = String(frontmatter.date).slice(0, 10);
    }
    return { frontmatter, body: match[2] };
  } catch {
    return null;
  }
}

/**
 * Extract all [[ref]] UIDs from body text.
 * Strips pipe display text: [[uid|custom]] → uid.
 * @param {string} body - markdown body (no frontmatter)
 * @returns {string[]} - unique UIDs
 */
export function parseReferences(body) {
  const refRegex = /\[\[([^\]]+)\]\]/g;
  const refsSet = new Set();
  let match;
  while ((match = refRegex.exec(body)) !== null) {
    const raw = match[1];
    const pipeIdx = raw.indexOf('|');
    refsSet.add(pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw.trim());
  }
  return [...refsSet];
}

/**
 * Parse trailing refs from body text.
 * Trailing refs are the last lines of the body that match either:
 *   [[uid]] :: annotation   (annotated form)
 *   [[uid]] [[uid2]]        (bare multi-ref line)
 *
 * Returns { trailingRefs, trailingRefStart } where trailingRefStart
 * is the line index where trailing refs begin.
 *
 * @param {string} body - markdown body
 * @returns {{ trailingRefs: Array<{uid: string, annotation: string|null}>, trailingRefStart: number }}
 */
export function parseTrailingRefs(body) {
  const bodyLines = body.split('\n');
  const trailingRefs = [];
  const singleRefAnnotated = /^\s*\[\[([^\]]+)\]\]\s*::\s*(.*?)\s*$/;
  const multiRefLine = /^\s*(\[\[[^\]]+\]\]\s*)+$/;
  let trailingRefStart = bodyLines.length;

  for (let i = bodyLines.length - 1; i >= 0; i--) {
    const line = bodyLines[i].trim();
    if (!line) continue;
    const annotatedMatch = singleRefAnnotated.exec(line);
    if (annotatedMatch) {
      const raw = annotatedMatch[1].trim();
      const pipeIdx = raw.indexOf('|');
      trailingRefs.push({
        uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw,
        annotation: annotatedMatch[2].trim(),
      });
      trailingRefStart = i;
    } else if (multiRefLine.test(line)) {
      const lineRefRegex = /\[\[([^\]]+)\]\]/g;
      let lineMatch;
      while ((lineMatch = lineRefRegex.exec(line)) !== null) {
        const raw = lineMatch[1].trim();
        const pipeIdx = raw.indexOf('|');
        trailingRefs.push({
          uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw,
          annotation: null,
        });
      }
      trailingRefStart = i;
    } else {
      break;
    }
  }

  return { trailingRefs, trailingRefStart };
}

/**
 * Extract the description from body text — first non-heading, non-image line.
 * Wiki-link syntax is stripped for display.
 * @param {string} body
 * @returns {string}
 */
export function extractDescription(body) {
  const bodyLines = body.split('\n');
  const firstTextLine = bodyLines.find(l => {
    const trimmed = l.trim();
    return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!');
  });
  return firstTextLine
    ? firstTextLine.trim().replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, ref, pipe) => pipe ? pipe.trim() : ref.trim())
    : '';
}

/**
 * Strip trailing refs (and preceding blank lines / separator) from body.
 * Returns the body content without trailing refs, suitable for compilation.
 * @param {string} body
 * @param {number} trailingRefStart - line index from parseTrailingRefs
 * @returns {string}
 */
export function stripTrailingRefs(body, trailingRefStart) {
  const bodyLines = body.split('\n');
  if (trailingRefStart >= bodyLines.length) return body;

  let cutoff = trailingRefStart;
  while (cutoff > 0 && !bodyLines[cutoff - 1].trim()) cutoff--;
  // Also skip the --- separator that conventionally precedes trailing refs
  if (cutoff > 0 && /^-{3,}$/.test(bodyLines[cutoff - 1].trim())) cutoff--;
  return bodyLines.slice(0, cutoff).join('\n');
}

/**
 * Extract full fieldnote metadata from raw file content.
 * This is the browser-safe equivalent of build-content.js's extractFieldnoteMeta.
 *
 * Does NOT compile HTML — returns contentMd (stripped body) for separate compilation.
 *
 * @param {string} raw - full file content
 * @returns {{ metadata: Object, contentMd: string } | null}
 */
export function extractFieldnoteMeta(raw) {
  const parsed = parseFrontmatter(raw);
  if (!parsed) return null;

  const { frontmatter, body } = parsed;
  const address = frontmatter.address;
  const uid = frontmatter.uid;
  if (!address || !uid) return null;

  const date = frontmatter.date || '';
  const addressParts = address.split('//').map(s => s.trim());
  const name = frontmatter.name || addressParts[addressParts.length - 1];

  const references = parseReferences(body);
  const { trailingRefs, trailingRefStart } = parseTrailingRefs(body);
  const description = extractDescription(body);
  const contentMd = stripTrailingRefs(body, trailingRefStart);

  return {
    metadata: {
      id: uid,
      title: address,
      displayTitle: name,
      name,
      category: 'fieldnotes',
      date,
      description,
      address,
      addressParts,
      references,
      trailingRefs,
      aliases: frontmatter.aliases || null,
      supersedes: frontmatter.supersedes || null,
      distinct: frontmatter.distinct || null,
    },
    contentMd,
  };
}

/**
 * Serialize fieldnote metadata + content back to raw markdown.
 * Used by the editor to reconstruct the file after edits to trailing refs.
 *
 * @param {{ uid: string, address: string, name: string, date: string, aliases?: string[], supersedes?: string, distinct?: string[] }} frontmatter
 * @param {string} bodyContent - markdown body without trailing refs
 * @param {Array<{uid: string, annotation: string|null}>} trailingRefs
 * @returns {string}
 */
export function serializeFieldnote(frontmatter, bodyContent, trailingRefs) {
  const lines = ['---'];
  lines.push(`uid: ${frontmatter.uid}`);
  lines.push(`address: "${frontmatter.address}"`);
  lines.push(`name: "${frontmatter.name}"`);
  lines.push(`date: "${frontmatter.date}"`);
  if (frontmatter.aliases && frontmatter.aliases.length > 0) {
    lines.push(`aliases: [${frontmatter.aliases.map(a => `"${a}"`).join(', ')}]`);
  }
  if (frontmatter.supersedes) {
    lines.push(`supersedes: "${frontmatter.supersedes}"`);
  }
  if (frontmatter.distinct && frontmatter.distinct.length > 0) {
    lines.push(`distinct: [${frontmatter.distinct.map(d => `"${d}"`).join(', ')}]`);
  }
  lines.push('---');
  lines.push('');
  lines.push(bodyContent.trim());

  if (trailingRefs.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('');
    for (const ref of trailingRefs) {
      if (ref.annotation) {
        lines.push(`[[${ref.uid}]] :: ${ref.annotation}`);
      } else {
        lines.push(`[[${ref.uid}]]`);
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}
