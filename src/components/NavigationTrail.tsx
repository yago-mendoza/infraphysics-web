// Navigation trail breadcrumb for Second Brain concept browsing

import React from 'react';
import { Link } from 'react-router-dom';
import { secondBrainPath } from '../config/categories';
import type { TrailItem } from '../hooks/useNavigationTrail';

interface NavigationTrailProps {
  trail: TrailItem[];
  onItemClick: (index: number) => void;
  onAllConceptsClick: () => void;
  isOverflowing: boolean;
}

export const NavigationTrail: React.FC<NavigationTrailProps> = ({
  trail,
  onItemClick,
  onAllConceptsClick,
  isOverflowing,
}) => {
  const hasTrail = trail.length > 0;

  return (
    <nav className="text-xs flex items-center gap-1 flex-wrap">
      {/* "all concepts" — link when trail has items, plain span on list view */}
      {hasTrail ? (
        <Link
          to={secondBrainPath()}
          onClick={onAllConceptsClick}
          className="text-violet-400 hover:text-violet-300 transition-colors"
        >
          all concepts
        </Link>
      ) : (
        <span className="text-violet-400">all concepts</span>
      )}

      {/* Overflow indicator */}
      {isOverflowing && (
        <>
          <span className="text-th-muted">&rsaquo;</span>
          <span className="text-th-muted">...</span>
        </>
      )}

      {/* Trail items */}
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1;
        return (
          <React.Fragment key={`${item.id}-${i}`}>
            <span className="text-th-muted">&rsaquo;</span>
            {isLast ? (
              <span className="text-violet-400">{item.label}</span>
            ) : (
              <Link
                to={secondBrainPath(item.id)}
                onClick={() => onItemClick(i)}
                className="text-th-tertiary hover:text-violet-400 transition-colors"
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
