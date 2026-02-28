// Right-split editor panel for Second Brain fieldnote editing
// Three tabs: Editor (CodeMirror + diagnostics), Context (zone panels), Syntax (cheatsheet)

import React, { Suspense, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DiagnosticsTerminal } from './DiagnosticsTerminal';
import { SyntaxCheatsheet } from './SyntaxCheatsheet';
import { NewNotePanel } from './NewNotePanel';
import { useTermSuggestions } from './useTermSuggestions';
import type { EditorState, Diagnostic } from './useFieldnoteEditor';
import type { CodeMirrorHandle } from './CodeMirrorEditor';
import type { FieldNoteMeta, Post } from '../../types';
import {
  SuperscriptIcon, SubscriptIcon, KbdIcon, AccentIcon, FootnoteIcon,
  DotsIcon, ShoutIcon, BlockquoteIcon, ContextIcon, DefinitionIcon,
  AtRefIcon, InteractionIcon,
} from '../icons';

// Lazy-load CodeMirror — ~100KB gzipped, only loaded when editing
const CodeMirrorEditor = React.lazy(() => import('./CodeMirrorEditor'));

type Tab = 'editor' | 'context' | 'syntax';

interface Props {
  editor: EditorState;
  allNotes: FieldNoteMeta[];
  allPosts: Post[];
  contextContent: React.ReactNode;
}

