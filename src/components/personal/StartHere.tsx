// "Start here" on the Home page: four doors (wiki, pinned essay, a project, a
// Bits2Bricks lesson) in one column-width carousel that rotates through
// A/B/C/D. Variant 0 is the one on /home; /r1 … /r6 show alternative carousel
// compositions with the real page around them so they can be compared. Every
// door sets --sh-accent to its category accent.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../../data/postSummaries';
import type { PostSummary } from '../../types';
import { catAccentVar, postPath, secondBrainPath } from '../../config/categories';
import { GraphThumb, wikiNoteCount } from './GraphThumb';
import '../../styles/start-here.css';

const ESSAY_ID = '3358174';   // The years we thought we had (pinned)
const PROJECT_ID = '7654321'; // Forecasting visual auras from event streams
const B2B_ID = '3142718';     // Model-based fault detection in a two-tank system
const ROTATE_MS = 7000;

interface Door {
  key: 'wiki' | 'essay' | 'project' | 'b2b';
  ref: string;          // A / B / C / D
  kicker: string;
  title: string;
  line: string;
  meta: string;
  to: string;
  accent: string;       // CSS var reference
  post?: PostSummary;
}

const byId = (id: string) => posts.find(post => post.id === id);

function buildDoors(): Door[] {
  const essay = byId(ESSAY_ID), project = byId(PROJECT_ID), b2b = byId(B2B_ID);
  const doors: Door[] = [
    { key: 'wiki', ref: 'A', kicker: 'Wiki', title: 'One graph, every concept I keep.', line: 'Short notes on ML, hardware, infrastructure and systems, linked into a graph you can walk.', meta: `${wikiNoteCount} notes`, to: secondBrainPath(), accent: catAccentVar('fieldnotes') },
  ];
  if (essay) doors.push({ key: 'essay', ref: 'B', kicker: 'Essay', title: essay.displayTitle || essay.title, line: essay.subtitle || essay.description || '', meta: essay.date, to: postPath(essay.category, essay.id), accent: catAccentVar('essays'), post: essay });
  if (project) doors.push({ key: 'project', ref: 'C', kicker: 'Project', title: project.displayTitle || project.title, line: project.description || '', meta: [('status' in project ? project.status : null), project.date].filter(Boolean).join(' · '), to: postPath(project.category, project.id), accent: catAccentVar('projects'), post: project });
  if (b2b) doors.push({ key: 'b2b', ref: 'D', kicker: 'Bits2Bricks', title: b2b.displayTitle || b2b.title, line: b2b.description || '', meta: b2b.date, to: postPath(b2b.category, b2b.id), accent: catAccentVar('bits2bricks'), post: b2b });
  return doors;
}

const DOORS = buildDoors();
const doorStyle = (door: Door) => ({ '--sh-accent': door.accent } as React.CSSProperties);

/* Backdrop for one door: the graph in the wiki's purple ramp on a drafting grid, or the thumbnail. */
const Visual: React.FC<{ door: Door }> = ({ door }) => door.key === 'wiki'
  ? <span className="sh-visual sh-visual-graph"><GraphThumb className="graph-thumb" tone="purple" /></span>
  : <span className="sh-visual sh-visual-thumb">{door.post?.thumbnail ? <img src={door.post.thumbnail} alt="" loading="lazy" /> : <i>{door.ref}</i>}</span>;

/* Shared rotation: auto-advance, paused while hovered or focused. */
function useRotation() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (paused || DOORS.length < 2) return;
    timer.current = window.setTimeout(() => setIndex(current => (current + 1) % DOORS.length), ROTATE_MS);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [index, paused]);
  const go = useCallback((next: number) => setIndex(((next % DOORS.length) + DOORS.length) % DOORS.length), []);
  const pauseProps = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false) };
  return { index, go, paused, pauseProps };
}

const Layers: React.FC<{ index: number }> = ({ index }) => (
  <div className="sh-card-backdrop" aria-hidden="true">
    {DOORS.map((item, i) => <div key={item.key} className={`sh-card-layer${i === index ? ' is-active' : ''}`}><Visual door={item} /></div>)}
  </div>
);

