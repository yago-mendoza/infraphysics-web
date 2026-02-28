// Trailing refs editor widget — shows interactions below the code editor
// Each ref = card with note name + editable annotation + delete button

import React, { useState, useMemo } from 'react';
import type { FieldNoteMeta, ConnectionRef } from '../../types';
import { noteLabel } from '../../types';

interface TrailingRef {
  uid: string;
  annotation: string | null;
}

interface Props {
  trailingRefs: TrailingRef[];
  noteById: Map<string, FieldNoteMeta>;
  allNotes: FieldNoteMeta[];
  currentUid: string | null;
  onUpdate: (refs: TrailingRef[]) => void;
}

export const TrailingRefsWidget: React.FC<Props> = ({
  trailingRefs,
  noteById,
  allNotes,
  currentUid,
  onUpdate,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addQuery, setAddQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!addQuery) return [];
    const q = addQuery.toLowerCase();
    const existingUids = new Set(trailingRefs.map(r => r.uid));
    return allNotes
      .filter(n => {
        if (n.id === currentUid || existingUids.has(n.id)) return false;
        const name = (n.name || n.displayTitle || '').toLowerCase();
        const addr = (n.address || '').toLowerCase();
        return name.includes(q) || addr.includes(q);
      })
      .slice(0, 10);
  }, [addQuery, allNotes, currentUid, trailingRefs]);

  const handleDelete = (idx: number) => {
    const next = [...trailingRefs];
    next.splice(idx, 1);
    onUpdate(next);
  };

  const handleAnnotationChange = (idx: number, annotation: string) => {
    const next = [...trailingRefs];
    next[idx] = { ...next[idx], annotation };
    onUpdate(next);
  };

  const handleAdd = (note: FieldNoteMeta) => {
    onUpdate([...trailingRefs, { uid: note.id, annotation: '' }]);
    setShowAdd(false);
    setAddQuery('');
  };

  return (
    <div className="overflow-y-auto thin-scrollbar flex-shrink-0" style={{ maxHeight: 250 }}>
      {/* Header band */}
      <div
        className="flex items-center justify-between px-2 py-0.5"
        style={{ borderBottom: '1px solid var(--editor-border, rgba(255,255,255,0.08))' }}
      >
        <span className="text-[10px] text-th-muted uppercase tracking-wider">
          Interactions ({trailingRefs.length})
        </span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
        >
          {showAdd ? 'cancel' : '+ add'}
        </button>
      </div>

      {showAdd && (
        <div className="px-2 py-1 relative" style={{ borderBottom: '1px solid var(--editor-border, rgba(255,255,255,0.08))' }}>
          <input
            type="text"
            value={addQuery}
            onChange={e => setAddQuery(e.target.value)}
            placeholder="Search notes..."
            autoFocus
            className="w-full text-[11px] px-2 py-0.5 bg-th-surface border border-th-border focus:border-violet-400/50 focus:outline-none text-th-primary placeholder-th-muted"
          />
          {filteredNotes.length > 0 && (
            <div
              className="absolute z-10 left-2 right-2 mt-1 border border-th-border overflow-hidden max-h-40 overflow-y-auto"
              style={{ backgroundColor: 'var(--editor-bg, #1a1a1a)' }}
            >
              {filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => handleAdd(note)}
                  className="w-full text-left px-2 py-1 text-[11px] hover:bg-violet-400/10 transition-colors"
                >
                  <span className="text-th-primary">{noteLabel(note)}</span>
                  {note.address && (
                    <span className="text-th-muted ml-2">{note.address.replace(/\/\//g, ' / ')}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {trailingRefs.length === 0 && !showAdd && (
        <div className="text-[11px] text-th-muted px-2 py-1">No interactions yet</div>
      )}

      {/* Interaction bands — compact stripes */}
      {trailingRefs.map((ref, idx) => {
        const note = noteById.get(ref.uid);
        return (
          <div
            key={ref.uid}
            className="flex gap-1.5 px-2 py-0.5 items-start"
            style={{ borderBottom: idx < trailingRefs.length - 1 ? '1px solid rgba(139, 92, 246, 0.06)' : 'none' }}
          >
            <button
              onClick={() => handleDelete(idx)}
              className="text-th-muted hover:text-red-400 transition-colors text-[10px] flex-shrink-0 leading-none mt-[3px]"
              title="Remove"
            >
              &times;
            </button>
            <span className="text-[11px] text-violet-400 flex-shrink-0 whitespace-nowrap">
              {note ? noteLabel(note) : ref.uid}
            </span>
            <textarea
              value={ref.annotation || ''}
              onChange={e => handleAnnotationChange(idx, e.target.value)}
              placeholder="annotation — e.g., contrast with, depends on"
              rows={1}
              className="flex-1 text-[10px] px-1 py-0 bg-transparent border-b border-violet-400/15 focus:border-violet-400/50 focus:outline-none text-th-secondary placeholder-th-muted resize-none leading-tight min-w-0"
              style={{ minHeight: '1.2em' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
