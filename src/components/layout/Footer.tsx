// Compact colophon — closes the page without duplicating the entire navigation.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePresence } from '../../hooks/usePresence';

export const Footer: React.FC = () => {
  const { pathname } = useLocation();
  const presence = usePresence();
  const isBlog = pathname.startsWith('/blog');
  const isHome = pathname === '/home';
  const isContact = pathname === '/contact';
  const isProjectDetail = /^\/lab\/projects\/[^/]+$/.test(pathname);
  const isArticle = /^\/blog\/[^/]+\/[^/]+$/.test(pathname);
  const contactCopy = pathname.startsWith('/about')
    ? 'Start a conversation →'
    : isProjectDetail
      ? 'Build something together →'
      : isArticle
        ? 'Discuss this idea →'
        : pathname === '/writing'
          ? 'Continue the conversation →'
          : pathname === '/lab/projects'
            ? 'Discuss a project →'
            : 'Get in touch →';

  return (
    <footer className={`w-full relative z-20 ${isBlog ? 'bg-th-blog' : 'bg-transparent'}`}>
      <div className="max-w-[42rem] mx-auto px-6 pt-10 pb-28 md:pb-32">
        <div className="border-t border-th-border pt-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-th-tertiary mb-3">InfraPhysics</p>
            <p className="max-w-lg text-sm leading-relaxed text-th-secondary font-sans">
              A personal laboratory for systems, ideas and things worth making concrete.
            </p>
            {!isContact && <Link to="/contact" className="footer-contact-link inline-block mt-4 text-sm transition-colors">{contactCopy}</Link>}
          </div>
          <div className="md:text-right">
            <div className="footer-social-links flex md:justify-end gap-4 text-xs text-th-tertiary mb-4">
              <Link to="/notes" className="footer-notes-link font-mono tracking-[0.06em] hover:text-th-heading transition-colors">Notes →</Link>
              {!isHome && <span className="footer-external-links">
                <a href="https://github.com/yago-mendoza" target="_blank" rel="noopener noreferrer" className="footer-social-link transition-colors">GitHub</a>
                <a href="https://linkedin.com/in/yago-mendoza" target="_blank" rel="noopener noreferrer" className="footer-social-link transition-colors">LinkedIn</a>
                <a href="https://x.com/ymdatweets" target="_blank" rel="noopener noreferrer" className="footer-social-link transition-colors">X</a>
              </span>}
            </div>
            <p className="footer-presence mb-4 items-center gap-2 font-mono text-[10px] tracking-[0.04em] text-th-muted md:justify-end">
              <span>{presence.visits == null ? '—' : presence.visits.toLocaleString()} visits</span>
              <i aria-hidden="true">·</i>
              <span>{presence.visitors == null ? '—' : presence.visitors.toLocaleString()} visitors</span>
              <i aria-hidden="true">·</i>
              <span>{presence.pageViews == null ? '—' : presence.pageViews.toLocaleString()} views</span>
            </p>
            <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-th-muted">Madrid · ES / EN · © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