const Progress: React.FC<{ door: Door; paused: boolean }> = ({ door, paused }) => (
  <span className="sh-card-progress" aria-hidden="true"><i key={`${door.key}-${paused ? 'p' : 'r'}`} className={paused ? 'is-paused' : ''} /></span>
);

const Copy: React.FC<{ door: Door; showLine?: boolean }> = ({ door, showLine = true }) => (
  <Link key={door.key} to={door.to} className="sh-card-copy">
    <small>{door.ref} · {door.kicker} · {door.meta}</small>
    <strong>{door.title}</strong>
    {showLine && <span>{door.line}</span>}
    <em>Open →</em>
  </Link>
);

/* 0. Tabs: letters top-left, arrows top-right, copy bottom-left over the backdrop. */
const Tabs: React.FC = () => {
  const { index, go, paused, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-card" style={doorStyle(door)} {...pauseProps}>
      <Layers index={index} />
      <div className="sh-card-bar">
        <div className="sh-card-tabs" role="tablist" aria-label="Start here">
          {DOORS.map((item, i) => <button key={item.key} type="button" role="tab" aria-selected={i === index} style={doorStyle(item)} className={i === index ? 'is-active' : ''} onMouseEnter={() => go(i)} onClick={() => go(i)}>{item.ref}</button>)}
        </div>
        <div className="sh-card-controls">
          <button type="button" aria-label="Previous" onClick={() => go(index - 1)}>‹</button>
          <button type="button" aria-label="Next" onClick={() => go(index + 1)}>›</button>
        </div>
      </div>
      <Copy door={door} />
      <Progress door={door} paused={paused} />
    </div>
  );
};

