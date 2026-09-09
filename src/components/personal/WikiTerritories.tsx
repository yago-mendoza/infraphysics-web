// The wiki's domains as a mosaic, in the same geometry as the Field of view
// map above it: the plot on the left (every root note as an area proportional
// to the notes under it), a reading column on the right that names the
// selected domain, its size and its opening line, and opens its note. Data
// comes from field-of-view.generated.json (scripts/compute-field-of-view.js).

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import evidence from '../../data/field-of-view.generated.json';
import { secondBrainGraphPath, secondBrainPath } from '../../config/categories';
import { partitionAreas } from '../../lib/partitionAreas';
import { assignRootColors } from '../graph/useGraphData';
import { WikiBrainIcon } from '../icons';

type Root = { id: string; label: string; count: number; description?: string };
const roots: Root[] = evidence.wikiRoots;
const total = roots.reduce((sum, root) => sum + root.count, 0);
const colors = assignRootColors(roots.flatMap(root => Array.from({ length: root.count }, () => root.label)));
const share = (root: Root) => `${(root.count / total * 100).toFixed(1)}%`;
const abbreviate = (label: string) => label.length <= 3 ? label : label.includes(' ') ? label.split(' ').map(word => word[0]).join('').toUpperCase() : label.slice(0, 3).toUpperCase();

export const WikiTerritories: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 720, height: 352 });
  const [active, setActive] = useState<string | null>(null);
  const navigate = useNavigate();
  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const selected = roots.find(root => root.id === active) ?? null;
  // With a pointer, hover selects and a click opens the graph scoped to that domain. Without hover
  // (phones) the first tap selects and a second tap on the same area opens the graph.
  const openInGraph = (root: Root) => navigate(`${secondBrainGraphPath()}?scope=${encodeURIComponent(root.label)}`);
  const touch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches, []);
  return (
    <section className="wb-split" aria-label="Explore all Wiki domains">
      <div ref={container} className="wb-territory-map" onMouseLeave={touch ? undefined : () => setActive(null)}>
        {partitionAreas(roots, size.width, size.height).map(root => (
          <button key={root.id} type="button"
            className={`wb-territory${active === root.id ? ' is-active' : ''}${active && active !== root.id ? ' is-muted' : ''}`}
            aria-pressed={active === root.id}
            aria-controls="wb-domain-detail"
            aria-label={`${root.label}: ${root.count} notes, ${share(root)}. Opens the graph on this domain.`}
            onMouseEnter={touch ? undefined : () => setActive(root.id)} onFocus={touch ? undefined : () => setActive(root.id)}
            onClick={() => { if (!touch || active === root.id) openInGraph(root); else setActive(root.id); }}
            style={{ left: root.x, top: root.y, width: root.width, height: root.height, '--territory': colors.get(root.label) } as React.CSSProperties}>
            {root.width > 42 && root.height > 25 && <span aria-hidden="true">{abbreviate(root.label)}</span>}
          </button>
        ))}
      </div>
      <aside className="wb-detail" id="wb-domain-detail">
        <small>{selected ? '\u00a0' : 'Read the mosaic'}</small>
        <div className="wb-detail-heading">
          <strong>{selected?.label ?? 'The domains, by size'}</strong>
          {selected && <Link className="wb-detail-brain" to={secondBrainPath(selected.id)} aria-label={`Open ${selected.label} in the Wiki`} title={`Open ${selected.label} in the Wiki`}><WikiBrainIcon size={18} /></Link>}
        </div>
        {selected ? (
          <>
            <p>{selected.description || `Everything filed under ${selected.label}.`}</p>
            <span className="wb-detail-summary">{selected.count} {selected.count === 1 ? 'note' : 'notes'} · {share(selected)} of the wiki</span>
          </>
        ) : (
          <>
            <p>Each area is one root of the wiki, sized by the notes beneath it. Point at one to read what it holds.</p>
            <span className="wb-detail-summary">{roots.length} domains · {total} notes</span>
            <Link to={secondBrainGraphPath()} className="wb-detail-cta">Open the wiki graph <span aria-hidden="true">→</span></Link>
          </>
        )}
      </aside>
    </section>
  );
};
