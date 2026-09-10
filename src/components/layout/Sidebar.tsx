// Desktop navigation: a floating pill bar. The active page is a filled accent pill and a gear opens a small settings
// popover (Commands, Theme, Language) instead of scattering icons along the bar. About and Writing open a hover menu.

import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { stripLang } from '../../lib/contentRoutes';
import { useLang, type Lang } from '../../contexts/LangContext';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { TranslationPendingModal } from '../ui/TranslationPendingModal';
import { useCursorPreference } from '../../contexts/CursorPreferenceContext';
import { BackChevronIcon, ExternalLinkIcon, GearIcon, Logo, MoonIcon, SearchIcon, SunIcon } from '../icons';
import { secondBrainPath } from '../../config/categories';
import { useRevealOnScrollUp } from '../../hooks/useRevealOnScrollUp';
import { useProximityReveal } from '../../hooks/useProximityReveal';

export interface NavBackAction { label: string; onClick: () => void }

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const COMMAND_KEY = isMac ? '⌘K' : 'Ctrl K';

const WikiContextIcon: React.FC = () => (
  <ExternalLinkIcon className="wiki-context-icon" />
);

type MenuName = 'About' | 'Writing';
export const NAV_MENUS: Record<MenuName, { to: string; label: string }[]> = {
  About: [
    { to: '/about', label: 'Profile' },
    { to: '/about/cv', label: 'Experience / CV' },
    { to: '/about/stack', label: 'Stack' },
  ],
  Writing: [
    { to: '/blog/essays', label: 'Essays' },
    { to: '/blog/bits2bricks', label: 'Bits2Bricks' },
  ],
};
const isMenu = (label: string): label is MenuName => label === 'About' || label === 'Writing';