export const EditorPanel: React.FC<Props> = ({
  editor,
  allNotes,
  allPosts,
  contextContent,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [createRequest, setCreateRequest] = useState<string | null>(null);
  const cmRef = useRef<CodeMirrorHandle>(null);

  // Resizable editor area — drag handle controls CodeMirror max-height
  const [editorHeight, setEditorHeight] = useState(350);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  // Resizable console area — drag handle below diagnostics
  const [consoleHeight, setConsoleHeight] = useState(130);
  const consoleDragRef = useRef<{ startY: number; startH: number } | null>(null);

  // Resizable panel width — drag left edge
  const [panelWidth, setPanelWidth] = useState(550);
  const hDragRef = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const delta = e.clientY - dragRef.current.startY;
        setEditorHeight(Math.max(120, Math.min(800, dragRef.current.startH + delta)));
      }
      if (consoleDragRef.current) {
        const delta = e.clientY - consoleDragRef.current.startY;
        setConsoleHeight(Math.max(60, Math.min(500, consoleDragRef.current.startH + delta)));
      }
      if (hDragRef.current) {
        // Dragging left edge: moving left = wider, moving right = narrower
        const delta = hDragRef.current.startX - e.clientX;
        setPanelWidth(Math.max(400, Math.min(900, hDragRef.current.startW + delta)));
      }
    };
    const onUp = () => {
      dragRef.current = null;
      consoleDragRef.current = null;
      hDragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Smart term detection
  const { suggestions, dismiss } = useTermSuggestions(
    editor.rawContent,
    allNotes,
    editor.editingUid,
  );

  const handleAcceptGroup = useCallback((group: typeof suggestions[number][]) => {
    const changes = group.map(s => ({
      from: s.offset,
      to: s.offset + s.length,
      insert: `[[${s.uid}|${s.name}]]`,
    }));
    cmRef.current?.replaceRanges(changes);
  }, []);

  // Ranges to highlight in the editor (suggested terms)
  const highlightRanges = useMemo(() =>
    suggestions.map(s => ({ from: s.offset, to: s.offset + s.length })),
    [suggestions],
  );

  // Create a stub fieldnote for a missing parent address
  const handleCreateStub = useCallback(async (address: string) => {
    const parts = address.split('//');
    const name = parts[parts.length - 1];
    try {
      const resp = await fetch('/api/fieldnotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          name,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      if (resp.ok) {
        // Re-trigger validation to clear the warning
        editor.setRawContent(editor.rawContent);
      }
    } catch { /* silent */ }
  }, [editor]);

  const mergedDiagnostics = useMemo((): Diagnostic[] => {
    // Enrich "Missing parent" warnings with a create-stub action
    const enriched = editor.diagnostics.map(d => {
      const match = d.message.match(/^Missing parent "(.+)"$/);
      if (match && d.source === 'VALIDATE' && d.severity === 'WARN') {
        return {
          ...d,
          actions: [{ label: 'Create stub', style: 'accept' as const, onAction: () => handleCreateStub(match[1]) }],
        };
      }
      return d;
    });

    // Group suggestions by uid+term — no duplicate lines
    const grouped = new Map<string, typeof suggestions[number][]>();
    for (const s of suggestions) {
      const key = `${s.uid}:${s.term.toLowerCase()}`;
      const arr = grouped.get(key) || [];
      arr.push(s);
      grouped.set(key, arr);
    }

    const suggestionDiags: Diagnostic[] = [...grouped.values()].map(group => {
      const s = group[0];
      const shortAddr = s.address.length > 30 ? '...' + s.address.slice(-27) : s.address;
      const count = group.length;
      return {
        source: 'SUGGEST',
        severity: 'WARN',
        message: `"${s.term}" → ${s.name} (${shortAddr})${count > 1 ? `  (${count})` : ''}`,
        actions: [
          { label: 'Yes', style: 'accept' as const, onAction: () => handleAcceptGroup(group) },
          { label: 'No', style: 'dismiss' as const, onAction: () => dismiss(group[0]) },
        ],
      };
    });
    return [...enriched, ...suggestionDiags];
  }, [editor.diagnostics, suggestions, handleAcceptGroup, dismiss, handleCreateStub]);

  // When a note is created from autocomplete, insert [[uid|name]] at cursor
  const handleNoteCreated = useCallback((uid: string) => {
    // Find the newly created note's name from allNotes (after refresh) or use createRequest
    const name = createRequest || uid;
    setCreateRequest(null);
    // Insert the wiki-link reference at cursor position
    if (cmRef.current) {
      cmRef.current.insertAtCursor(`[[${uid}|${name}]]`);
    }
  }, [createRequest]);


  const tabs: { key: Tab; label: string }[] = [
    { key: 'editor', label: 'Editor' },
    { key: 'context', label: 'Context' },
    { key: 'syntax', label: 'Syntax' },
  ];

  return (
    <div className="flex sticky top-7" style={{ maxHeight: 'calc(100vh - 1.75rem)' }}>
      {/* Left-edge drag handle for horizontal resize */}
      <div
        style={{ width: 5, cursor: 'col-resize', borderRight: '1px solid var(--editor-border, rgba(255,255,255,0.08))' }}
        className="flex-shrink-0 hover:bg-violet-400/10 transition-colors"
        onMouseDown={e => {
          hDragRef.current = { startX: e.clientX, startW: panelWidth };
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        }}
      />
      <div
        className="flex flex-col border-y border-r flex-1 min-w-0 overflow-y-auto thin-scrollbar"
        style={{
          width: panelWidth - 5,
          maxHeight: 'calc(100vh - 1.75rem)',
          borderColor: 'var(--editor-border, rgba(255,255,255,0.08))',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        }}
      >
      {/* Tab bar */}
      <div className="flex items-center border-b px-1" style={{ borderColor: 'var(--editor-border, rgba(255,255,255,0.08))' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-[11px] transition-colors ${
              activeTab === tab.key
                ? 'text-violet-400 border-t-2 border-violet-400'
                : 'text-th-muted hover:text-th-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Save indicator + close */}
        <div className="flex items-center gap-2 pr-2">
          {editor.isDirty && (
            <span className="w-2 h-2 rounded-full bg-yellow-400" title="Unsaved changes" />
          )}
          {editor.saveStatus === 'saved' && (
            <span className="text-[10px] text-green-400">saved</span>
          )}
          <button
            onClick={editor.save}
            disabled={!editor.isDirty}
            className={`text-[10px] px-2 py-0.5 border transition-colors ${
              editor.isDirty
                ? 'border-violet-400/50 text-violet-400 hover:bg-violet-400/10'
                : 'text-th-muted cursor-default'
            }`}
            style={!editor.isDirty ? { borderColor: 'rgba(255,255,255,0.06)' } : undefined}
            title="Save (Ctrl+S)"
          >
            Save
          </button>
        </div>
      </div>

      {/* Insert bar (editor tab only) */}
      {activeTab === 'editor' && (
        <div className="flex items-center flex-wrap gap-0.5 px-2 py-1 border-b" style={{ borderColor: 'var(--editor-border, rgba(255,255,255,0.08))', backgroundColor: 'var(--hub-sidebar-bg, #1a1a1a)' }}>
          {/* Arrows */}
          {['→', '←', '↓', '↑', '⮂'].map(ch => (
            <button
              key={ch}
              onMouseDown={e => { e.preventDefault(); cmRef.current?.insertAtCursor(ch); }}
              className="px-1.5 py-0.5 text-[12px] text-th-muted hover:text-violet-400 hover:bg-violet-400/10 transition-colors rounded"
              title={`Insert ${ch}`}
            >
              {ch}
            </button>
          ))}
          <span className="w-px h-3.5 bg-th-hub-border mx-0.5" />
          {/* Inline syntax */}
          {([
            [SuperscriptIcon, '{^:', '}', 'text', 'Superscript'],
            [SubscriptIcon, '{v:', '}', 'text', 'Subscript'],
            [KbdIcon, '{kbd:', '}', 'key', 'Keyboard key'],
            [AccentIcon, '--', '--', 'text', 'Accent text'],
            [FootnoteIcon, '{{', '|ref}}', 'text', 'Footnote'],
          ] as [React.FC<{ size?: number }>, string, string, string, string][]).map(([Icon, prefix, suffix, placeholder, title], i) => (
            <button
              key={title}
              onMouseDown={e => { e.preventDefault(); cmRef.current?.wrapSelection(prefix, suffix, placeholder); }}
              className={`p-1 transition-colors rounded ${
                i === 3
                  ? 'text-violet-400 hover:bg-violet-400/10'
                  : 'text-th-muted hover:text-violet-400 hover:bg-violet-400/10'
              }`}
              title={title}
            >
              <Icon size={14} />
            </button>
          ))}
          <span className="w-px h-3.5 bg-th-hub-border mx-0.5" />
          {/* Block syntax */}
          {([
            [DotsIcon, '\n{dots}\n', '', '', 'Dot separator'],
            [ShoutIcon, '\n{shout:', '}\n', 'text', 'Centered shout'],
            [BlockquoteIcon, '\n{bkqt/note}\n', '\n{/bkqt}\n', 'content', 'Blockquote (note)'],
            [ContextIcon, `\n>> ${new Date().toISOString().slice(2, 10).replace(/-/g, '.')} - `, '\n', 'text', 'Context annotation'],
            [DefinitionIcon, '\n- ', ':: description\n', 'TERM', 'Definition list'],
          ] as [React.FC<{ size?: number }>, string, string, string, string][]).map(([Icon, prefix, suffix, placeholder, title]) => (
            <button
              key={title}
              onMouseDown={e => { e.preventDefault(); placeholder ? cmRef.current?.wrapSelection(prefix, suffix, placeholder) : cmRef.current?.insertAtCursor(prefix); }}
              className="p-1 text-th-muted hover:text-violet-400 hover:bg-violet-400/10 transition-colors rounded"
              title={title}
            >
              <Icon size={14} />
            </button>
          ))}
          <span className="w-px h-3.5 bg-th-hub-border mx-0.5" />
          {/* Universal @ reference */}
          <button
            onMouseDown={e => {
              e.preventDefault();
              cmRef.current?.wrapSelection('@', '', 'query');
              requestAnimationFrame(() => cmRef.current?.triggerCompletion());
            }}
            className="p-1 text-th-muted hover:text-violet-400 hover:bg-violet-400/10 transition-colors rounded"
            title="Universal reference (@)"
          >
            <AtRefIcon size={14} />
          </button>
          <span className="w-px h-3.5 bg-th-hub-border mx-0.5" />
          {/* Interaction (trailing ref) */}
          <button
            onMouseDown={e => {
              e.preventDefault();
              cmRef.current?.insertInteraction();
              requestAnimationFrame(() => cmRef.current?.triggerCompletion());
            }}
            className="p-1 text-th-muted hover:text-violet-400 hover:bg-violet-400/10 transition-colors rounded"
            title="Insert interaction (trailing ref)"
          >
            <InteractionIcon size={14} />
          </button>
        </div>
      )}

      {/* Tab content */}
      <div>
        {activeTab === 'editor' && (
          <>
            {/* Editor area */}
            <div className="overflow-y-auto thin-scrollbar" style={{ maxHeight: editorHeight, overscrollBehavior: 'contain' }}>
              <Suspense fallback={
                <div className="h-40 flex items-center justify-center text-th-muted text-xs">
                  Loading editor...
                </div>
              }>
                <CodeMirrorEditor
                  ref={cmRef}
                  value={editor.rawContent}
                  onChange={editor.setRawContent}
                  onSave={editor.save}
                  allNotes={allNotes}
                  allPosts={allPosts}
                  currentUid={editor.editingUid}
                  onNavigate={editor.openEditor}
                  onCreateRequest={setCreateRequest}
                  highlights={highlightRanges}
                />
              </Suspense>
            </div>
            {createRequest && (
              <div className="border-t" style={{ borderColor: 'var(--editor-border)' }}>
                <NewNotePanel
                  allNotes={allNotes}
                  onCreated={handleNoteCreated}
                  onCancel={() => setCreateRequest(null)}
                  initialName={createRequest}
                />
              </div>
            )}
            {/* Resize handle */}
            <div
              style={{ height: 5, cursor: 'row-resize', borderTop: '1px solid var(--editor-border, rgba(255,255,255,0.08))' }}
              className="hover:bg-violet-400/10 transition-colors"
              onMouseDown={e => {
                dragRef.current = { startY: e.clientY, startH: editorHeight };
                document.body.style.cursor = 'row-resize';
                document.body.style.userSelect = 'none';
              }}
            />
            {/* Console */}
            <DiagnosticsTerminal
              diagnostics={mergedDiagnostics}
              saveStatus={editor.saveStatus}
            />
          </>
        )}

        {activeTab === 'context' && (
          <div className="flex-1 overflow-y-auto thin-scrollbar p-4">
            {contextContent}
          </div>
        )}

        {activeTab === 'syntax' && (
          <SyntaxCheatsheet />
        )}
      </div>
    </div>
    </div>
  );
};
