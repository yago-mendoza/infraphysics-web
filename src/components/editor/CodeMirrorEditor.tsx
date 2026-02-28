// CodeMirror 6 editor for fieldnote markdown editing
// Lazy-loaded via React.lazy — only imported on localhost when edit mode activates

import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap, Decoration, type DecorationSet, ViewPlugin, WidgetType, tooltips } from '@codemirror/view';
import { EditorState, StateEffect, StateField, Prec } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { autocompletion, completionKeymap, acceptCompletion, startCompletion } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { createWikiAutocomplete } from './WikiAutocomplete';
import { createAtAutocomplete } from './AtAutocomplete';
import type { FieldNoteMeta, Post } from '../../types';

interface HighlightRange {
  from: number;
  to: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  allNotes: FieldNoteMeta[];
  allPosts: Post[];
  currentUid: string | null;
  onNavigate?: (uid: string) => void;
  onCreateRequest?: (name: string) => void;
  highlights?: HighlightRange[];
}

// StateEffect + StateField for suggestion highlights
const setHighlightsEffect = StateEffect.define<HighlightRange[]>();

const suggestMark = Decoration.mark({ class: 'cm-suggest-highlight' });

const highlightField = StateField.define<DecorationSet>({
  create() { return Decoration.none; },
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setHighlightsEffect)) {
        const builder: import('@codemirror/state').Range<Decoration>[] = [];
        for (const r of e.value) {
          if (r.from < tr.state.doc.length && r.to <= tr.state.doc.length) {
            builder.push(suggestMark.range(r.from, r.to));
          }
        }
        return Decoration.set(builder, true);
      }
    }
    return decos.map(tr.changes);
  },
  provide: f => EditorView.decorations.from(f),
});

// ── Unlink button: × next to [[uid|Name]] to revert to plain text ──

class UnlinkWidget extends WidgetType {
  constructor(readonly from: number, readonly to: number, readonly text: string) { super(); }

  toDOM(view: EditorView) {
    const btn = document.createElement('span');
    btn.className = 'cm-unlink-btn';
    btn.innerHTML = '<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="1.5" y1="1.5" x2="6.5" y2="6.5"/><line x1="6.5" y1="1.5" x2="1.5" y2="6.5"/></svg>';
    btn.title = 'Remove link';
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      view.dispatch({ changes: { from: this.from, to: this.to, insert: this.text } });
    });
    return btn;
  }

  eq(other: UnlinkWidget) {
    return this.from === other.from && this.to === other.to && this.text === other.text;
  }
}

const unlinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = this.build(view); }
    update(update: { docChanged: boolean; selectionSet: boolean; view: EditorView }) {
      if (update.docChanged || update.selectionSet) this.decorations = this.build(update.view);
    }
    build(view: EditorView) {
      const widgets: import('@codemirror/state').Range<Decoration>[] = [];
      const doc = view.state.doc.toString();
      const cursor = view.state.selection.main.head;
      const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
      let m;
      while ((m = re.exec(doc)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        // Only show × button when cursor is inside the link (expanded state)
        if (cursor < start || cursor > end) continue;
        widgets.push(
          Decoration.widget({
            widget: new UnlinkWidget(start, end, m[2]),
            side: 1,
          }).range(end)
        );
      }
      return Decoration.set(widgets, true);
    }
  },
  { decorations: v => v.decorations },
);

// Collapse [[uid|name]] → [[name]] when cursor is outside the link
const wikiCollapsePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = this.build(view); }
    update(update: { docChanged: boolean; selectionSet: boolean; view: EditorView }) {
      if (update.docChanged || update.selectionSet) this.decorations = this.build(update.view);
    }
    build(view: EditorView) {
      const ranges: import('@codemirror/state').Range<Decoration>[] = [];
      const doc = view.state.doc.toString();
      const cursor = view.state.selection.main.head;
      const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
      let m;
      while ((m = re.exec(doc)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        // If cursor is inside, show full text (don't collapse)
        if (cursor >= start && cursor <= end) continue;
        // Hide the "uid|" portion: from after [[ to after |
        const hideFrom = start + 2;
        const hideTo = hideFrom + m[1].length + 1;
        ranges.push(Decoration.replace({}).range(hideFrom, hideTo));
      }
      return Decoration.set(ranges, true);
    }
  },
  { decorations: v => v.decorations },
);

