// Wikinote names are stored the way the term reads in the middle of a sentence
// (common nouns lowercase, proper nouns and acronyms in their own casing). The
// note title, its card and the directory show the first letter capitalised;
// a link that opens a sentence is capitalised by the compiler. A note that must
// never be recased (npm, iOS) declares `proper: true` in its frontmatter.

/** First letter upper-cased, the rest untouched. */
export function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Title form of a name: capitalised unless the note is marked proper. */
export function displayName(name, proper = false) {
  return proper ? name : capitalizeFirst(name);
}

const BLOCK_OPEN = /<(?:p|li|td|th|h[1-6]|div|blockquote|dd|dt|figcaption|summary|caption)(?:\s[^>]*)?>\s*$/i;
const INLINE_OPEN = /(?:<(?:strong|em|b|i|span|small|mark|u)(?:\s[^>]*)?>\s*)+$/i;
const SENTENCE_END = /[.!?:]["'”’)\]]*\s+$/;

/**
 * Does a link starting at `offset` in `html` open a sentence? True at the start
 * of the document, right after a block-level opening tag (optionally through
 * inline opening tags) or after a sentence-ending mark and whitespace.
 */
export function startsSentence(html, offset) {
  let before = html.slice(Math.max(0, offset - 240), offset);
  if (!before.trim()) return true;
  before = before.replace(INLINE_OPEN, '');
  if (/\s$/.test(before) && !SENTENCE_END.test(before) && !BLOCK_OPEN.test(before.trimEnd())) {
    // whitespace after plain text: mid-sentence
    return SENTENCE_END.test(before);
  }
  const trimmed = before.trimEnd();
  if (BLOCK_OPEN.test(trimmed)) return true;
  return SENTENCE_END.test(before);
}
