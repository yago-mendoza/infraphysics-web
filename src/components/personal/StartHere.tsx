// "Start here" on the Home page: four doors (wiki, pinned essay, a project, a
// Bits2Bricks lesson) in one column-width card that rotates through A/B/C/D.
// Hovering a letter previews that door; hovering the card lets the backdrop
// through. An expand toggle lays the four out as a circuit, still inside the
// column. Every door sets --sh-accent to its category accent.

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../../data/postSummaries';
import type { PostSummary } from '../../types';
import { catAccentVar, postPath, secondBrainPath } from '../../config/categories';
import { GraphThumb, wikiNoteCount } from './GraphThumb';
import '../../styles/start-here.css';

const ESSAY_ID = '3358174';   // The years we thought we had (pinned)
const PROJECT_ID = '7654321'; // Can you forecast a seizure with a spreadsheet and an LSTM?
const B2B_ID = '3142718';     // When an equation notices a leak
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
    { key: 'wiki', ref: 'A', kicker: 'Second brain', title: 'One graph, every concept I keep.', line: 'Atomic notes on ML, hardware, infrastructure and systems, linked into a graph you can walk.', meta: `${wikiNoteCount} notes`, to: secondBrainPath(), accent: catAccentVar('fieldnotes') },
  ];
  if (essay) doors.push({ key: 'essay', ref: 'B', kicker: 'Essay', title: essay.displayTitle || essay.title, line: essay.subtitle || essay.description || '', meta: essay.date, to: postPath(essay.category, essay.id), accent: catAccentVar('essays'), post: essay });
  if (project) doors.push({ key: 'project', ref: 'C', kicker: 'Project', title: project.displayTitle || project.title, line: project.description || '', meta: [('status' in project ? project.status : null), project.date].filter(Boolean).join(' · '), to: postPath(project.category, project.id), accent: catAccentVar('projects'), post: project });
  if (b2b) doors.push({ key: 'b2b', ref: 'D', kicker: 'Bits2Bricks', title: b2b.displayTitle || b2b.title, line: b2b.description || '', meta: b2b.date, to: postPath(b2b.category, b2b.id), accent: catAccentVar('bits2bricks'), post: b2b });
  return doors;
}

const DOORS = buildDoors();
const doorStyle = (door: Door) => ({ '--sh-accent': door.accent } as React.CSSProperties);

/* Backdrop for one door: the graph on a drafting grid in page colours, or the thumbnail. */
const Visual: React.FC<{ door: Door }> = ({ door }) => door.key === 'wiki'
  ? <span className="sh-visual sh-visual-graph"><GraphThumb className="graph-thumb" /></span>
  : <span className="sh-visual sh-visual-thumb">{door.post?.thumbnail ? <img src={door.post.thumbnail} alt="" loading="lazy" /> : <i>{door.ref}</i>}</span>;

/* Rotating card. */
const Card: React.FC<{ index: number; onIndex: (next: number) => void; onExpand: () => void }> = ({ index, onIndex, onExpand }) => {
  const door = DOORS[index];
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (paused || DOORS.length < 2) return;
    timer.current = window.setTimeout(() => onIndex((index + 1) % DOORS.length), ROTATE_MS);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [index, paused, onIndex]);
  return (
    <div className="sh-card" style={doorStyle(door)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="sh-card-backdrop" aria-hidden="true">
        {DOORS.map((item, i) => <div key={item.key} className={`sh-card-layer${i === index ? ' is-active' : ''}`}><Visual door={item} /></div>)}
      </div>
      <div className="sh-card-bar">
        <div className="sh-card-tabs" role="tablist" aria-label="Start here">
          {DOORS.map((item, i) => <button key={item.key} type="button" role="tab" aria-selected={i === index} style={doorStyle(item)} className={i === index ? 'is-active' : ''} onMouseEnter={() => onIndex(i)} onClick={() => onIndex(i)}>{item.ref}</button>)}
        </div>
        <div className="sh-card-controls">
          <button type="button" aria-label="Previous" onClick={() => onIndex((index + DOORS.length - 1) % DOORS.length)}>‹</button>
          <button type="button" aria-label="Next" onClick={() => onIndex((index + 1) % DOORS.length)}>›</button>
          <button type="button" aria-label="Show all four" title="Show all four" onClick={onExpand}>⤢</button>
        </div>
      </div>
      <Link key={door.key} to={door.to} className="sh-card-copy">
        <small>{door.ref} · {door.kicker} · {door.meta}</small>
        <strong>{door.title}</strong>
        <span>{door.line}</span>
        <em>Open →</em>
      </Link>
      <span className="sh-card-progress" aria-hidden="true"><i key={`${door.key}-${paused ? 'p' : 'r'}`} className={paused ? 'is-paused' : ''} /></span>
    </div>
  );
};

/* Circuit: one vertical rail, four terminals, inside the column. */
const Circuit: React.FC<{ onCollapse: () => void }> = ({ onCollapse }) => (
  <div className="sh-circuit">
    <span className="sh-circuit-start"><i /><b>Start</b><button type="button" aria-label="Show one at a time" title="Show one at a time" onClick={onCollapse}>⤡</button></span>
    {DOORS.map(door => (
      <Link key={door.key} to={door.to} className="sh-terminal" style={doorStyle(door)}>
        <span className="sh-terminal-node" aria-hidden="true"><i /></span>
        <span className="sh-terminal-copy"><small>{door.ref} · {door.kicker}</small><strong>{door.title}</strong><em>{door.meta}</em></span>
      </Link>
    ))}
  </div>
);

export const StartHere: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  if (DOORS.length === 0) return null;
  return (
    <section className="start-here border-t border-th-border pt-8 md:pt-12 pb-10 md:pb-16">
      <div className="home-editorial-heading">
        <div>
          <h2>Start here</h2>
          <p>Four doors: the graph, an essay, a project, a lesson.</p>
        </div>
      </div>
      {expanded ? <Circuit onCollapse={() => setExpanded(false)} /> : <Card index={index} onIndex={setIndex} onExpand={() => setExpanded(true)} />}
    </section>
  );
};
