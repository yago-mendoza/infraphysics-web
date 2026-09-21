import React from 'react';
import { useHub } from '../../contexts/SecondBrainHubContext';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import type { WikiLens } from '../../lib/wikiExplorer';

// The dot of each lens is the colour it paints on the graph (LENS_COLORS in MiniGraph.tsx).
const LENS_DOT: Record<WikiLens, string> = { orphans: '#f59e0b', bridges: '#fb7185', cited: '#22d3ee', trail: '#c4b5fd' };

/**
 * The lens picker. Two shapes of the same control:
 *  - default: one row per lens (dot, name, what it selects, count), used in the graph flyout;
 *  - compact: a quiet line of small chips (dot, short name, count) that sits at the far right of
 *    the console's filter row, where a lens is one more filter.
 */
export function WikiLenses({ compact = false }: { compact?: boolean }) {
  const hub = useHub();
  const { getIslands } = useGraphRelevance();
  const choices: Array<[WikiLens, string, string, string, number]> = [
    ['bridges', 'Bridges', 'bridges', 'Removing one splits the graph', getIslands()?.cuts.length ?? 0],
    ['cited', 'Cited by articles', 'cited', 'Concepts the articles link to', [...hub.articleUsage.values()].filter(articles => articles.length >= hub.citedMinimum).length],
    ['trail', 'Session trail', 'trail', 'Visited in this tab', hub.allWikiNotes.filter(note => hub.isVisited(note.id)).length],
    ['orphans', 'Orphans', 'orphans', 'No references in or out', getIslands()?.isolatedUids.length ?? 0],
  ];
  const pick = (kind: WikiLens) => { hub.setLens(hub.lens === kind ? null : kind); hub.setSelectedNodeId(null); };
  const citedInput = <input type="number" min={1} step={1} aria-label="Minimum citing articles" value={hub.citedMinimum}
    onChange={event => { const n = Number(event.target.value); if (Number.isInteger(n) && n >= 1) hub.setCitedMinimum(n); }} />;

  if (compact) {
    return <span className="wiki-lenses-compact" role="group" aria-label="Lenses">
      <span className="wiki-lenses-compact-label">lens</span>
      {choices.map(([kind, label, short, hint, count]) => <button key={kind} type="button" className="wiki-lens-chip" aria-pressed={hub.lens === kind}
        disabled={!count && hub.lens !== kind} title={`${label}: ${hint.charAt(0).toLowerCase()}${hint.slice(1)} (${count})`} onClick={() => pick(kind)}>
        <i className="wiki-lens-dot" style={{ backgroundColor: LENS_DOT[kind] }} aria-hidden="true" />{short}<span className="wiki-lens-count">{count}</span>
      </button>)}
      {hub.lens === 'cited' && <label className="wiki-lenses-compact-extra">≥ {citedInput}</label>}
      {hub.lens === 'trail' && <button type="button" className="wiki-lenses-clear" onClick={hub.clearVisited}>clear trail</button>}
    </span>;
  }

  return <section className="wiki-lenses" aria-label="Lenses">
    <span className="wiki-lenses-label">Lenses</span>
    <div className="wiki-lenses-list">{choices.map(([kind, label, , hint, count]) => <button key={kind} type="button" className="wiki-lens" aria-pressed={hub.lens === kind}
      disabled={!count && hub.lens !== kind} onClick={() => pick(kind)}>
      <i className="wiki-lens-dot" style={{ backgroundColor: LENS_DOT[kind] }} aria-hidden="true" />
      <span className="wiki-lens-text"><span className="wiki-lens-name">{label}</span><span className="wiki-lens-hint">{hint}</span></span>
      <span className="wiki-lens-count">{count}</span>
    </button>)}</div>
    {hub.lens === 'cited' && <label className="wiki-lenses-extra">At least {citedInput} articles</label>}
    {hub.lens === 'trail' && <button type="button" className="wiki-lenses-extra wiki-lenses-clear" onClick={hub.clearVisited}>Clear session trail</button>}
  </section>;
}
