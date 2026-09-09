// LinkedFromTestView: a preview of the wiki card's "Linked from" menu with fictitious articles, at
// /test/linked-from. Three chips (one, six and forty articles) sit at the top, the middle and the
// bottom of the page, so the cap on the menu height, its inner scroll and the flip above the chip
// near the bottom edge can all be checked without touching real notes.

import React from 'react';
import { ArticlesChip } from './SecondBrainView';

const CATEGORIES = ['projects', 'essays', 'bits2bricks'] as const;
const WORDS = ['Kalman filters in the field', 'Why the pump failed twice', 'Two tanks and a leak', 'Reading a residual', 'The cost of a false alarm', 'Notes on observability', 'A month of sensor drift', 'What the FDI textbook leaves out', 'Building a fault detector', 'On thresholds and patience', 'Incidence matrices, by hand', 'The valve that lied', 'Structural analysis for engineers', 'Causal substitutions', 'Signals nobody looked at', 'A quiet Simulink model', 'Parity relations, revisited', 'The observer and the plant', 'Debugging a healthy system', 'When the model is wrong'];

const fake = (n: number) => Array.from({ length: n }, (_, i) => ({
  id: `fake-${i}`,
  title: `${WORDS[i % WORDS.length]}${i >= WORDS.length ? ` (${Math.floor(i / WORDS.length) + 1})` : ''}`,
  category: CATEGORIES[i % CATEGORIES.length],
}));

const Row: React.FC<{ label: string; count: number; style: React.CSSProperties }> = ({ label, count, style }) => (
  <div style={{ position: 'fixed', left: '50%', width: 'min(36rem, calc(100vw - 2rem))', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.8rem 1rem', border: '1px solid var(--hub-sidebar-border)', background: 'var(--hub-sidebar-bg)', ...style }}>
    <span style={{ font: '500 .8rem/1.3 var(--font-mono)', color: 'var(--text-secondary)' }}>{label}</span>
    <ArticlesChip articles={fake(count)} />
  </div>
);

// The rows are pinned to the viewport so the bottom chip sits near the edge regardless of the layout.
export const LinkedFromTestView: React.FC = () => (
  <div style={{ minHeight: '60vh' }}>
    <Row label="top of the page · 1 article" count={1} style={{ top: '2rem' }} />
    <Row label="middle · 6 articles" count={6} style={{ top: '50%', transform: 'translate(-50%, -50%)' }} />
    <Row label="bottom · 40 articles (flips upward, scrolls inside)" count={40} style={{ bottom: '5.5rem' }} />
  </div>
);
