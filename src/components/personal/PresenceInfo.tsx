// A very small "i" next to the visit counters. A click opens a card in the
// middle of the screen, over a dimmed page, that says how each number is made.
// Closes on the backdrop, the close button or Escape. Used on the desktop rail
// (AmbientRails) and on the phone strip of the home.

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const LINES: [string, string][] = [
  ['visits', 'sessions: one per person, and a new one after thirty minutes away'],
  ['visitors', 'browsers that have opened the site at least once'],
  ['page views', 'pages opened, counted once per page and session'],
];

export const PresenceInfo: React.FC = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button type="button" className="presence-info" aria-label="How these numbers are counted" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>i</button>
      {open && createPortal(
        <div className="presence-info-veil" onClick={() => setOpen(false)}>
          <div className="presence-info-card" role="dialog" aria-label="How these numbers are counted" onClick={event => event.stopPropagation()}>
            {LINES.map(([name, text]) => <span key={name}><b>{name}</b>{text}</span>)}
            <button type="button" className="presence-info-close" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
