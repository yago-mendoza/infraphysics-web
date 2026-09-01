// Mobile navigation — same calm editorial shell as desktop.

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { CloseIcon, ExternalLinkIcon, Logo, MenuIcon, MoonIcon, SunIcon } from '../icons';
import { secondBrainPath } from '../../config/categories';

export const MobileNav: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  useEffect(() => { setOpen(false); setAboutOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    ['/home', 'Home'], ['/about', 'About'], ['/writing', 'Writing'],
    ['/lab/projects', 'Projects'], [secondBrainPath(), 'Wiki'], ['/contact', 'Contact'],
  ] as const;

  return (
    <div className="global-nav-shell md:hidden fixed inset-x-0 bottom-3 z-50 px-3">
      <div className="h-12 px-4 flex items-center justify-between bg-th-base/95 backdrop-blur-md border border-th-border rounded-md shadow-xl">
        <Link to="/home" className="flex items-center gap-2" aria-label="InfraPhysics home">
          <Logo className="w-4 h-4" color="var(--text-heading)" />
          <span className="text-sm text-th-heading">{links.find(([to]) => location.pathname === to || location.pathname.startsWith(to + '/'))?.[1] ?? 'InfraPhysics'}</span>
        </Link>
        <div className="flex items-center gap-1 text-th-tertiary">
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 pl-3 border-l border-th-border text-xs" aria-label="Open navigation">Menu <MenuIcon /></button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-th-base z-50 px-5 py-4 animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-between pb-5 border-b border-th-border">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-th-tertiary">Navigate</span>
            <button onClick={() => setOpen(false)} className="p-2 text-th-secondary" aria-label="Close navigation"><CloseIcon /></button>
          </div>
          <nav className="py-8">
            {links.map(([to, label], index) => label === 'About' ? (
              <div key={to} className="border-b border-th-border">
                <button type="button" onClick={() => setAboutOpen(v => !v)} className="grid w-full grid-cols-[2rem_1fr_auto] items-baseline py-4 text-left">
                  <span className="text-[9px] font-mono text-th-muted">0{index + 1}</span><span className="text-3xl font-serif text-th-heading">About</span><span className="text-th-muted">{aboutOpen ? '−' : '+'}</span>
                </button>
                {aboutOpen && <div className="pb-4 pl-8 grid gap-1"><Link to="/about" className="py-2 text-lg text-th-secondary">Profile <small className="block text-[10px] text-th-muted">Ideas and direction</small></Link><Link to="/about/cv" className="py-2 text-lg text-th-secondary">Experience / CV <small className="block text-[10px] text-th-muted">Work and education</small></Link><Link to="/about/stack" className="py-2 text-lg text-th-secondary">Stack <small className="block text-[10px] text-th-muted">Tools and systems</small></Link></div>}
              </div>
            ) : <Link key={to} to={to} className="grid grid-cols-[2rem_1fr] items-baseline py-4 border-b border-th-border"><span className="text-[9px] font-mono text-th-muted">0{index + 1}</span><span className="flex items-center gap-2 text-3xl font-serif text-th-heading">{label}{label === 'Wiki' && <ExternalLinkIcon className="wiki-context-icon" />}</span></Link>)}
          </nav>
          <div className="flex items-center justify-between pt-4 text-xs text-th-tertiary">
            <span>Madrid · ES / EN</span>
            <button onClick={toggleTheme} className="flex items-center gap-2 text-th-secondary">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />} Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
