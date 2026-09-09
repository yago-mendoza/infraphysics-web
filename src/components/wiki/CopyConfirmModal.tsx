// CopyConfirmModal: the check that precedes every bulk copy of wikinotes to the clipboard.
// It states how many notes, in which mode, the estimated size of the paste and the number of
// requests, and rates the load, so a heavy export is never triggered by a stray click.

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { type ExportEstimate, exportLoad, formatBytes } from '../../lib/exportNotes';

interface Props {
  estimate: ExportEstimate;
  /** What is being copied, in a few words: "Search results", "Graph selection". */
  source: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Only a heavy or severe load gets a sentence; a small paste needs no reassurance.
const LOAD_TEXT = {
  light: '',
  heavy: 'A large paste. Some chat boxes and editors slow down or truncate text of this size.',
  severe: 'A very large paste. The tab and the application you paste into may freeze for a while, and most chat boxes will reject it.',
} as const;

export const CopyConfirmModal: React.FC<Props> = ({ estimate, source, onConfirm, onCancel }) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const load = exportLoad(estimate);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); onCancel(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onCancel]);

  const notes = `${estimate.notes.toLocaleString()} ${estimate.notes === 1 ? 'note' : 'notes'}`;
  const tokens = estimate.tokens >= 1000 ? `~${(estimate.tokens / 1000).toFixed(estimate.tokens >= 10000 ? 0 : 1)}k tokens` : `~${estimate.tokens} tokens`;

  return createPortal(
    <div className="presence-info-veil copy-confirm-veil" role="presentation" onClick={event => { if (event.target === event.currentTarget) onCancel(); }}>
      <div className={`presence-info-card copy-confirm-card is-${load}`} role="alertdialog" aria-modal="true" aria-label="Copy to clipboard" aria-describedby={load !== 'light' ? 'copy-confirm-load' : undefined}>
        <span><b>Source</b>{source}</span>
        <span><b>Notes</b>{notes}</span>
        <span><b>Mode</b>{estimate.fullMode ? 'full text, with annotated interactions' : 'metadata only: address, date, description, interactions'}</span>
        <span><b>Size</b>{formatBytes(estimate.bytes)} of text · {tokens}</span>
        {estimate.requests > 0 && <span><b>Requests</b>{estimate.requests.toLocaleString()} note files fetched before the copy</span>}
        {load !== 'light' && <p id="copy-confirm-load" className="copy-confirm-load"><i /> {LOAD_TEXT[load]}</p>}
        <div className="copy-confirm-actions">
          <button type="button" className="presence-info-close" onClick={onCancel}>Cancel</button>
          <button ref={confirmRef} type="button" className="copy-confirm-go" onClick={onConfirm}>Copy {notes}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
