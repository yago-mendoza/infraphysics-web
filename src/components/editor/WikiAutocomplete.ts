// CodeMirror autocomplete source for [[navigation]]
// Triggers on [[ and provides a filterable dropdown to jump between fieldnotes

import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { EditorView } from '@codemirror/view';
import type { FieldNoteMeta } from '../../types';

/**
 * Creates a CompletionSource that triggers on [[ and provides fieldnote navigation.
 * Arrow keys to browse, Enter/Tab to jump to the selected note.
 * @param getNotes - function returning current fieldnotes
 * @param currentUid - UID of the note being edited (excluded from results)
 * @param onNavigate - callback when user selects a note to navigate to
 * @param onCreateRequest - callback when user selects "Create" from autocomplete
 */
export function createWikiAutocomplete(
  getNotes: () => FieldNoteMeta[],
  currentUid: string | null,
  onNavigate?: (uid: string) => void,
  onCreateRequest?: (name: string) => void,
) {
  return function wikiAutocomplete(context: CompletionContext): CompletionResult | null {
    // Look for [[ before the cursor
    const line = context.state.doc.lineAt(context.pos);
    const textBefore = line.text.slice(0, context.pos - line.from);
    const bracketIdx = textBefore.lastIndexOf('[[');

    if (bracketIdx === -1) return null;

    // Check if there's a closing ]] between the [[ and cursor — if so, we're done
    const afterBracket = textBefore.slice(bracketIdx + 2);
    if (afterBracket.includes(']]')) return null;

    const query = afterBracket.toLowerCase();
    const from = line.from + bracketIdx; // include the [[ in the replacement range
    const notes = getNotes();

    const scored: { note: FieldNoteMeta; score: number }[] = [];
    let hasExactMatch = false;

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
        hasExactMatch = true;
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
        scored.push({ note, score });
      }
    }

    scored.sort((a, b) => b.score - a.score || (a.note.name || '').localeCompare(b.note.name || ''));

    const options: Completion[] = scored.slice(0, 50).map(({ note }) => {
      const name = note.name || note.displayTitle || note.id;
      const address = note.address || '';

      return {
        label: name,
        detail: address !== name ? address : undefined,
        apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
          // Insert wiki-link: replace [[query with [[uid|name]]
          const wikiLink = `[[${note.id}|${name}]]`;
          view.dispatch({ changes: { from, to, insert: wikiLink } });
        },
        boost: 0,
      };
    });

    // Add "Create" option when query doesn't exactly match any existing note
    if (query && query.length >= 2 && !hasExactMatch && onCreateRequest) {
      const displayName = afterBracket;
      options.push({
        label: `+ ${displayName}`,
        detail: 'create new',
        apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
          view.dispatch({ changes: { from, to } });
          onCreateRequest(displayName);
        },
        boost: -100,
        type: 'text',
      });
    }

    if (options.length === 0) return null;

    return {
      from: from + 2, // autocomplete range starts after [[
      options,
      filter: false,
    };
  };
}
