// Closing plate on the Home page, under "Ideas in public": the wiki graph in
// dimmed colour on a dark field, a "WIKI" wordmark and one line, in the spirit
// of a sponsor plate.

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../../config/categories';
import { Logo } from '../icons';
import { GraphThumb, wikiNoteCount } from './GraphThumb';
import '../../styles/wiki-banner.css';

export const WikiBanner: React.FC = () => (
  <div className="home-field-wide wiki-banner-wrap">
    <Link to={secondBrainPath()} className="wiki-banner" aria-label="Open the wiki">
      <span className="wb-field" aria-hidden="true"><GraphThumb className="graph-thumb" /></span>
      <span className="wb-copy">
        <small>Presented by the second brain</small>
        <strong>{wikiNoteCount} concepts. One graph. No filler.</strong>
        <em>Open the wiki →</em>
      </span>
      <span className="wb-mark" aria-hidden="true"><Logo className="wb-logo" color="currentColor" /><b>Wiki</b></span>
    </Link>
  </div>
);
