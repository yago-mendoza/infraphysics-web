// Four doors (wiki, pinned essay, a project, a Bits2Bricks lesson) in one
// column-width carousel that sits under the Home intro: picture full-bleed,
// four progress segments on top, copy bottom-left, halves to move. Progress
// is driven in script so a hover freezes it and the bar resumes where it was.
// Every door sets --sh-accent to its category accent.

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

/* Backdrop for one door: the 2D graph in dulled brand oxide on a drafting grid, or the thumbnail. */
const Visual: React.FC<{ door: Door }> = ({ door }) => door.key === 'wiki'
  ? <span className="sh-visual sh-visual-graph"><GraphThumb className="graph-thumb" /></span>
  : <span className="sh-visual sh-visual-thumb">{door.post?.thumbnail ? <img src={door.post.thumbnail} alt="" loading="lazy" /> : <i>{door.ref}</i>}</span>;

export const StartHere: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 of the current door
  const elapsedRef = useRef(0);
  const go = useCallback((next: number) => {
    elapsedRef.current = 0;
    setProgress(0);
    setIndex(((next % DOORS.length) + DOORS.length) % DOORS.length);
  }, []);
  // Elapsed time accumulates only while not paused, so a hover freezes the
  // bar in place and the countdown resumes from there.
  useEffect(() => {
    if (paused || DOORS.length < 2) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      if (elapsedRef.current >= ROTATE_MS) {
        elapsedRef.current = 0;
        setProgress(0);
        setIndex(current => (current + 1) % DOORS.length);
      } else {
        setProgress(elapsedRef.current / ROTATE_MS);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, index]);
  if (DOORS.length === 0) return null;
  const door = DOORS[index];
  return (
    <div className="sh-card sh-stories" style={doorStyle(door)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="sh-card-backdrop" aria-hidden="true">
        {DOORS.map((item, i) => <div key={item.key} className={`sh-card-layer${i === index ? ' is-active' : ''}`}><Visual door={item} /></div>)}
      </div>
      <div className="sh-stories-segments" role="tablist" aria-label="Start here">
        {DOORS.map((item, i) => (
          <button key={item.key} type="button" role="tab" aria-selected={i === index} aria-label={`${item.ref} · ${item.kicker}`} style={doorStyle(item)} className={i < index ? 'is-done' : i === index ? 'is-live' : ''} onClick={() => go(i)}>
            <i style={i === index ? { transform: `scaleX(${progress})` } : undefined} />
          </button>
        ))}
      </div>
      <button type="button" className="sh-stories-half sh-stories-prev" aria-label="Previous" onClick={() => go(index - 1)} />
      <button type="button" className="sh-stories-half sh-stories-next" aria-label="Next" onClick={() => go(index + 1)} />
      <Link key={door.key} to={door.to} className="sh-card-copy">
        <small>{door.ref} · {door.kicker} · {door.meta}</small>
        <strong>{door.title}</strong>
        <span>{door.line}</span>
        <em>Open →</em>
      </Link>
    </div>
  );
};
