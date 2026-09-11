import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CLOCK_DEFAULTS, type ClockParams } from '../../legacy/home-visuals/HomeVisualLabEngine';
import '../../styles/home-clock-lab.css';

/**
 * The home clock lab (dev routes /home1 … /home10). Every route is the real /home; only the clock field's
 * parameters change. Studies 1 to 9 are fixed presets; study 10 is a playground where every adjustable of the
 * field is a slider (`CLOCK_SLIDERS` covers all 25 keys of `ClockParams`).
 */
export const CLOCK_STUDIES: { name: string; note: string; params: Partial<ClockParams> }[] = [
  { name: 'Sparse', note: 'The old lattice: half the columns, faces twice as large, five fields.', params: { cols: 41, rows: 16, faceRadius: 4.7, strokeWidth: 1, foci: 5, fociRadius: 1, baseRed: .18 } },
  { name: 'Dense', note: 'Even finer: a hundred columns of pinpoint faces.', params: { cols: 100, rows: 30, faceRadius: 2, strokeWidth: 1, edgeAlpha: .8 } },
  { name: 'Deep', note: 'The lattice keeps going down behind the text.', params: { rows: 34, gridHeight: .92, gridTop: 0, faceAlpha: .8, edgeAlpha: .75 } },
  { name: 'Band', note: 'A thin strip across the top.', params: { rows: 6, gridHeight: .17, gridTop: .06, faceRadius: 4 } },
  { name: 'Meshed', note: 'Three islands, every link allowed.', params: { islands: 3, linkDensity: .7, reach: .14 } },
  { name: 'Tree', note: 'Twelve islands, no extra links, another seed.', params: { islands: 12, linkDensity: 0, seed: 7, reach: 0 } },
  { name: 'Loose', note: 'Every face nudged off the grid.', params: { jitter: .5, faceRadius: 3.4, seed: 3 } },
  { name: 'Cold', note: 'Blue ink, two slow wide fields.', params: { tint: 1, foci: 2, fociRadius: 2, fociSpeed: .45, baseRed: .12 } },
  { name: 'Nervous', note: 'Ten fast fields, hard ripples that throw the hands.', params: { foci: 10, fociSpeed: 2.4, fociRadius: .8, baseRed: .05, rippleGain: 1.5, rippleSpeed: .4, rippleWidth: 34, handKick: 5 } },
  { name: 'Playground', note: 'Every adjustable of the field, live.', params: {} },
];

type Slider = { key: keyof ClockParams; label: string; min: number; max: number; step: number; hint: string };
type Group = { title: string; sliders: Slider[] };
export const CLOCK_SLIDERS: Group[] = [
  { title: 'Lattice', sliders: [
    { key: 'cols', label: 'Columns', min: 6, max: 120, step: 1, hint: 'faces per row on desktop (phones scale by 28/41)' },
    { key: 'rows', label: 'Rows', min: 2, max: 40, step: 1, hint: 'rows of faces' },
    { key: 'gridWidth', label: 'Width', min: .5, max: 1.6, step: .01, hint: 'lattice width as a fraction of the canvas' },
    { key: 'gridHeight', label: 'Height', min: .08, max: 1, step: .01, hint: 'lattice height as a fraction of the canvas' },
    { key: 'gridTop', label: 'Top', min: -.2, max: .5, step: .005, hint: 'where the first row sits' },
    { key: 'jitter', label: 'Jitter', min: 0, max: 1, step: .01, hint: 'random offset of each face, in cells' },
  ] },
  { title: 'Topology', sliders: [
    { key: 'islands', label: 'Islands', min: 1, max: 16, step: 1, hint: 'growth seeds; 8 is the /home layout' },
    { key: 'linkDensity', label: 'Links', min: 0, max: 1, step: .01, hint: 'extra links between neighbours of one island' },
    { key: 'reach', label: 'Reach', min: 0, max: .3, step: .005, hint: 'how much islands prefer growing outward' },
    { key: 'seed', label: 'Seed', min: 0, max: 40, step: 1, hint: 'reshuffles growth, jitter and extra seeds' },
  ] },
  { title: 'Faces', sliders: [
    { key: 'faceRadius', label: 'Radius', min: 1.5, max: 14, step: .1, hint: 'face radius in px' },
    { key: 'handLength', label: 'Hands', min: .2, max: 1.6, step: .02, hint: 'hand length relative to the face' },
    { key: 'strokeWidth', label: 'Stroke', min: .3, max: 3, step: .05, hint: 'line weight of faces and links' },
    { key: 'tint', label: 'Tint', min: 0, max: 1, step: .01, hint: 'oxide to blue' },
    { key: 'edgeAlpha', label: 'Link alpha', min: 0, max: 2, step: .02, hint: 'opacity of the links' },
    { key: 'faceAlpha', label: 'Face alpha', min: 0, max: 1.4, step: .02, hint: 'opacity of faces and hands' },
  ] },
  { title: 'Fields', sliders: [
    { key: 'foci', label: 'Fields', min: 0, max: 10, step: 1, hint: 'moving red fields' },
    { key: 'fociSpeed', label: 'Speed', min: 0, max: 4, step: .05, hint: 'drift speed of the fields' },
    { key: 'fociRadius', label: 'Size', min: .3, max: 2.5, step: .05, hint: 'radius of the fields' },
    { key: 'baseRed', label: 'Floor', min: 0, max: .9, step: .01, hint: 'redness outside any field' },
    { key: 'lumpiness', label: 'Lumpiness', min: 0, max: 1.5, step: .05, hint: 'how far each field departs from an ellipse' },
  ] },
  { title: 'Ripples (click the field)', sliders: [
    { key: 'rippleSpeed', label: 'Speed', min: .05, max: 1, step: .01, hint: 'px per ms of the wave front' },
    { key: 'rippleGain', label: 'Gain', min: 0, max: 3, step: .05, hint: 'amplitude of a click' },
    { key: 'rippleWidth', label: 'Width', min: 8, max: 200, step: 1, hint: 'thickness of the wave front in px' },
    { key: 'handKick', label: 'Hand kick', min: 0, max: 12, step: .05, hint: 'how far a wave turns the hands' },
  ] },
];

