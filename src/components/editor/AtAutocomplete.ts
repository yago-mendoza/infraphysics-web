// CodeMirror autocomplete source for @ universal references
// Triggers on @ at word boundary, searches fieldnotes + articles + URLs

import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { EditorView } from '@codemirror/view';
import type { FieldNoteMeta } from '../../types';
import type { Post } from '../../types';

const URL_RE = /^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i;

/**
 * Creates a CompletionSource that triggers on @ and provides universal reference insertion.
 * Searches fieldnotes (tier 1), articles (tier 2), URL detection, and plain text fallback.
 */
export function createAtAutocomplete(
  getNotes: () => FieldNoteMeta[],
  getPosts: () => Post[],
  currentUid: string | null,
  onCreateRequest?: (name: string) => void,
) {
  return function atAutocomplete(context: CompletionContext): CompletionResult | null {
    const line = context.state.doc.lineAt(context.pos);
    const textBefore = line.text.slice(0, context.pos - line.from);

    // Find the last @ in the line before cursor
    const atIdx = textBefore.lastIndexOf('@');
    if (atIdx === -1) return null;

    // Only activate if @ is at word boundary (preceded by whitespace, line start, or BOF)
    if (atIdx > 0) {
      const charBefore = textBefore[atIdx - 1];
      if (!/\s/.test(charBefore)) return null;
    }

    const query = textBefore.slice(atIdx + 1).toLowerCase();
    const from = line.from + atIdx; // include the @ in replacement range

    const options: Completion[] = [];

    // --- Tier 1: Fieldnotes ---
    const notes = getNotes();
    const scoredNotes: { note: FieldNoteMeta; score: number }[] = [];

    for (const note of notes) {
      if (note.id === currentUid) continue;

      const name = (note.name || note.displayTitle || '').toLowerCase();
      const address = (note.address || '').toLowerCase();
      const desc = (note.description || '').toLowerCase();
      const aliases = (note.aliases || []).map(a => a.toLowerCase());
      let score = 0;

      if (!query) {
        score = (note.references?.length || 0) + 1;
      } else if (name === query) {
        score = 1000;
      } else if (name.startsWith(query)) {
        score = 800;
      } else if (name.includes(query)) {
        score = 600;
      } else if (aliases.some(a => a.includes(query))) {
        score = 500;
      } else if (address.includes(query)) {
        score = 400;
      } else if (desc.includes(query)) {
        score = 200;
      }

      if (score > 0) {
        scoredNotes.push({ note, score });
      }
    }

    scoredNotes.sort((a, b) => b.score - a.score || (a.note.name || '').localeCompare(b.note.name || ''));

    for (const { note } of scoredNotes.slice(0, 50)) {
      const name = note.name || note.displayTitle || note.id;
      const address = note.address || '';

      options.push({
        label: name,
        detail: address !== name ? address : undefined,
        apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
          const wikiLink = `[[${note.id}|${name}]]`;
          view.dispatch({ changes: { from, to, insert: wikiLink } });
        },
        boost: 0,
      });
    }

    // --- Tier 2: Articles ---
    const posts = getPosts();
    const scoredPosts: { post: Post; score: number }[] = [];

    for (const post of posts) {
      const title = (post.title || '').toLowerCase();
      const desc = (post.description || '').toLowerCase();
      let score = 0;

      if (!query) {
        score = 1;
      } else if (title === query) {
        score = 950;
      } else if (title.startsWith(query)) {
        score = 750;
      } else if (title.includes(query)) {
        score = 550;
      } else if (desc.includes(query)) {
        score = 150;
      }

      if (score > 0) {
        scoredPosts.push({ post, score });
      }
    }

    scoredPosts.sort((a, b) => b.score - a.score || (a.post.title || '').localeCompare(b.post.title || ''));

    for (const { post } of scoredPosts.slice(0, 50 - options.length)) {
      const title = post.title || post.id;

      options.push({
        label: title,
        detail: post.category,
        apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
          const wikiLink = `[[${post.category}/${post.id}|${title}]]`;
          view.dispatch({ changes: { from, to, insert: wikiLink } });
        },
        boost: -50,
      });
    }

    // --- Tier 3: URL detection ---
    if (query && URL_RE.test(query)) {
      const url = query.startsWith('http') ? query : `https://${query}`;
      options.push({
        label: 'Insert as link',
        detail: url,
        apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
          const wikiLink = `[[${url}|${query}]]`;
          view.dispatch({ changes: { from, to, insert: wikiLink } });
        },
        boost: -80,
      });
    }

    if (options.length === 0) return null;

    return {
      from: from + 1, // autocomplete range starts after @
      options,
      filter: false,
    };
  };
}
