// Closing strip on the Home page, under the field map: the wiki graph as a
// muted backdrop with a "WIKI" wordmark, in the spirit of a sponsor plate.
// Variants (one per /s route) try different treatments of the graph: mono
// oxide, desaturated colour, ink on paper, blueprint blue, nodes only.

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../../config/categories';
import { Logo } from '../icons';
import { GraphThumb, wikiNoteCount } from './GraphThumb';
import '../../styles/wiki-banner.css';

const TREATMENTS: Record<number, { name: string; tone: string; layout: 'right' | 'split' | 'strip' | 'overlay' }> = {
  0: { name: 'Muted colour', tone: 'wb-muted', layout: 'right' },
  1: { name: 'Mono oxide', tone: 'wb-oxide', layout: 'right' },
  2: { name: 'Muted colour', tone: 'wb-muted', layout: 'split' },
  3: { name: 'Ink on paper', tone: 'wb-ink', layout: 'right' },
  4: { name: 'Blueprint', tone: 'wb-blueprint', layout: 'split' },
  5: { name: 'Strip', tone: 'wb-oxide', layout: 'strip' },
  6: { name: 'Dimmed colour', tone: 'wb-dim', layout: 'overlay' },
  7: { name: 'Nodes only, oxide', tone: 'wb-oxide wb-nodes-only', layout: 'overlay' },
  8: { name: 'Ink, nodes only', tone: 'wb-ink wb-nodes-only', layout: 'strip' },
};

export const WikiBanner: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const spec = TREATMENTS[variant] ?? TREATMENTS[0];
  return (
    <div className="home-field-wide wiki-banner-wrap">
      <Link to={secondBrainPath()} className={`wiki-banner wb-${spec.layout} ${spec.tone}`} aria-label="Open the wiki">
        <span className="wb-field" aria-hidden="true"><GraphThumb className="graph-thumb" /></span>
        <span className="wb-copy">
          <small>Presented by the second brain</small>
          <strong>{wikiNoteCount} concepts. One graph. No filler.</strong>
          <em>Open the wiki →</em>
        </span>
        <span className="wb-mark" aria-hidden="true"><Logo className="wb-logo" color="currentColor" /><b>Wiki</b></span>
        {variant > 0 && <span className="wb-tag">S{variant} · {spec.name} · {spec.layout}</span>}
      </Link>
    </div>
  );
};
