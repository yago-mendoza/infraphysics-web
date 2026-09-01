import React from 'react';
import { useLocation } from 'react-router-dom';
import { ExternalLinkIcon } from '../icons';
import { usePresence } from '../../hooks/usePresence';
import { isSecondBrainPath } from '../../config/categories';

export const AmbientRails: React.FC = () => {
  const location = useLocation();
  const presence = usePresence();
  const isWiki = isSecondBrainPath(location.pathname);

  if (isWiki) return null;
  const place = presence.lastVisitor
    ? [presence.lastVisitor.city || presence.lastVisitor.region, presence.lastVisitor.country].filter(Boolean).join(', ')
    : 'Somewhere in the world';

  return (
    <div className="ambient-rails" aria-label="Site context">
      <aside className="ambient-rail ambient-rail-left">
        <div>
          <p className="ambient-label">Last visitor from</p>
          <p className="ambient-value">{place}</p>
        </div>
        <div>
          <p className="ambient-label">Based in</p>
          <p className="ambient-value">Madrid, Spain</p>
          <p className="ambient-coordinate">40.4168 N · 3.7038 W</p>
        </div>
      </aside>
      <aside className="ambient-rail ambient-rail-right">
        <div>
          <p className="ambient-visit-number">{presence.visits == null ? '—' : presence.visits.toLocaleString()}</p>
          <p className="ambient-visit-meta">
            <span className="ambient-visit-label">visits</span>
            <span className="ambient-visit-separator" aria-hidden="true">·</span>
            <span className="ambient-visit-value">{presence.visitors == null ? '—' : presence.visitors.toLocaleString()} visitors</span>
          </p>
          <p className="ambient-coordinate">{presence.pageViews == null ? '—' : presence.pageViews.toLocaleString()} page views</p>
        </div>
        <div>
          <p className="ambient-label">Follow</p>
          <a className="ambient-link" href="https://github.com/yago-mendoza" target="_blank" rel="noreferrer">GitHub <ExternalLinkIcon /></a>
          <a className="ambient-link" href="https://linkedin.com/in/yago-mendoza" target="_blank" rel="noreferrer">LinkedIn <ExternalLinkIcon /></a>
          <a className="ambient-link" href="https://x.com/ymdatweets" target="_blank" rel="noreferrer">X <ExternalLinkIcon /></a>
        </div>
      </aside>
    </div>
  );
};
