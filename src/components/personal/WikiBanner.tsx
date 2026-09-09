// Wiki block on the home page, under "Ideas in public": a strip along the top
// of the box (the wiki on the left, the note count with the brain on the
// right), the line and its sentence, the domain mosaic (WikiTerritories, laid
// out like the Field of view map) and the console capture peeking in from the
// bottom edge of the box.

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainGraphPath } from '../../config/categories';
import { WikiBrainIcon } from '../icons';
import { wikiNoteCount } from './GraphThumb';
import { WikiTerritories } from './WikiTerritories';
import '../../styles/wiki-banner.css';

const LINE = 'Find the ideas behind the work.';
const SENTENCE = 'The notes behind the work, connected to each other.';

export const WikiBanner: React.FC = () => (
  <div className="home-field-wide wiki-banner-wrap">
    <div className="wiki-banner">
      <div className="wb-strip">
        <span><b>The wiki</b> · connected working notes</span>
        <span className="wb-strip-count"><WikiBrainIcon size={13} /> {wikiNoteCount} notes</span>
      </div>
      <div className="wb-intro">
        <strong className="wb-line">{LINE}</strong>
        <p className="wb-explain">{SENTENCE}</p>
      </div>
      <WikiTerritories />
      {/* The console itself, peeking in from the bottom edge of the box at its real size, cut by the frame. */}
      <Link to={secondBrainGraphPath()} className="wb-window" aria-label="Open the wiki console">
        <span className="wb-window-bar"><i /><i /><i /><b>infraphysics.net/wiki</b></span>
        <span className="wb-shot">
          <img className="wb-shot-dark" src="/home-wiki-dark.png" alt="" loading="lazy" width={1040} height={560} />
          <img className="wb-shot-light" src="/home-wiki-light.png" alt="" loading="lazy" width={1040} height={560} />
          <span className="wb-shot-cta"><WikiBrainIcon size={14} /> Open the console <b aria-hidden="true">→</b></span>
        </span>
      </Link>
    </div>
  </div>
);