export const Sidebar: React.FC<{ onOpenSearch?: () => void; revealOnScrollUp?: boolean; proximityReveal?: boolean; back?: NavBackAction }> = ({ onOpenSearch, revealOnScrollUp = false, proximityReveal = false, back }) => {
  const location = useLocation();
  // Article pages: the bar hides while reading and slides back in on an upward scroll.
  // Wiki uses proximity alone; articles combine it with scroll-up reveal.
  // With proximityReveal the bar appears at the bottom edge, and stays while
  // it has focus or an open menu. Without hover (touch) that mode falls back to the scroll reveal.
  const hoverDevice = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches, []);
  const proximity = proximityReveal && hoverDevice;
  const scrollRevealed = useRevealOnScrollUp(revealOnScrollUp || (proximityReveal && !hoverDevice));
  const nearEdge = useProximityReveal(proximity);
  const [focusWithin, setFocusWithin] = useState(false);
  const [open, setOpen] = useState(false);          // compact page menu (md..xl)
  const [settings, setSettings] = useState(false);  // gear popover
  const [menu, setMenu] = useState<MenuName | null>(null); // hover menu (About / Writing)
  // With a real pointer the menus are hover-only: a click on the trigger does nothing, so the open menu
  // does not blink away. Without hover (touch) the click is the only way in, so it toggles.
  const canHover = () => window.matchMedia('(hover: hover)').matches;
  const closeTimer = useRef<number | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { aestheticCursor, toggleAestheticCursor } = useCursorPreference();
  // Language: live on a page that exists in Spanish (switches version and saves the preference),
  // dimmed everywhere else, where pressing it only explains that the page is still to be translated.
  const navigate = useNavigate();
  const { setLang } = useLang();
  const routeLang = useRouteLanguage();
  const [translationPending, setTranslationPending] = useState(false);
  const canSwitchLang = routeLang.available.includes('es');
  const otherLang: Lang = routeLang.current === 'es' ? 'en' : 'es';
  const switchLanguage = () => {
    setSettings(false);
    if (!canSwitchLang) { setTranslationPending(true); return; }
    const target = routeLang.pathFor(otherLang);
    startTransition(() => { setLang(otherLang); if (target) navigate(target); });
  };
  useEffect(() => { setOpen(false); setSettings(false); setMenu(null); }, [location.pathname]);
  useEffect(() => {
    if (!settings && !open && !menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSettings(false); setOpen(false); setMenu(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings, open, menu]);
  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

  // Hover menus: open immediately, close after a short grace period so the pointer can travel to the panel.
  const showMenu = (name: MenuName) => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setMenu(name); };
  const hideMenu = () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setMenu(null), 140); };

  const revealed = proximity
    ? (nearEdge || (revealOnScrollUp && scrollRevealed) || focusWithin || menu !== null || settings || open)
    : scrollRevealed;

  // Active section, whatever the language prefix (/es/blog/... is still Writing).
  const sitePath = stripLang(location.pathname);
  const isActive = (path: string, label: string) => label === 'Writing'
    ? sitePath.startsWith('/blog/')
    : label === 'Projects'
      ? sitePath === '/lab/projects' || sitePath.startsWith('/lab/projects/')
      : sitePath === path || sitePath.startsWith(path + '/');
  const links = [
    { to: '/home', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/blog/essays', label: 'Writing', activePath: '/blog' },
    { to: '/lab/projects', label: 'Projects', activePath: '/lab/projects' },
    { to: secondBrainPath(), label: 'Wiki', activePath: secondBrainPath() },
    { to: '/contact', label: 'Contact' },
  ];
  // Exact page for the About group; whole section (list + articles) for Writing.
  const isItemActive = (to: string) => to.startsWith('/blog/') ? sitePath.startsWith(to) : sitePath === to;
  const currentLabel = links.find(link => isActive(link.activePath ?? link.to, link.label))?.label ?? 'Explore';
  // Inactive pills tint in the brand colour on hover (global.css, .nav-pill); menu triggers a touch lighter.
  const pill = (active: boolean) => `nav-pill px-3.5 py-2 rounded-xl text-[12px] font-medium tracking-wide transition-colors ${active ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-tertiary hover:text-th-heading'}`;
  const menuPill = (active: boolean) => `nav-pill nav-pill-menu px-3.5 py-2 rounded-xl text-[12px] font-medium tracking-wide transition-colors ${active ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-tertiary hover:text-th-heading'}`;
  const closeAll = () => { setOpen(false); setSettings(false); setMenu(null); };
  return (
    <>
      {(open || settings) && <button className="hidden md:block fixed inset-0 z-40" onClick={closeAll} aria-label="Close menu" />}
      {open && (
        <div className="hidden md:block xl:hidden fixed z-50 bottom-[4rem] left-1/2 -translate-x-1/2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-th-border bg-th-base shadow-2xl">
          <nav className="p-2" aria-label="Primary navigation">
            {links.map(link => {
              const active = isActive(link.activePath ?? link.to, link.label);
              if (isMenu(link.label)) {
                const name = link.label;
                const flyoutOpen = menu === name;
                return (
                  <div key={name} className="relative" onMouseEnter={() => showMenu(name)} onMouseLeave={hideMenu}>
                    <button type="button" onClick={() => { if (canHover()) return; setMenu(flyoutOpen ? null : name); }} aria-expanded={flyoutOpen} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base ${active ? 'bg-th-nav-accent text-th-on-accent' : flyoutOpen ? 'bg-th-surface-alt text-th-heading' : 'text-th-secondary hover:bg-th-surface-alt'}`}><span>{name}</span><span className="text-[10px] font-mono opacity-60">›</span></button>
                    {flyoutOpen && <div className="compact-flyout">{NAV_MENUS[name].map(item => <Link key={item.to} to={item.to} data-active={isItemActive(item.to) || undefined} className="compact-flyout-link"><span>{item.label}</span><i aria-hidden="true">→</i></Link>)}</div>}
                  </div>
                );
              }
              return <Link key={link.label} to={link.to} data-nav-category={link.label === 'Projects' ? 'projects' : link.label === 'Wiki' ? 'wikinotes' : undefined} data-active={active || undefined} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-base ${active ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-secondary hover:bg-th-surface-alt'}`}><span className="flex items-center gap-1.5">{link.label}{link.label === 'Wiki' && <WikiContextIcon />}</span><span className="text-[10px] font-mono opacity-60">→</span></Link>;
            })}
          </nav>
        </div>
      )}
      {proximity && <div className="nav-edge-hint hidden md:block" data-hidden={revealed || undefined} aria-hidden="true" />}
      <header data-hidden={!revealed || undefined} onFocusCapture={() => setFocusWithin(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false); }} className="global-nav-shell nav-reveal hidden md:flex fixed bottom-0 left-1/2 -translate-x-1/2 z-50 h-[3.25rem] items-center gap-1 px-1.5 rounded-t-2xl bg-th-base/95 backdrop-blur-md border border-b-0 border-th-border">
        {back && <button type="button" onClick={back.onClick} className="flex items-center h-9 pl-2 pr-1.5 mr-0.5 border-r border-th-border text-th-tertiary hover:text-th-nav-accent transition-colors" aria-label={back.label} title={back.label}><BackChevronIcon className="wiki-back-icon" /></button>}
        <Link to="/home" className="group flex items-center gap-2 pl-2.5 pr-2 shrink-0" aria-label="InfraPhysics home">
          <Logo className="w-5 h-5 transition-transform group-hover:rotate-6" color="var(--nav-accent)" />
          <span className="hidden xl:inline font-mono text-[10px] tracking-[0.18em] uppercase text-th-heading">InfraPhysics</span>
        </Link>
        <nav className="hidden xl:flex items-center gap-0.5" aria-label="Primary navigation">
          {links.map(link => isMenu(link.label) ? (
            <div className="relative" key={link.label} onMouseEnter={() => showMenu(link.label as MenuName)} onMouseLeave={hideMenu}>
              <button type="button" onClick={() => { if (canHover()) return; setOpen(false); setSettings(false); setMenu(menu === link.label ? null : link.label as MenuName); }} aria-expanded={menu === link.label} className={`inline-flex items-center gap-1 ${menuPill(isActive(link.activePath ?? link.to, link.label))}`}>{link.label} <span className="text-[8px] opacity-60">{menu === link.label ? '▴' : '▾'}</span></button>
              {menu === link.label && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3">
                  <div className="w-56 rounded-2xl border border-th-border bg-th-base shadow-2xl overflow-hidden p-1.5">
                    {NAV_MENUS[link.label as MenuName].map(item => { const current = isItemActive(item.to); return <Link key={item.to} to={item.to} onClick={() => setMenu(null)} className={`flex items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-[14px] font-medium ${current ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-secondary hover:bg-th-surface-alt hover:text-th-heading'}`}><span>{item.label}</span><span className={`text-[14px] leading-none font-mono ${current ? 'opacity-70' : 'text-th-muted'}`}>→</span></Link>; })}
                  </div>
                </div>
              )}
            </div>
          ) : <Link key={link.label} to={link.to} data-nav-category={link.label === 'Projects' ? 'projects' : link.label === 'Wiki' ? 'wikinotes' : undefined} data-active={isActive(link.activePath ?? link.to, link.label) || undefined} className={`group inline-flex items-center gap-1 ${pill(isActive(link.activePath ?? link.to, link.label))}`}>{link.label}{link.label === 'Wiki' && <WikiContextIcon />}</Link>)}
        </nav>
        <button onClick={() => { setSettings(false); setMenu(null); setOpen(v => !v); }} className="xl:hidden flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-th-heading hover:bg-th-surface-alt transition-colors">
          <span>{currentLabel}</span>
          <span className="text-th-muted text-xs">Menu</span>
        </button>
        <div className="relative ml-0.5">
          <button
            onClick={() => { setOpen(false); setMenu(null); setSettings(v => !v); }}
            aria-expanded={settings}
            aria-label="Settings"
            className={`nav-pill p-2.5 rounded-xl transition-colors ${settings ? 'is-open text-th-nav-accent' : 'text-th-tertiary hover:text-th-heading'}`}
          >
            <GearIcon />
          </button>
          {settings && (
            <div className="absolute bottom-[calc(100%+.8rem)] right-0 w-60 rounded-2xl border border-th-border bg-th-base shadow-2xl overflow-hidden text-[13px]">
              <button onClick={() => { setSettings(false); onOpenSearch?.(); }} className="w-full flex items-center gap-3 px-4 py-3 bg-th-nav-accent text-th-on-accent font-medium transition-opacity hover:opacity-90">
                <SearchIcon />
                <span className="flex-1 text-left">Commands</span>
                <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono" style={{ background: 'color-mix(in srgb, var(--text-on-accent) 22%, transparent)' }}>{COMMAND_KEY}</kbd>
              </button>
              <button onClick={() => { toggleTheme(); setSettings(false); }} className="w-full flex items-center justify-between px-4 py-3 text-th-secondary hover:text-th-heading hover:bg-th-surface-alt transition-colors">
                <span>Theme</span>
                <span className="flex items-center gap-2 text-th-tertiary"><kbd className="px-1.5 py-0.5 rounded-md border border-th-border text-[9px] font-mono">Shift T</kbd><span className="text-[10px] font-mono uppercase tracking-wide">{theme === 'dark' ? 'Dark' : 'Light'}</span>{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
              </button>
              <button onClick={toggleAestheticCursor} className="w-full flex items-center justify-between px-4 py-3 border-t border-th-border text-th-secondary hover:text-th-heading hover:bg-th-surface-alt transition-colors">
                <span>CAD cursor</span>
                <span className="text-[10px] font-mono uppercase tracking-wide text-th-tertiary">{aestheticCursor ? 'On' : 'Off'}</span>
              </button>
              <button
                onClick={switchLanguage}
                aria-disabled={!canSwitchLang || undefined}
                title={canSwitchLang ? `Read in ${otherLang === 'es' ? 'Castellano' : 'English'}` : 'This page is not translated yet'}
                className={`w-full flex items-center justify-between px-4 py-3 border-t border-th-border transition-colors hover:bg-th-surface-alt ${canSwitchLang ? 'text-th-secondary hover:text-th-heading' : 'text-th-muted'}`}
              >
                <span>Language</span>
                <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide ${canSwitchLang ? '' : 'opacity-50'}`}>
                  <span className={routeLang.current === 'en' ? 'text-th-heading' : 'text-th-tertiary'}>EN</span>
                  <span className="text-th-muted">/</span>
                  <span className={routeLang.current === 'es' ? 'text-th-heading' : 'text-th-tertiary'}>ES</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </header>
      {translationPending && <TranslationPendingModal onClose={() => setTranslationPending(false)} />}
    </>
  );
};
