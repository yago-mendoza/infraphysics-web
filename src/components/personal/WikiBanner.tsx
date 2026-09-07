// Closing plate on the Home page, under "Ideas in public": a frozen 3D view
// of the wiki graph in dulled brand oxide on a dark field, a small plate with
// the brain mark, and one plain line.

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../../config/categories';
import { WikiBrainIcon } from '../icons';
import { wikiNoteCount } from './GraphThumb';
import { GraphThumb3D } from './GraphThumb3D';
import '../../styles/wiki-banner.css';

export const WikiBanner: React.FC = () => (
  <div className="home-field-wide wiki-banner-wrap">
    <Link to={secondBrainPath()} className="wiki-banner" aria-label="Open the wiki">
      <span className="wb-field" aria-hidden="true"><GraphThumb3D className="graph-thumb" /></span>
      <span className="wb-copy">
        <small>The wiki</small>
        <strong>{wikiNoteCount} short notes on the concepts I work with, linked to each other.</strong>
        <em>Open the wiki →</em>
      </span>
      <span className="wb-mark" aria-hidden="true"><WikiBrainIcon className="wb-logo" size={18} /><b>Wiki</b></span>
    </Link>
  </div>
);
