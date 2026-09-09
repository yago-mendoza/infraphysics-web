// OgCardView: one share card at its exact size, alone on the screen, for scripts/og-cards.js to
// photograph. Dev-only route: /og/card/<kind>/<id>. The card is fixed over everything else, so a
// 1200 x 630 viewport captures nothing but the card. It is a portal on body: inside the layout it
// would sit in main's stacking context, under the nav and the footer. When its fonts and images are in, it flags
// window.__ogReady so the script knows when to shoot.

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import type { WikiNoteMeta } from '../types';
import { DESIGNS } from './shareCardDesigns';
import { cardFor } from '../lib/shareCards';
import '../styles/share-cards.css';

declare global { interface Window { __ogReady?: boolean; } }

export const OgCardView: React.FC = () => {
  const { kind = '', id = '' } = useParams<{ kind: string; id: string }>();
  const [notes, setNotes] = useState<WikiNoteMeta[] | null>(kind === 'wiki' ? null : []);
  useEffect(() => {
    if (kind !== 'wiki') return;
    fetch('/wikinotes-index.json').then(res => res.json()).then((data: WikiNoteMeta[] | { notes: WikiNoteMeta[] }) => setNotes(Array.isArray(data) ? data : data.notes)).catch(() => setNotes([]));
  }, [kind]);
  const card = notes ? cardFor(kind, id, notes) : null;

  useEffect(() => {
    window.__ogReady = false;
    if (!card) return;
    let cancelled = false;
    const settle = async () => {
      await document.fonts.ready;
      const images = Array.from(document.images).filter(img => !img.complete);
      await Promise.all(images.map(img => new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve(); })));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!cancelled) window.__ogReady = true;
    };
    void settle();
    return () => { cancelled = true; };
  }, [card]);

  if (!notes) return null;
  if (!card) return <p className="sc-empty" style={{ padding: '2rem' }}>No card for {kind}/{id}.</p>;
  return createPortal(
    <div className="og-stage">
      <div className="sc-accent" style={{ '--sc-accent': card.data.accent } as React.CSSProperties}>
        {React.createElement(DESIGNS[card.data.kind], { data: card.data, variant: 'a' })}
      </div>
    </div>,
    document.body,
  );
};
