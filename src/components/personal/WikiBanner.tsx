// Closing plate on the Home page, under "Ideas in public": a real capture of
// the wiki console (mini graph, directory, calendar) beside a short line and
// a small plate with the brain mark. The captures live in public/ as
// home-wiki-dark.png and home-wiki-light.png; retake them when the wiki UI
// changes (1440px viewport, 2x, clip 1040x560 from y=42).

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../../config/categories';
import { WikiBrainIcon } from '../icons';
import { wikiNoteCount } from './GraphThumb';
import '../../styles/wiki-banner.css';

export const WikiBanner: React.FC = () => (
  <div className="home-field-wide wiki-banner-wrap">
    <Link to={secondBrainPath()} className="wiki-banner" aria-label="Open the wiki">
      <span className="wb-copy">
        <small>The wiki</small>
        <strong>{wikiNoteCount} short notes, linked to each other.</strong>
        <em>Open the wiki →</em>
        <span className="wb-mark" aria-hidden="true"><WikiBrainIcon className="wb-logo" size={18} /><b>Wiki</b></span>
      </span>
      <span className="wb-shot" aria-hidden="true">
        <img className="wb-shot-dark" src="/home-wiki-dark.png" alt="" loading="lazy" width={1040} height={560} />
        <img className="wb-shot-light" src="/home-wiki-light.png" alt="" loading="lazy" width={1040} height={560} />
      </span>
    </Link>
  </div>
);
