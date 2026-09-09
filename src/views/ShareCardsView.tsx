// ShareCardsView: a gallery of the share cards (the image WhatsApp, X, LinkedIn or Telegram show when a
// link is pasted) at their real size, 1200 x 630, scaled to fit. Dev-only route: /og and
// /og/<kind>/<a|b>. The single-card render route the capture script uses is OgCardView.

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { postSummaries } from '../data/postSummaries';
import { secondBrainPath, postPath } from '../config/categories';
import type { WikiNoteMeta } from '../types';
import { DESIGNS, type CardData, type CardKind, type Variant } from './shareCardDesigns';
import { PAGES, PLAYGROUNDS, SECTIONS, fromNote, fromPage, fromPlayground, fromPost, fromSection, playgroundPath } from '../lib/shareCards';
import '../styles/share-cards.css';

const KINDS: CardKind[] = ['article', 'playground', 'wiki', 'section', 'page'];

/* A card at its real size, scaled to fit, with the crop guides and its url. */
const Frame: React.FC<{ url: string; children: React.ReactNode }> = ({ url, children }) => {
  const [guides, setGuides] = useState(false);
  return (
    <figure className="sc-frame">
      <figcaption><code>{url}</code><button type="button" onClick={() => setGuides(g => !g)}>{guides ? 'hide crops' : 'show crops'}</button></figcaption>
      <div className="sc-stage"><div className="sc-scale">
        {children}
        {guides && <div className="sc-guides" aria-hidden="true"><i className="g-191"><b>1.91:1 · WhatsApp, LinkedIn, Telegram</b></i><i className="g-2"><b>2:1 · X</b></i><i className="g-1"><b>1:1 · small thumbnail (fallback)</b></i></div>}
      </div></div>
    </figure>
  );
};

export const ShareCardsView: React.FC = () => {
  const params = useParams<{ kind?: string; variant?: string }>();
  const kind: CardKind = KINDS.includes(params.kind as CardKind) ? (params.kind as CardKind) : 'article';
  const variant: Variant = params.variant === 'b' ? 'b' : 'a';

  const [notes, setNotes] = useState<WikiNoteMeta[]>([]);
  useEffect(() => {
    fetch('/wikinotes-index.json').then(res => res.json()).then((data: WikiNoteMeta[] | { notes: WikiNoteMeta[] }) => {
      const all = Array.isArray(data) ? data : data.notes;
      setNotes([all.find(n => !n.address.includes('//')), all.find(n => n.address.split('//').length >= 3), [...all].sort((a, b) => b.title.length - a.title.length)[0]].filter(Boolean) as WikiNoteMeta[]);
    }).catch(() => {});
  }, []);

  const cards = useMemo<{ url: string; data: CardData }[]>(() => {
    if (kind === 'article') {
      const byCat = (cat: string, n: number) => postSummaries.filter(p => p.category === cat).slice(0, n);
      return [...byCat('projects', 2), ...byCat('essays', 2), ...byCat('bits2bricks', 2)].map(post => ({ url: postPath(post.category, post.id), data: fromPost(post) }));
    }
    if (kind === 'playground') return PLAYGROUNDS.map(pg => ({ url: playgroundPath(pg), data: fromPlayground(pg) })).filter((c): c is { url: string; data: CardData } => c.data !== null);
    if (kind === 'wiki') return notes.map(note => ({ url: secondBrainPath(note.id), data: fromNote(note) }));
    if (kind === 'section') return SECTIONS.map(section => ({ url: section.to, data: fromSection(section) }));
    return PAGES.map(page => ({ url: page.to, data: fromPage(page) }));
  }, [kind, notes]);

  return (
    <div className="sc-page-wrap">
      <header className="sc-head">
        <h1>Share cards</h1>
        <p>What a link to this site shows when pasted. Every card is 1200 x 630, drawn in CSS with the site's own faces and scaled to fit. Pick the kind of url, then the variant; the url of this page carries both. The files themselves come from <code>npm run og</code>.</p>
        <nav className="sc-select" aria-label="Kind of url">{KINDS.map(k => <Link key={k} to={`/og/${k}/${variant}`} aria-current={k === kind ? 'page' : undefined}>{k}</Link>)}</nav>
        <nav className="sc-select sc-select-v" aria-label="Variant"><Link to={`/og/${kind}/a`} aria-current={variant === 'a' ? 'page' : undefined}>A <span>· plain</span></Link><Link to={`/og/${kind}/b`} aria-current={variant === 'b' ? 'page' : undefined}>B <span>· contour watermark on articles</span></Link></nav>
      </header>
      <section>
        {cards.map(card => (
          <Frame key={card.url} url={`infraphysics.net${card.url}`}>
            <div className="sc-accent" style={{ '--sc-accent': card.data.accent } as React.CSSProperties}>{React.createElement(DESIGNS[card.data.kind], { data: card.data, variant })}</div>
          </Frame>
        ))}
        {cards.length === 0 && <p className="sc-empty">Loading the wiki index…</p>}
      </section>
    </div>
  );
};
