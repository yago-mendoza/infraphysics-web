// Mobile navigation — same calm editorial shell as desktop.

import React, { startTransition, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang, type Lang } from '../../contexts/LangContext';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { TranslationPendingModal } from '../ui/TranslationPendingModal';
import { LangTags } from '../ui/LangTags';
import { CloseIcon, DiceIcon, ExternalLinkIcon, MenuIcon, MoonIcon, SunIcon, WikiBrainIcon } from '../icons';
import { postPath, secondBrainPath, secondBrainGraphPath } from '../../config/categories';
import { postSummaries } from '../../data/postSummaries';
import { initBrainIndex } from '../../lib/brainIndex';
import { NAV_MENUS, type NavBackAction } from './Sidebar';
import { useRevealOnScrollUp } from '../../hooks/useRevealOnScrollUp';
import { stripLang } from '../../lib/contentRoutes';

export const MobileNav: React.FC<{ onOpenSearch?: () => void; revealOnScrollUp?: boolean; back?: NavBackAction }> = ({ onOpenSearch, revealOnScrollUp = false, back }) => {
  const [open, setOpen] = useState(false);
  const revealed = useRevealOnScrollUp(revealOnScrollUp);
  const location = useLocation();
  const sitePath = stripLang(location.pathname);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  // Same language control as the desktop gear: live where a Spanish version exists, otherwise the apology.
  const { setLang } = useLang();
  const routeLang = useRouteLanguage();
  const [translationPending, setTranslationPending] = useState(false);
  const canSwitchLang = routeLang.available.includes('es');
  const otherLang: Lang = routeLang.current === 'es' ? 'en' : 'es';
  const switchLanguage = () => {
    if (!canSwitchLang) { setTranslationPending(true); return; }
    const target = routeLang.pathFor(otherLang);
    setOpen(false);
    startTransition(() => { setLang(otherLang); if (target) navigate(target); });
  };
  // Two toys from the command palette, at the foot of the menu where the screen was empty.
  const randomArticle = () => {
    if (postSummaries.length === 0) return;
    const pick = postSummaries[Math.floor(Math.random() * postSummaries.length)];
    setOpen(false);
    navigate(postPath(pick.category, pick.id));
  };
  const randomWikinote = () => {
    initBrainIndex().then(index => {
      const notes = index.allWikiNotes;
      if (notes.length === 0) return;
      setOpen(false);
      navigate(secondBrainPath(notes[Math.floor(Math.random() * notes.length)].id));
    }).catch(() => undefined);
  };
  useEffect(() => { setOpen(false); }, [location.pathname]);
  // Other fixed controls (the wiki's floating buttons) read this flag to step out of the bar's way.
  useEffect(() => {
    const shown = revealed;
    if (shown) document.documentElement.dataset.mobileNav = 'shown'; else delete document.documentElement.dataset.mobileNav;
    return () => { delete document.documentElement.dataset.mobileNav; };
  }, [revealOnScrollUp, revealed]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // The grouped rows: the desktop menus plus, on the phone only, a direct door to the graph.
  const menus: Record<string, { to: string; label: string }[]> = { ...NAV_MENUS, Wiki: [{ to: secondBrainGraphPath(), label: 'Graph' }] };
  const links = [
    ['/home', 'Home'], ['/about', 'About'], ['/blog/essays', 'Essays'],
    ['/lab/projects', 'Projects'], ['/blog/bits2bricks', 'Bits2Bricks'], [secondBrainPath(), 'Wiki'], ['/contact', 'Contact'],
  ] as const;

  return (
    <div data-hidden={(!revealed && !open) || undefined} className="global-nav-shell nav-reveal nav-corner md:hidden fixed right-3 bottom-3 z-50">
      {/* A pill in the corner: the section we are in, then Menu. The phone's own browser bar carries back and the url. */}
      <div className="mobile-nav-bar h-11 pl-4 pr-3 inline-flex items-center gap-3 bg-th-base/95 backdrop-blur-md border border-th-border rounded-md">
        <span className="text-xs text-th-tertiary whitespace-nowrap">{links.find(([to]) => sitePath === to || sitePath.startsWith(to + '/'))?.[1] ?? 'InfraPhysics'}</span>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 pl-3 border-l border-th-border text-xs text-th-heading" aria-label="Open navigation">Menu <MenuIcon /></button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-th-base z-50 px-5 pt-4 pb-24 animate-fade-in overflow-y-auto">
          {/* Language and theme on top; the close sits at the bottom, where the Menu pill that opened this was, so a stray tap is undone without moving the thumb. */}
          <div className="flex items-center justify-between pb-5 border-b border-th-border text-xs text-th-tertiary">
            <button onClick={switchLanguage} aria-disabled={!canSwitchLang || undefined} className="flex items-center gap-2 font-mono uppercase tracking-wide text-th-secondary"><LangTags routeLang={routeLang} /></button>
            <button onClick={toggleTheme} className="flex items-center gap-2 text-th-secondary">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />} Theme
            </button>
          </div>
          <nav className="py-8">
            {links.map(([to, label], index) => menus[label] ? (
              /* Grouped pages: the label plus a flat row of destinations, no nested list. A single
                 destination sits at the right end of the label's own row instead of under it. */
              <div key={to} className="grid grid-cols-[2.8rem_1fr] items-baseline py-4 border-b border-th-border">
                <span className="mobile-nav-num">0{index + 1}</span>
                <span className="flex items-center gap-2 text-3xl font-serif text-th-heading">{label}{label === 'Wiki' && <ExternalLinkIcon className="wiki-context-icon mobile-nav-ext" />}{menus[label].length === 1 && <span className="mobile-nav-chips mobile-nav-chips-inline">{menus[label].map(item => <Link key={item.to} to={item.to} data-active={location.pathname === item.to || undefined}>{item.label}</Link>)}</span>}</span>
                {menus[label].length > 1 && <span className="col-start-2 mobile-nav-chips">{menus[label].map(item => <Link key={item.to} to={item.to} data-active={(item.to.startsWith('/blog/') ? location.pathname.startsWith(item.to) : location.pathname === item.to) || undefined}>{item.label}</Link>)}</span>}
              </div>
            ) : <Link key={to} to={to} className="grid grid-cols-[2.8rem_1fr] items-baseline py-4 border-b border-th-border"><span className="mobile-nav-num">0{index + 1}</span><span className="flex items-center gap-2 text-3xl font-serif text-th-heading">{label}{label === 'Wiki' && <ExternalLinkIcon className="wiki-context-icon mobile-nav-ext" />}</span></Link>)}
          </nav>
          <div className="mobile-nav-toys grid grid-cols-2 gap-2 pt-2 pb-5">
            <button type="button" onClick={randomArticle}><DiceIcon size={18} /><span>Random article</span></button>
            <button type="button" onClick={randomWikinote}><WikiBrainIcon size={17} /><span>Random wikinote</span></button>
          </div>
          <div className="mobile-menu-foot fixed bottom-3 left-5 right-3 z-10 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-th-tertiary">Navigate</span>
            <button onClick={() => setOpen(false)} className="mobile-menu-close h-11 inline-flex items-center gap-2 px-4 rounded-md border text-xs" aria-label="Close navigation">Close <CloseIcon /></button>
          </div>
        </div>
      )}
      {translationPending && <TranslationPendingModal onClose={() => setTranslationPending(false)} />}
    </div>
  );
};
