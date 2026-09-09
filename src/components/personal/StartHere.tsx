// Four doors (wiki, pinned essay, a project, a Bits2Bricks lesson) in one
// column-width carousel that sits under the Home intro: picture full-bleed,
// four progress segments on top, kicker, title and one summary line bottom-left, halves to move. Progress
// is driven in script; a hover does not stop the rotation, it restarts the live
// segment's countdown from zero so the door stays a full turn under the pointer.
// Every door sets --sh-accent to its category accent.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../../data/postSummaries';
import type { PostSummary } from '../../types';
import { catAccentVar, postPath, secondBrainPath } from '../../config/categories';
import { cdn } from '../../lib/cdn';
import { GraphThumb } from './GraphThumb';
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
  line: string;         // one small line that sums the whole piece up
  to: string;
  accent: string;       // CSS var reference
  post?: PostSummary;
  image?: string;       // backdrop for doors without a post (CDN url)
}

const byId = (id: string) => posts.find(post => post.id === id);

function buildDoors(): Door[] {
  const essay = byId(ESSAY_ID), project = byId(PROJECT_ID), b2b = byId(B2B_ID);
  const doors: Door[] = [
    { key: 'wiki', ref: 'A', kicker: 'Follow a concept', title: 'How systems respond to themselves', line: 'Feedback, its sign, and why the sign alone never decides stability.', to: secondBrainPath('iOGYFvso'), accent: catAccentVar('wikinotes'), image: cdn('site/home/carousel-feedback-loops.webp') },
  ];
  if (essay) doors.push({ key: 'essay', ref: 'B', kicker: 'Read an argument', title: essay.displayTitle || essay.title, line: 'Astra arrives early. What it changes, and the one advantage that does not scale.', to: postPath(essay.category, essay.id), accent: catAccentVar('essays'), post: essay });
  if (project) doors.push({ key: 'project', ref: 'C', kicker: 'Explore an experiment', title: project.displayTitle || project.title, line: 'Two models forecast simulated auras. The real result is what they may claim.', to: postPath(project.category, project.id), accent: catAccentVar('projects'), post: project });
  if (b2b) doors.push({ key: 'b2b', ref: 'D', kicker: 'Understand a mechanism', title: b2b.displayTitle || b2b.title, line: 'Structural analysis yields four residuals that detect and isolate leak, valve, pump and sensor faults.', to: postPath(b2b.category, b2b.id), accent: catAccentVar('bits2bricks'), post: b2b });
  return doors;
}

const DOORS = buildDoors();
const doorStyle = (door: Door) => ({ '--sh-accent': door.accent } as React.CSSProperties);

/* Backdrop for one door: its own art or the post thumbnail; the wiki door falls back to the graph as the wiki paints it. */
const Visual: React.FC<{ door: Door }> = ({ door }) => {
  const src = door.image ?? door.post?.thumbnail;
  if (src) return <span className="sh-visual sh-visual-thumb"><img src={src} alt="" loading="lazy" /></span>;
  return door.key === 'wiki'
    ? <span className="sh-visual sh-visual-graph"><GraphThumb className="graph-thumb" tone="purple" /></span>
    : <span className="sh-visual sh-visual-thumb"><i>{door.ref}</i></span>;
};

export const StartHere: React.FC = () => {
  const [index, setIndex] = useState(0);
  // Progress is written straight to the live segment's DOM node, never through React state:
  // a setState per animation frame kept React Router's navigation transition pending forever
  // in dev mode (the URL changed but the page never re-rendered).
  const elapsedRef = useRef(0);
  const liveBarRef = useRef<HTMLElement | null>(null);
  const paintBar = useCallback(() => {
    const bar = liveBarRef.current;
    if (bar) bar.style.transform = `scaleX(${elapsedRef.current / ROTATE_MS})`;
  }, []);
  const restartBar = useCallback(() => { elapsedRef.current = 0; paintBar(); }, [paintBar]);
  const go = useCallback((next: number) => {
    elapsedRef.current = 0;
    setIndex(((next % DOORS.length) + DOORS.length) % DOORS.length);
  }, []);
  // The countdown never pauses: hovering only restarts it.
  useEffect(() => {
    if (DOORS.length < 2) return;
    let frame = 0;
    let last = performance.now();
    paintBar();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      if (elapsedRef.current >= ROTATE_MS) {
        elapsedRef.current = 0;
        setIndex(current => (current + 1) % DOORS.length);
        return;
      }
      paintBar();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, paintBar]);
  if (DOORS.length === 0) return null;
  const door = DOORS[index];
  return (
    <div className="sh-card sh-stories" style={doorStyle(door)} onMouseEnter={restartBar} onFocus={restartBar}>
      <div className="sh-card-backdrop" aria-hidden="true">
        {DOORS.map((item, i) => <div key={item.key} className={`sh-card-layer${i === index ? ' is-active' : ''}`}><Visual door={item} /></div>)}
      </div>
      <div className="sh-stories-segments" role="tablist" aria-label="Start here">
        {DOORS.map((item, i) => (
          <button key={item.key} type="button" role="tab" aria-selected={i === index} aria-label={`${item.ref} · ${item.kicker}`} style={doorStyle(item)} className={i < index ? 'is-done' : i === index ? 'is-live' : ''} onClick={() => go(i)}>
            <i ref={i === index ? liveBarRef : undefined} style={i === index ? { transform: 'scaleX(0)' } : undefined} />
          </button>
        ))}
      </div>
      <button type="button" className="sh-stories-half sh-stories-prev" aria-label="Previous" onClick={() => go(index - 1)} />
      <button type="button" className="sh-stories-half sh-stories-next" aria-label="Next" onClick={() => go(index + 1)} />
      <Link key={door.key} to={door.to} className="sh-card-copy">
        <small>{door.kicker}</small>
        <strong>{door.title}</strong>
        <span>{door.line}</span>
      </Link>
    </div>
  );
};