export interface CodeMirrorHandle {
  insertAtCursor: (text: string) => void;
  replaceRange: (from: number, to: number, text: string) => void;
  replaceRanges: (changes: Array<{ from: number; to: number; insert: string }>) => void;
  wrapSelection: (prefix: string, suffix: string, placeholder: string) => void;
  triggerCompletion: () => void;
  insertInteraction: () => void;
}

const CodeMirrorEditor = forwardRef<CodeMirrorHandle, Props>(({ value, onChange, onSave, allNotes, allPosts, currentUid, onNavigate, onCreateRequest, highlights }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const allNotesRef = useRef(allNotes);
  const allPostsRef = useRef(allPosts);
  const onNavigateRef = useRef(onNavigate);
  const onCreateRequestRef = useRef(onCreateRequest);

  onChangeRef.current = onChange;
  onSaveRef.current = onSave;
  allNotesRef.current = allNotes;
  allPostsRef.current = allPosts;
  onNavigateRef.current = onNavigate;
  onCreateRequestRef.current = onCreateRequest;

  useImperativeHandle(ref, () => ({
    insertAtCursor(text: string) {
      const view = viewRef.current;
      if (!view) return;
      const pos = view.state.selection.main.head;
      view.dispatch({
        changes: { from: pos, insert: text },
        selection: { anchor: pos + text.length },
      });
      view.focus();
    },
    triggerCompletion() {
      const view = viewRef.current;
      if (!view) return;
      view.focus();
      startCompletion(view);
    },
    replaceRange(from: number, to: number, text: string) {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({ changes: { from, to, insert: text } });
      view.focus();
    },
    replaceRanges(changes: Array<{ from: number; to: number; insert: string }>) {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({ changes });
      view.focus();
    },
    wrapSelection(prefix: string, suffix: string, placeholder: string) {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      const doc = view.state.doc;
      const selected = view.state.sliceDoc(from, to);

      // Case A: selected text itself starts with prefix and ends with suffix → unwrap
      if (selected.startsWith(prefix) && selected.endsWith(suffix) && selected.length >= prefix.length + suffix.length) {
        const inner = selected.slice(prefix.length, selected.length - suffix.length);
        view.dispatch({
          changes: { from, to, insert: inner },
          selection: { anchor: from, head: from + inner.length },
        });
        view.focus();
        return;
      }

      // Case B: prefix/suffix sit just outside the selection → expand and unwrap
      const outerFrom = from - prefix.length;
      const outerTo = to + suffix.length;
      if (outerFrom >= 0 && outerTo <= doc.length
        && view.state.sliceDoc(outerFrom, from) === prefix
        && view.state.sliceDoc(to, outerTo) === suffix) {
        view.dispatch({
          changes: { from: outerFrom, to: outerTo, insert: selected },
          selection: { anchor: outerFrom, head: outerFrom + selected.length },
        });
        view.focus();
        return;
      }

      // Case C: wrap (or insert placeholder if no selection)
      const text = selected || placeholder;
      view.dispatch({
        changes: { from, to, insert: prefix + text + suffix },
        selection: { anchor: from + prefix.length, head: from + prefix.length + text.length },
      });
      view.focus();
    },
    insertInteraction() {
      const view = viewRef.current;
      if (!view) return;
      const doc = view.state.doc.toString();
      const lines = doc.split('\n');

      // Check if trailing ref section already exists:
      // Look for a `---` line followed by at least one `[[...]] ::` line
      let hasSeparator = false;
      for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue; // skip empty trailing lines
        if (/^\[\[.*\]\]\s*::/.test(trimmed)) {
          // This is a trailing ref line — keep scanning for ---
          continue;
        }
        if (trimmed === '---') {
          hasSeparator = true;
          break;
        }
        break; // hit a non-ref, non-separator line → no trailing section
      }

      let insert: string;
      let cursorOffset: number;
      if (hasSeparator) {
        // Append new ref line at end
        const endsWithNewline = doc.endsWith('\n');
        insert = (endsWithNewline ? '' : '\n') + '[[ :: ';
        cursorOffset = (endsWithNewline ? 0 : 1) + 2; // position after [[
      } else {
        // Add separator + first ref line
        const endsWithNewline = doc.endsWith('\n');
        insert = (endsWithNewline ? '' : '\n') + '---\n[[ :: ';
        cursorOffset = (endsWithNewline ? 0 : 1) + 4 + 2; // `---\n` = 4, then `[[` = 2
      }

      const end = doc.length;
      view.dispatch({
        changes: { from: end, insert },
        selection: { anchor: end + cursorOffset },
      });
      view.focus();
    },
  }), []);

  const getNotes = useCallback(() => allNotesRef.current, []);
  const getPosts = useCallback(() => allPostsRef.current, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const saveKeymap = keymap.of([{
      key: 'Mod-s',
      run: () => {
        onSaveRef.current();
        return true;
      },
    }]);

    const wikiComplete = createWikiAutocomplete(
      getNotes,
      currentUid,
      (uid: string) => onNavigateRef.current?.(uid),
      (name: string) => onCreateRequestRef.current?.(name),
    );

    const atComplete = createAtAutocomplete(
      getNotes,
      getPosts,
      currentUid,
      (name: string) => onCreateRequestRef.current?.(name),
    );

    const startState = EditorState.create({
      doc: value,
      extensions: [
        history(),
        saveKeymap,
        markdown(),
        autocompletion({
          override: [wikiComplete, atComplete],
          activateOnTyping: true,
          defaultKeymap: false,
          maxRenderedOptions: 50,
        }),
        // Completion keymap at highest precedence — Enter/arrows/Escape
        // are captured by the dropdown when open, fall through when closed.
        Prec.highest(keymap.of([
          ...completionKeymap,
          { key: 'Tab', run: acceptCompletion },
        ])),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        highlightField,
        unlinkPlugin,
        wikiCollapsePlugin,
        oneDark,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: 'auto',
            fontSize: '13px',
          },
          '.cm-scroller': {
            fontFamily: 'var(--font-mono)',
            overflow: 'visible !important',
            flex: 'none !important',
          },
          '.cm-content': {
            caretColor: 'var(--cat-fieldnotes-accent)',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: 'var(--cat-fieldnotes-accent)',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter, rgba(0,0,0,0.2))',
            borderRight: '1px solid var(--editor-border, rgba(255,255,255,0.08))',
          },
          '.cm-tooltip-autocomplete': {
            zIndex: '100',
            backgroundColor: 'var(--hub-sidebar-bg, #1a1a1a)',
            border: '1px solid rgba(139, 92, 246, 0.12)',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            width: '340px',
            maxHeight: '320px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 1px rgba(139,92,246,0.2)',
            backdropFilter: 'blur(12px)',
            padding: '4px',
          },
          '.cm-tooltip-autocomplete ul': {
            maxHeight: '312px',
            padding: '0',
          },
          '.cm-tooltip-autocomplete li': {
            padding: '6px 10px',
            lineHeight: '1.5',
            borderRadius: '4px',
            margin: '1px 0',
            transition: 'background-color 0.1s ease',
          },
          '.cm-tooltip-autocomplete li[aria-selected]': {
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            color: '#c4b5fd',
          },
          '.cm-completionLabel': {
            color: '#e2e8f0',
            fontSize: '11px',
            letterSpacing: '0.01em',
          },
          'li[aria-selected] .cm-completionLabel': {
            color: '#e9e5ff',
          },
          '.cm-completionDetail': {
            color: '#6b7280',
            fontStyle: 'normal',
            marginLeft: 'auto',
            paddingLeft: '12px',
            fontSize: '10px',
            textAlign: 'right',
          },
          'li[aria-selected] .cm-completionDetail': {
            color: '#8b5cf6',
          },
          '.cm-completionMatchedText': {
            color: '#a78bfa',
            fontWeight: '600',
            textDecoration: 'none',
          },
          '.cm-completionInfo': {
            display: 'none',
          },
          '.cm-suggest-highlight': {
            backgroundColor: 'rgba(139, 92, 246, 0.18)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.5)',
            borderRadius: '2px',
          },
          '.cm-unlink-btn': {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.1em',
            height: '1.1em',
            marginLeft: '1px',
            color: 'rgba(190, 242, 100, 0.7)',
            background: 'rgba(163, 230, 53, 0.08)',
            cursor: 'pointer',
            verticalAlign: 'middle',
            borderRadius: '2px',
            border: 'none',
          },
        }),
        tooltips({ parent: document.body }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [currentUid]); // Recreate when note changes

  // Sync suggestion highlights into CodeMirror decorations
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setHighlightsEffect.of(highlights || []) });
  }, [highlights]);

  // Sync external value changes (e.g., after save refreshes content)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ overflow: 'hidden' }}
    />
  );
});

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

export default CodeMirrorEditor;
