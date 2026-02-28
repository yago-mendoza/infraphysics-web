// Two-phase deletion modal for fieldnotes:
// Phase 1 — Impact overview: stub conversion (safe default) vs permanent deletion
// Phase 2 — Permanent deletion details: trailing ref cleanup + body ref handling

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { DeleteAnalysis } from './useFieldnoteEditor';

type Phase = 'overview' | 'permanent';

interface Props {
  analysis: DeleteAnalysis;
  phase: Phase;
  busy: boolean; // true during stubbing or deleting
  onStub: () => void;
  onPermanent: () => void; // transition to phase 2
  onConfirmDelete: (cleanupTrailingRefs: boolean, trailingRefUids: string[], unlinkBodyRefs: boolean) => void;
  onBack: () => void; // phase 2 → phase 1
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  analysis, phase, busy, onStub, onPermanent, onConfirmDelete, onBack, onCancel,
}) => {
  // Phase 2 state — trailing ref cleanup checkboxes
  const [checkedRefs, setCheckedRefs] = useState<Set<string>>(
    () => new Set(analysis.trailingRefs.map(r => r.uid))
  );
  const [unlinkBody, setUnlinkBody] = useState(true);

  const toggleRef = (uid: string) => {
    setCheckedRefs(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleConfirmDelete = () => {
    const uids = [...checkedRefs];
    onConfirmDelete(uids.length > 0, uids, unlinkBody);
  };

  // Clipboard summary
  const refSummary = useMemo(() => {
    const lines: string[] = [`Refs to ${analysis.noteAddress} (${analysis.noteName}):`];
    if (analysis.bodyRefs.length > 0) {
      lines.push('', 'Body refs:');
      for (const r of analysis.bodyRefs) lines.push(`  - ${r.name} (${r.address})`);
    }
    if (analysis.trailingRefs.length > 0) {
      lines.push('', 'Trailing refs TO this note:');
      for (const r of analysis.trailingRefs) lines.push(`  - ${r.name} (${r.address}) :: ${r.annotation}`);
    }
    if (analysis.ownTrailingRefs.length > 0) {
      lines.push('', 'Trailing refs FROM this note:');
      for (const r of analysis.ownTrailingRefs) lines.push(`  - ${r.name} (${r.address}) :: ${r.annotation}`);
    }
    if (analysis.children.length > 0) {
      lines.push('', 'Children:');
      for (const c of analysis.children) lines.push(`  - ${c.name} (${c.address})`);
    }
    return lines.join('\n');
  }, [analysis]);

  const copyRefs = () => { navigator.clipboard.writeText(refSummary); };

  const isSafe = analysis.totalImpact === 0;
  const interactionCount = analysis.trailingRefs.length + analysis.ownTrailingRefs.length;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}
    >
      <div
        className="w-full max-w-md mx-4 border rounded-lg overflow-hidden"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: phase === 'permanent' ? 'rgba(248,113,113,0.3)' : 'rgba(139,92,246,0.3)',
          maxHeight: 'calc(100vh - 4rem)',
        }}
      >
        {/* ─── PHASE 1: OVERVIEW ─── */}
        {phase === 'overview' && (
          <>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(139,92,246,0.2)', backgroundColor: 'rgba(139,92,246,0.05)' }}>
              <div className="text-[13px] font-semibold text-violet-400">Clear note content</div>
              <div className="text-[11px] text-th-secondary mt-0.5">
                {analysis.noteAddress} <span className="text-th-muted">({analysis.noteName})</span>
              </div>
            </div>

            <div className="px-4 py-3 overflow-y-auto thin-scrollbar" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
              {isSafe ? (
                <div className="text-[11px] text-green-400/80 mb-3">
                  No connections. Safe to remove entirely.
                </div>
              ) : (
                <div className="space-y-2 mb-3">
                  {analysis.bodyRefs.length > 0 && (
                    <div className="flex items-baseline gap-2 text-[11px]">
                      <span className="text-th-muted w-3 text-right">{analysis.bodyRefs.length}</span>
                      <span className="text-th-secondary">note{analysis.bodyRefs.length !== 1 ? 's' : ''} reference this note in their body</span>
                    </div>
                  )}
                  {interactionCount > 0 && (
                    <div className="flex items-baseline gap-2 text-[11px]">
                      <span className="text-th-muted w-3 text-right">{interactionCount}</span>
                      <span className="text-th-secondary">bilateral interaction{interactionCount !== 1 ? 's' : ''} will be {' '}
                        <span className="text-violet-400">preserved as stub</span> / <span className="text-red-400">lost if deleted</span>
                      </span>
                    </div>
                  )}
                  {analysis.children.length > 0 && (
                    <div className="flex items-baseline gap-2 text-[11px]">
                      <span className="text-th-muted w-3 text-right">{analysis.children.length}</span>
                      <span className="text-th-secondary">child note{analysis.children.length !== 1 ? 's' : ''} in this hierarchy</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t flex items-center gap-2 justify-end" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {!isSafe && (
                <button
                  onClick={copyRefs}
                  className="text-[10px] px-2 py-1 text-th-muted hover:text-th-secondary transition-colors mr-auto"
                  title="Copy reference list to clipboard"
                >
                  Copy refs
                </button>
              )}
              <button
                onClick={onCancel}
                disabled={busy}
                className="text-[10px] px-3 py-1 text-th-muted hover:text-th-secondary transition-colors"
              >
                Cancel
              </button>
              {!isSafe && (
                <>
                  <button
                    onClick={onPermanent}
                    disabled={busy}
                    className="text-[10px] px-3 py-1 border border-red-400/30 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/50 transition-colors rounded-sm"
                  >
                    Delete permanently...
                  </button>
                  <button
                    onClick={onStub}
                    disabled={busy}
                    className="text-[10px] px-3 py-1 border border-violet-400/50 text-violet-400 hover:bg-violet-400/10 transition-colors rounded-sm disabled:opacity-50"
                  >
                    {busy ? 'Converting...' : 'Keep as stub'}
                  </button>
                </>
              )}
              {isSafe && (
                <button
                  onClick={() => onConfirmDelete(false, [], false)}
                  disabled={busy}
                  className="text-[10px] px-3 py-1 border border-red-400/50 text-red-400 hover:bg-red-400/10 transition-colors rounded-sm disabled:opacity-50"
                >
                  {busy ? 'Deleting...' : 'Delete permanently'}
                </button>
              )}
            </div>
          </>
        )}

        {/* ─── PHASE 2: PERMANENT DELETION DETAILS ─── */}
        {phase === 'permanent' && (
          <>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(248,113,113,0.2)', backgroundColor: 'rgba(248,113,113,0.05)' }}>
              <div className="text-[13px] font-semibold text-red-400">Delete permanently</div>
              <div className="text-[11px] text-th-secondary mt-0.5">
                {analysis.noteAddress} <span className="text-th-muted">({analysis.noteName})</span>
              </div>
            </div>

            <div className="px-4 py-3 overflow-y-auto thin-scrollbar" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
              {/* Body refs */}
              {analysis.bodyRefs.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-th-muted mb-1.5">
                    Body references ({analysis.bodyRefs.length})
                  </div>
                  <div className="space-y-0.5 mb-2">
                    {analysis.bodyRefs.map(r => (
                      <div key={r.uid} className="text-[11px] text-th-secondary pl-2 border-l border-th-hub-border">
                        {r.name} <span className="text-th-muted">({r.address})</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bodyRefAction"
                        checked={unlinkBody}
                        onChange={() => setUnlinkBody(true)}
                        className="accent-red-400"
                      />
                      <span className={unlinkBody ? 'text-th-secondary' : 'text-th-muted'}>Convert to plain text</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bodyRefAction"
                        checked={!unlinkBody}
                        onChange={() => setUnlinkBody(false)}
                        className="accent-red-400"
                      />
                      <span className={!unlinkBody ? 'text-th-secondary' : 'text-th-muted'}>Leave as broken links</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Trailing refs TO this note (from other notes) */}
              {analysis.trailingRefs.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-th-muted mb-1.5">
                    Interactions pointing here ({analysis.trailingRefs.length})
                  </div>
                  <div className="text-[11px] text-th-tertiary mb-1.5">
                    Checked items will be removed from the source note's file.
                  </div>
                  <div className="space-y-1">
                    {analysis.trailingRefs.map(r => (
                      <label key={r.uid} className="flex items-start gap-2 text-[11px] cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checkedRefs.has(r.uid)}
                          onChange={() => toggleRef(r.uid)}
                          className="mt-0.5 accent-red-400"
                        />
                        <div className="min-w-0">
                          <span className="text-th-secondary group-hover:text-th-heading transition-colors">{r.name}</span>
                          <span className="text-th-muted"> :: {r.annotation}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Own trailing refs — interactions declared BY this note */}
              {analysis.ownTrailingRefs.length > 0 && (
                <div className="mb-3 p-2 rounded border" style={{ borderColor: 'rgba(248,113,113,0.2)', backgroundColor: 'rgba(248,113,113,0.05)' }}>
                  <div className="text-[10px] uppercase tracking-wider text-red-400/80 mb-1.5">
                    Interactions declared by this note ({analysis.ownTrailingRefs.length})
                  </div>
                  <div className="text-[11px] text-red-200/60 mb-1.5">
                    These annotations will be lost on the target notes.
                  </div>
                  <div className="space-y-0.5">
                    {analysis.ownTrailingRefs.map(r => (
                      <div key={r.uid} className="text-[11px] text-th-secondary pl-2 border-l border-red-400/30">
                        {r.name} <span className="text-th-muted"> :: {r.annotation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Children */}
              {analysis.children.length > 0 && (
                <div className="mb-3 p-2 rounded border" style={{ borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.05)' }}>
                  <div className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1.5">
                    Children ({analysis.children.length})
                  </div>
                  <div className="text-[11px] text-amber-200/70 mb-1.5">
                    These child notes will lose their parent.
                  </div>
                  <div className="space-y-0.5">
                    {analysis.children.map(c => (
                      <div key={c.uid} className="text-[11px] text-th-secondary pl-2 border-l border-amber-400/30">
                        {c.name} <span className="text-th-muted">({c.address})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t flex items-center gap-2 justify-end" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button
                onClick={copyRefs}
                className="text-[10px] px-2 py-1 text-th-muted hover:text-th-secondary transition-colors mr-auto"
                title="Copy reference list to clipboard"
              >
                Copy refs
              </button>
              <button
                onClick={onBack}
                disabled={busy}
                className="text-[10px] px-3 py-1 text-th-muted hover:text-th-secondary transition-colors"
              >
                Go back
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={busy}
                className="text-[10px] px-3 py-1 border border-red-400/50 text-red-400 hover:bg-red-400/10 transition-colors rounded-sm disabled:opacity-50"
              >
                {busy ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