/* 1. Filmstrip: the picture fills the card, four thumbnails below drive it. */
const Filmstrip: React.FC = () => {
  const { index, go, paused, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-filmstrip" {...pauseProps}>
      <div className="sh-card sh-card-tall" style={doorStyle(door)}>
        <Layers index={index} />
        <Copy door={door} />
        <Progress door={door} paused={paused} />
      </div>
      <div className="sh-filmstrip-strip" role="tablist" aria-label="Start here">
        {DOORS.map((item, i) => (
          <button key={item.key} type="button" role="tab" aria-selected={i === index} style={doorStyle(item)} className={`sh-filmstrip-thumb${i === index ? ' is-active' : ''}`} onMouseEnter={() => go(i)} onClick={() => go(i)}>
            <Visual door={item} />
            <span><b>{item.ref}</b>{item.kicker}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* 2. Split: square picture on the left, copy on the right, letter rail at the edge. */
const Split: React.FC = () => {
  const { index, go, paused, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-split" style={doorStyle(door)} {...pauseProps}>
      <div className="sh-split-visual"><Layers index={index} /></div>
      <div className="sh-split-copy">
        <Copy door={door} />
        <div className="sh-card-controls">
          <button type="button" aria-label="Previous" onClick={() => go(index - 1)}>‹</button>
          <button type="button" aria-label="Next" onClick={() => go(index + 1)}>›</button>
        </div>
      </div>
      <div className="sh-split-rail" role="tablist" aria-label="Start here">
        {DOORS.map((item, i) => <button key={item.key} type="button" role="tab" aria-selected={i === index} style={doorStyle(item)} className={i === index ? 'is-active' : ''} onMouseEnter={() => go(i)} onClick={() => go(i)}>{item.ref}</button>)}
      </div>
      <Progress door={door} paused={paused} />
    </div>
  );
};

/* 3. Band: a short strip, small picture, one-line copy, the letters at the end. */
const Band: React.FC = () => {
  const { index, go, paused, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-band" style={doorStyle(door)} {...pauseProps}>
      <div className="sh-band-visual"><Layers index={index} /></div>
      <Copy door={door} showLine={false} />
      <div className="sh-band-letters" role="tablist" aria-label="Start here">
        {DOORS.map((item, i) => <button key={item.key} type="button" role="tab" aria-selected={i === index} style={doorStyle(item)} className={i === index ? 'is-active' : ''} onMouseEnter={() => go(i)} onClick={() => go(i)}>{item.ref}</button>)}
      </div>
      <Progress door={door} paused={paused} />
    </div>
  );
};

/* 4. Stories: four segments on top, picture full-bleed, tap the halves to move. */
const Stories: React.FC = () => {
  const { index, go, paused, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-card sh-card-tall sh-stories" style={doorStyle(door)} {...pauseProps}>
      <Layers index={index} />
      <div className="sh-stories-segments" aria-hidden="true">
        {DOORS.map((item, i) => <span key={item.key} className={i < index ? 'is-done' : i === index ? 'is-live' : ''}><i key={`${door.key}-${paused ? 'p' : 'r'}`} className={paused ? 'is-paused' : ''} /></span>)}
      </div>
      <button type="button" className="sh-stories-half sh-stories-prev" aria-label="Previous" onClick={() => go(index - 1)} />
      <button type="button" className="sh-stories-half sh-stories-next" aria-label="Next" onClick={() => go(index + 1)} />
      <Copy door={door} />
    </div>
  );
};

/* 5. Ledger: the four titles listed on the left, the picture on the right follows. */
const Ledger: React.FC = () => {
  const { index, go, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-ledger" style={doorStyle(door)} {...pauseProps}>
      <ol className="sh-ledger-list" role="tablist" aria-label="Start here">
        {DOORS.map((item, i) => (
          <li key={item.key} style={doorStyle(item)} className={i === index ? 'is-active' : ''}>
            <Link to={item.to} role="tab" aria-selected={i === index} onMouseEnter={() => go(i)} onFocus={() => go(i)}>
              <span>{item.ref}</span>
              <strong>{item.title}</strong>
              <small>{item.kicker} · {item.meta}</small>
            </Link>
          </li>
        ))}
      </ol>
      <Link to={door.to} className="sh-ledger-visual" aria-label={door.title}><Layers index={index} /><em>Open →</em></Link>
    </div>
  );
};

/* 6. Deck: three cards in view, the active one in front, the neighbours peeking. */
const Deck: React.FC = () => {
  const { index, go, pauseProps } = useRotation();
  const door = DOORS[index];
  return (
    <div className="sh-deck" style={doorStyle(door)} {...pauseProps}>
      {DOORS.map((item, i) => {
        const offset = ((i - index) % DOORS.length + DOORS.length) % DOORS.length; // 0 active, 1 next, n-1 previous
        const slot = offset === 0 ? 'is-active' : offset === 1 ? 'is-next' : offset === DOORS.length - 1 ? 'is-prev' : 'is-hidden';
        return (
          <div key={item.key} className={`sh-deck-card ${slot}`} style={doorStyle(item)} onClick={() => { if (offset !== 0) go(i); }}>
            <Visual door={item} />
            {offset === 0 ? <Copy door={item} /> : <span className="sh-deck-label"><b>{item.ref}</b>{item.kicker}</span>}
          </div>
        );
      })}
    </div>
  );
};

const VARIANTS: Record<number, { name: string; render: React.FC }> = {
  0: { name: 'Tabs', render: Tabs },
  1: { name: 'Filmstrip', render: Filmstrip },
  2: { name: 'Split', render: Split },
  3: { name: 'Band', render: Band },
  4: { name: 'Stories', render: Stories },
  5: { name: 'Ledger', render: Ledger },
  6: { name: 'Deck', render: Deck },
};
export const START_HERE_VARIANTS = [1, 2, 3, 4, 5, 6];

export const StartHere: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const spec = VARIANTS[variant] ?? VARIANTS[0];
  const Render = spec.render;
  if (DOORS.length === 0) return null;
  return (
    <section className={`start-here start-here-${variant} border-t border-th-border pt-8 md:pt-12 pb-10 md:pb-16`}>
      <div className="home-editorial-heading">
        <div>
          <h2>Start here</h2>
          <p>Four doors: the graph, an essay, a project, a lesson.</p>
        </div>
        {variant > 0 && <span className="start-here-tag">R{variant} · {spec.name}</span>}
      </div>
      <Render />
    </section>
  );
};
