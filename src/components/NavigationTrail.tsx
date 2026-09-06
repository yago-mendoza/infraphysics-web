// Navigation trail breadcrumb for Second Brain concept browsing

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../config/categories';
import type { TrailItem } from '../hooks/useNavigationTrail';

interface NavigationTrailProps {
  trail: TrailItem[];
  onItemClick: (index: number) => void;
  onAllConceptsClick: () => void;
}

export const NavigationTrail: React.FC<NavigationTrailProps> = ({
  trail,
  onItemClick,
  onAllConceptsClick,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const hasTrail = trail.length > 0;
  const visibleStart = Math.max(0, trail.length - 4);
  const visibleTrail = trail.slice(visibleStart);
  const previousIndex = trail.length - 2;

  return (
    <nav aria-label="Visit history" className="relative flex h-7 min-w-0 items-center gap-1 whitespace-nowrap font-mono text-[9px]">
      <button type="button" disabled={!hasTrail} onClick={() => previousIndex >= 0 ? onItemClick(previousIndex) : onAllConceptsClick()} className="grid h-6 w-6 flex-none place-items-center text-[13px] text-th-tertiary transition-colors hover:text-violet-400 disabled:opacity-25" title={previousIndex >= 0 ? 'Previous concept' : 'All concepts'}>←</button>
      {/* "all concepts" — link when trail has items, plain span on list view */}
      {hasTrail ? (
        <Link
          to={secondBrainPath()}
          onClick={onAllConceptsClick}
          className="flex-none text-violet-400 transition-colors hover:text-violet-300"
        >
          all concepts
        </Link>
      ) : (
        <span className="text-violet-400">all concepts</span>
      )}

      {/* Overflow indicator */}
      {visibleStart > 0 && (
        <div className="relative flex flex-none items-center gap-1" onMouseEnter={() => setHistoryOpen(true)} onMouseLeave={() => setHistoryOpen(false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHistoryOpen(false); }}>
          <span className="text-th-muted">|</span>
          <button type="button" aria-expanded={historyOpen} onClick={() => setHistoryOpen(true)} className="flex-none text-th-muted transition-colors hover:text-violet-400" title={`${visibleStart} earlier concepts`}>+{visibleStart}</button>
          {historyOpen && <div className="absolute left-2 top-full z-[80] mt-1 max-h-64 w-56 overflow-y-auto border border-th-hub-border bg-th-base py-1 shadow-xl thin-scrollbar">
            {trail.slice(0, visibleStart).map((item, index) => <Link key={`${item.id}-${index}`} to={secondBrainPath(item.id)} onClick={() => { setHistoryOpen(false); onItemClick(index); }} className="flex items-center gap-2 px-2.5 py-1.5 text-th-tertiary transition-colors hover:bg-violet-400/10 hover:text-violet-300"><span className="w-5 flex-none text-right text-[8px] tabular-nums text-th-muted">{index + 1}</span><span className="min-w-0 flex-1 truncate" title={item.label}>{item.label}</span></Link>)}
          </div>}
        </div>
      )}

      {/* Trail items */}
      {visibleTrail.map((item, visibleIndex) => {
        const i = visibleStart + visibleIndex;
        const isLast = i === trail.length - 1;
        return (
          <React.Fragment key={`${item.id}-${i}`}>
            <span className="text-th-muted">|</span>
            {isLast ? (
              <span className="max-w-32 truncate text-violet-400" title={item.label}>{item.label}</span>
            ) : (
              <Link
                to={secondBrainPath(item.id)}
                onClick={() => onItemClick(i)}
                className="max-w-28 truncate text-th-tertiary transition-colors hover:text-violet-400"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