export const presetFor = (study: number): ClockParams => ({ ...CLOCK_DEFAULTS, ...(CLOCK_STUDIES[study - 1]?.params ?? {}) });

const fmt = (value: number, step: number) => step >= 1 ? String(Math.round(value)) : value.toFixed(step < .01 ? 3 : 2);

/** Study switcher shared by every lab route. */
export const ClockStudySwitcher: React.FC<{ study: number }> = ({ study }) => (
  <nav className="home-study-switcher" aria-label="Compare Home clock fields">
    {CLOCK_STUDIES.map((entry, index) => <Link key={entry.name} to={`/home${index + 1}`} title={entry.note} aria-label={`Home ${index + 1}: ${entry.name}`} aria-current={study === index + 1 ? 'page' : undefined}>{index + 1}</Link>)}
    <span>{CLOCK_STUDIES[study - 1]?.name}</span><Link className="home-study-original" to="/home">Original</Link>
  </nav>
);

/** The playground panel: one range input per parameter, grouped; reset, shuffle and copy the current values as JSON.
 *  Portaled to the body: the home shell animates its opacity, which would trap the panel under the fixed ambient rails. */
export const ClockPanel: React.FC<{ params: ClockParams; onChange: (next: ClockParams) => void }> = ({ params, onChange }) => {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const set = (key: keyof ClockParams, value: number) => onChange({ ...params, [key]: value });
  const shuffle = () => {
    const next = { ...params };
    for (const group of CLOCK_SLIDERS) for (const s of group.sliders) {
      const raw = s.min + Math.random() * (s.max - s.min);
      next[s.key] = s.step >= 1 ? Math.round(raw) : Math.round(raw / s.step) * s.step;
    }
    onChange(next);
  };
  const copy = async () => {
    const changed: Partial<ClockParams> = {};
    for (const key of Object.keys(params) as (keyof ClockParams)[]) if (params[key] !== CLOCK_DEFAULTS[key]) changed[key] = params[key];
    try { await navigator.clipboard.writeText(JSON.stringify(changed)); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* clipboard blocked: nothing to do */ }
  };
  const changed = (Object.keys(params) as (keyof ClockParams)[]).filter(key => params[key] !== CLOCK_DEFAULTS[key]).length;
  return createPortal(
    <aside className={`clock-panel${open ? '' : ' is-closed'}`} data-nav-quiet aria-label="Clock field parameters">
      <header className="clock-panel-head">
        <button type="button" className="clock-panel-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Parameters' : `Parameters (${changed} changed)`}</button>
        <div className="clock-panel-actions">
          <button type="button" onClick={shuffle} title="Random values for every slider">Shuffle</button>
          <button type="button" onClick={() => onChange({ ...CLOCK_DEFAULTS })} title="Back to the /home values">Reset</button>
          <button type="button" onClick={copy} title="Copy the values that differ from /home as JSON">{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </header>
      {open && <div className="clock-panel-body">
        {CLOCK_SLIDERS.map(group => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            {group.sliders.map(s => (
              <label key={s.key} className={params[s.key] !== CLOCK_DEFAULTS[s.key] ? 'is-changed' : undefined} title={s.hint}>
                <span>{s.label}</span>
                <input type="range" min={s.min} max={s.max} step={s.step} value={params[s.key]} onChange={event => set(s.key, Number(event.target.value))} />
                <output>{fmt(params[s.key], s.step)}</output>
              </label>
            ))}
          </section>
        ))}
      </div>}
    </aside>,
    document.body,
  );
};
