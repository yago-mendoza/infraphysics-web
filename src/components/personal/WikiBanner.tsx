// Closing plate on the Home page, under "Ideas in public": the wiki as the
// sponsor of the whole thing. A short line and the brain plate above a real
// capture of the wiki console, framed as a browser window. The captures live
// in public/ as home-wiki-dark.png and home-wiki-light.png; retake them when
// the wiki UI changes (1440px viewport, 2x, clip 1040x560 from y=42).

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../../config/categories';
import { WikiBrainIcon } from '../icons';
import { wikiNoteCount } from './GraphThumb';
import '../../styles/wiki-banner.css';

const LINE = `${wikiNoteCount} short notes, linked to each other.`;

export const WikiBanner: React.FC = () => (
  <div className="home-field-wide wiki-banner-wrap">
    <Link to={secondBrainPath()} className="wiki-banner" aria-label="Open the wiki">
      <span className="wb-copy">
        <small>The wiki</small>
        <strong>{LINE}</strong>
      </span>
      <span className="wb-foot">
        <span className="wb-mark" aria-hidden="true"><WikiBrainIcon className="wb-logo" size={18} /><b>Wiki</b></span>
        <em>Open the wiki →</em>
      </span>
      <span className="wb-window" aria-hidden="true">
        <span className="wb-window-bar"><i /><i /><i /><b>infraphysics.net/wiki</b></span>
        <span className="wb-shot">
          <img className="wb-shot-dark" src="/home-wiki-dark.png" alt="" loading="lazy" width={1040} height={560} />
          <img className="wb-shot-light" src="/home-wiki-light.png" alt="" loading="lazy" width={1040} height={560} />
        </span>
      </span>
    </Link>
  </div>
);
