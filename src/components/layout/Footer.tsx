// Compact colophon — closes the page without duplicating the entire navigation.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { pathname } = useLocation();
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
              {!isHome && <span className="footer-external-links">
                <a href="https://github.com/yago-mendoza" target="_blank" rel="noopener noreferrer" className="footer-social-link transition-colors">GitHub</a>
                <a href="https://linkedin.com/in/yago-mendoza" target="_blank" rel="noopener noreferrer" className="footer-social-link transition-colors">LinkedIn</a>
                <a href="https://x.com/ymdatweets" target="_blank" rel="noopener noreferrer" className="footer-social-link transition-colors">X</a>
              </span>}
            </div>
            {/* Phones: place left, year right; desktop keeps one line. */}
            <p className="flex justify-between md:block text-[9px] font-mono uppercase tracking-[0.14em] text-th-muted"><span>Madrid · ES / EN</span><span className="hidden md:inline"> · </span><span>© {new Date().getFullYear()}</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
};
