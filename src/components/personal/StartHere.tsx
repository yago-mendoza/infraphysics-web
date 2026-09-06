// "Start here" on the Home page: four doors (wiki, essay, project, Bits2Bricks)
// in one of several layouts. Variant 0 is the current spotlight; /s1 … /s8 show
// the candidates side by side with the real page around them so they can be
// compared. Every variant shares the same data and the same accent cascade
// (--sh-accent per door), only the composition changes.

import React from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../../data/postSummaries';
import type { PostSummary } from '../../types';
import { catAccentVar, postPath, secondBrainPath } from '../../config/categories';
import { GraphThumb, wikiNoteCount } from './GraphThumb';
import '../../styles/start-here.css';

const ESSAY_ID = '3358174';   // The years we thought we had (pinned)
const PROJECT_ID = '7654321'; // Can you forecast a seizure with a spreadsheet and an LSTM?
const B2B_ID = '3142718';     // When an equation notices a leak

interface Door {
  key: 'wiki' | 'essay' | 'project' | 'b2b';
  ref: string;          // A / B / C / D
  kicker: string;       // type label
  title: string;
  line: string;         // one sentence
  meta: string;         // mono detail
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

const Visual: React.FC<{ door: Door; className?: string }> = ({ door, className }) => door.key === 'wiki'
  ? <span className={`sh-visual sh-visual-graph ${className ?? ''}`}><GraphThumb className="graph-thumb" /></span>
  : <span className={`sh-visual sh-visual-thumb ${className ?? ''}`}>{door.post?.thumbnail ? <img src={door.post.thumbnail} alt="" loading="lazy" /> : <i>{door.ref}</i>}</span>;

const doorStyle = (door: Door) => ({ '--sh-accent': door.accent } as React.CSSProperties);

/* 1. Register: a numbered ledger, nothing but rules and type. */
const Register: React.FC = () => (
  <div className="sh-register">
    {DOORS.map((door, index) => (
      <Link key={door.key} to={door.to} className="sh-register-row" style={doorStyle(door)}>
        <span className="sh-register-no">{String(index + 1).padStart(2, '0')}</span>
        <span className="sh-register-kicker">{door.kicker}</span>
        <span className="sh-register-body"><strong>{door.title}</strong><small>{door.line}</small></span>
        <span className="sh-register-meta">{door.meta}</span>
        <span className="sh-register-arrow" aria-hidden="true">→</span>
      </Link>
    ))}
  </div>
);

/* 2. Panel: four plates with engraved labels and a framed window each. */
const Panel: React.FC = () => (
  <div className="sh-panel">
    {DOORS.map(door => (
      <Link key={door.key} to={door.to} className="sh-plate" style={doorStyle(door)}>
        <span className="sh-plate-label"><b>{door.ref}</b><span>{door.kicker}</span><i>{door.meta}</i></span>
        <span className="sh-plate-window"><Visual door={door} /><i className="sh-corner sh-corner-tl" /><i className="sh-corner sh-corner-tr" /><i className="sh-corner sh-corner-bl" /><i className="sh-corner sh-corner-br" /></span>
        <strong className="sh-plate-title">{door.title}</strong>
      </Link>
    ))}
  </div>
);

/* 3. Circuit: one rail, four terminals, drawn like the clock lattice above. */
const Circuit: React.FC = () => (
  <div className="sh-circuit">
    <span className="sh-circuit-start"><i /><b>Start</b></span>
    {DOORS.map(door => (
      <Link key={door.key} to={door.to} className="sh-terminal" style={doorStyle(door)}>
        <span className="sh-terminal-node" aria-hidden="true"><i /></span>
        <span className="sh-terminal-copy"><small>{door.ref} · {door.kicker}</small><strong>{door.title}</strong><em>{door.meta}</em></span>
      </Link>
    ))}
  </div>
);

/* 4. Blueprint: a dark drawing sheet, the graph as backdrop, routes listed on the right. */
const Blueprint: React.FC = () => (
  <div className="sh-blueprint">
    <div className="sh-blueprint-field" aria-hidden="true"><GraphThumb className="graph-thumb" /></div>
    <div className="sh-blueprint-title"><small>Sheet 01 · Entry points</small><strong>Four ways in.</strong></div>
    <ol className="sh-blueprint-list">
      {DOORS.map(door => (
        <li key={door.key}><Link to={door.to} style={doorStyle(door)}>
          <span className="sh-blueprint-ref">{door.ref}</span>
          <span className="sh-blueprint-copy"><small>{door.kicker} · {door.meta}</small><strong>{door.title}</strong></span>
          <span className="sh-blueprint-arrow" aria-hidden="true">→</span>
        </Link></li>
      ))}
    </ol>
  </div>
);

/* 5. Datasheet: a specification table. */
const Datasheet: React.FC = () => (
  <table className="sh-datasheet">
    <thead><tr><th>Ref</th><th>Type</th><th>Entry</th><th className="sh-hide-sm">Why start here</th><th className="sh-hide-sm">Detail</th><th aria-label="Open" /></tr></thead>
    <tbody>
      {DOORS.map(door => (
        <tr key={door.key} style={doorStyle(door)} onClick={() => { window.location.assign(door.to); }}>
          <td className="sh-datasheet-ref">{door.ref}</td>
          <td className="sh-datasheet-type"><i /> {door.kicker}</td>
          <td className="sh-datasheet-entry"><Link to={door.to}><Visual door={door} className="sh-visual-mini" /><strong>{door.title}</strong></Link></td>
          <td className="sh-datasheet-why sh-hide-sm"><span>{door.line}</span></td>
          <td className="sh-datasheet-meta sh-hide-sm">{door.meta}</td>
          <td className="sh-datasheet-arrow" aria-hidden="true">→</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* 6. Gauges: four instruments, each with a dial and a plate. */
const GAUGE_VALUES: Record<Door['key'], number> = { wiki: .86, essay: .34, project: .62, b2b: .48 };
const Dial: React.FC<{ value: number }> = ({ value }) => {
  const angle = -120 + value * 240;
  const ticks = Array.from({ length: 13 }, (_, i) => -120 + i * 20);
  const rad = (deg: number) => (deg - 90) * Math.PI / 180;
  return (
    <svg viewBox="0 0 100 70" className="sh-dial" aria-hidden="true">
      <path d="M 14 62 A 40 40 0 1 1 86 62" className="sh-dial-arc" />
      {ticks.map(t => { const major = (t + 120) % 60 === 0; const r1 = major ? 32 : 36, r2 = 40; return <line key={t} x1={50 + Math.cos(rad(t)) * r1} y1={50 + Math.sin(rad(t)) * r1} x2={50 + Math.cos(rad(t)) * r2} y2={50 + Math.sin(rad(t)) * r2} className={major ? 'sh-dial-tick-major' : 'sh-dial-tick'} />; })}
      <line x1="50" y1="50" x2={50 + Math.cos(rad(angle)) * 30} y2={50 + Math.sin(rad(angle)) * 30} className="sh-dial-needle" />
      <circle cx="50" cy="50" r="2.4" className="sh-dial-hub" />
    </svg>
  );
};
const Gauges: React.FC = () => (
  <div className="sh-gauges">
    {DOORS.map(door => (
      <Link key={door.key} to={door.to} className="sh-gauge" style={doorStyle(door)}>
        <Dial value={GAUGE_VALUES[door.key]} />
        <span className="sh-gauge-plate"><small>{door.ref} · {door.kicker}</small><strong>{door.title}</strong><em>{door.meta}</em></span>
      </Link>
    ))}
  </div>
);

/* 7. Rail: a tick ruler and four monochrome frames with label plates. */
const Rail: React.FC = () => (
  <div className="sh-rail">
    <div className="sh-ruler" aria-hidden="true">{Array.from({ length: 41 }, (_, i) => <i key={i} className={i % 10 === 0 ? 'is-major' : i % 5 === 0 ? 'is-mid' : ''} />)}</div>
    <div className="sh-rail-strip">
      {DOORS.map(door => (
        <Link key={door.key} to={door.to} className="sh-frame" style={doorStyle(door)}>
          <Visual door={door} />
          <span className="sh-frame-plate"><small>{door.ref} · {door.kicker}</small><strong>{door.title}</strong></span>
        </Link>
      ))}
    </div>
  </div>
);

/* 8. Manifest: one sentence and four keycaps. */
const Manifest: React.FC = () => (
  <div className="sh-manifest">
    <p>Ten minutes? Start with one of these.</p>
    <div className="sh-keycaps">
      {DOORS.map(door => (
        <Link key={door.key} to={door.to} className="sh-keycap" style={doorStyle(door)}>
          <span className="sh-keycap-glyph" aria-hidden="true"><b>{door.ref}</b></span>
          <span className="sh-keycap-copy"><small>{door.kicker}</small><strong>{door.title}</strong></span>
        </Link>
      ))}
    </div>
  </div>
);

/* 0. Current spotlight: the pinned piece wide, the graph as its companion. */
const Spotlight: React.FC = () => {
  const essay = DOORS.find(door => door.key === 'essay');
  return (
    <div className="home-spotlight-grid home-field-wide">
      {essay && (
        <Link to={essay.to} className="home-spotlight-card home-spotlight-pinned">
          <span className="home-spotlight-visual home-spotlight-thumb">{essay.post?.thumbnail ? <img src={essay.post.thumbnail} alt="" loading="lazy" /> : <i>E/01</i>}</span>
          <span className="home-spotlight-copy">
            <small>Pinned essay · <time>{essay.meta}</time></small>
            <strong>{essay.title}</strong>
            {essay.line && <span>{essay.line}</span>}
            <em>Read it ↗</em>
          </span>
        </Link>
      )}
      <Link to={secondBrainPath()} className="home-spotlight-card home-spotlight-wiki">
        <span className="home-spotlight-visual"><GraphThumb className="graph-thumb" /></span>
        <span className="home-spotlight-copy">
          <small>Wiki · {wikiNoteCount} notes</small>
          <strong>One graph, every concept I keep.</strong>
          <em>Open the second brain ↗</em>
        </span>
      </Link>
    </div>
  );
};

const VARIANTS: Record<number, { name: string; note: string; render: React.FC; wide?: boolean }> = {
  0: { name: 'Spotlight', note: 'Pinned piece wide, graph beside it.', render: Spotlight },
  1: { name: 'Register', note: 'A numbered ledger. Rules and type only.', render: Register },
  2: { name: 'Panel', note: 'Four plates with engraved labels and framed windows.', render: Panel, wide: true },
  3: { name: 'Circuit', note: 'One rail, four terminals, drawn like the clock lattice.', render: Circuit, wide: true },
  4: { name: 'Blueprint', note: 'A dark drawing sheet with the graph as backdrop.', render: Blueprint, wide: true },
  5: { name: 'Datasheet', note: 'A specification table.', render: Datasheet, wide: true },
  6: { name: 'Gauges', note: 'Four instruments with dials and plates.', render: Gauges, wide: true },
  7: { name: 'Rail', note: 'A tick ruler and four monochrome frames.', render: Rail, wide: true },
  8: { name: 'Manifest', note: 'One sentence and four keycaps.', render: Manifest },
};

export const START_HERE_VARIANTS = Object.keys(VARIANTS).map(Number).filter(n => n > 0);

export const StartHere: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const spec = VARIANTS[variant] ?? VARIANTS[0];
  const Render = spec.render;
  return (
    <section className={`home-spotlight-section start-here start-here-${variant} border-t border-th-border pt-8 md:pt-12 pb-10 md:pb-16`}>
      <div className="home-editorial-heading">
        <div>
          <h2>Start here</h2>
          <p>Four doors: the graph, an essay, a project, a lesson.</p>
        </div>
        {variant > 0 && <span className="start-here-tag">S{variant} · {spec.name}</span>}
      </div>
      <div className={spec.wide ? 'home-field-wide start-here-body' : 'start-here-body'}>
        <Render />
      </div>
    </section>
  );
};
