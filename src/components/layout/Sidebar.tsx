// Desktop navigation: a floating pill bar. The active page is a filled accent pill and a gear opens a small settings
// popover (Commands, Theme, Language) instead of scattering icons along the bar. About and Writing open a hover menu.

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useCursorPreference } from '../../contexts/CursorPreferenceContext';
import { ExternalLinkIcon, GearIcon, Logo, MoonIcon, SearchIcon, SunIcon } from '../icons';
import { secondBrainPath } from '../../config/categories';
import { useRevealOnScrollUp } from '../../hooks/useRevealOnScrollUp';

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

export const Sidebar: React.FC<{ onOpenSearch?: () => void; revealOnScrollUp?: boolean }> = ({ onOpenSearch, revealOnScrollUp = false }) => {
  const location = useLocation();
  // Article pages: the bar hides while reading and slides back in on an upward scroll.
  const revealed = useRevealOnScrollUp(revealOnScrollUp);
  const [open, setOpen] = useState(false);          // compact page menu (md..xl)
  const [settings, setSettings] = useState(false);  // gear popover
  const [menu, setMenu] = useState<MenuName | null>(null); // hover menu (About / Writing)
  const closeTimer = useRef<number | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { aestheticCursor, toggleAestheticCursor } = useCursorPreference();
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

  const isActive = (path: string, label: string) => label === 'Writing'
    ? location.pathname.startsWith('/blog/')
    : label === 'Projects'
      ? location.pathname === '/lab/projects' || location.pathname.startsWith('/lab/projects/')
      : location.pathname === path || location.pathname.startsWith(path + '/');
  const links = [
    { to: '/home', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/blog/essays', label: 'Writing', activePath: '/blog' },
    { to: '/lab/projects', label: 'Projects', activePath: '/lab/projects' },
    { to: secondBrainPath(), label: 'Wiki', activePath: secondBrainPath() },
    { to: '/contact', label: 'Contact' },
  ];
  // Exact page for the About group; whole section (list + articles) for Writing.
  const isItemActive = (to: string) => to.startsWith('/blog/') ? location.pathname.startsWith(to) : location.pathname === to;
  const currentLabel = links.find(link => isActive(link.activePath ?? link.to, link.label))?.label ?? 'Explore';
  const pill = (active: boolean) => `px-3.5 py-2 rounded-xl text-[12px] font-medium tracking-wide transition-colors ${active ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-tertiary hover:text-th-heading hover:bg-th-surface-alt'}`;
  // Menu triggers are not links: a lighter hover than a real destination.
  const menuPill = (active: boolean) => `px-3.5 py-2 rounded-xl text-[12px] font-medium tracking-wide transition-colors ${active ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-tertiary hover:text-th-heading hover:bg-th-surface-alt/40'}`;
  const closeAll = () => { setOpen(false); setSettings(false); setMenu(null); };
  return (
    <>
      {(open || settings) && <button className="hidden md:block fixed inset-0 z-40" onClick={closeAll} aria-label="Close menu" />}
      {open && (
        <div className="hidden md:block xl:hidden fixed z-50 bottom-[5.2rem] left-1/2 -translate-x-1/2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-th-border bg-th-base shadow-2xl">
          <nav className="p-2" aria-label="Primary navigation">
            {links.map(link => {
              const active = isActive(link.activePath ?? link.to, link.label);
              if (isMenu(link.label)) {
                const name = link.label;
                const flyoutOpen = menu === name;
                return (
                  <div key={name} className="relative" onMouseEnter={() => showMenu(name)} onMouseLeave={hideMenu}>
                    <button type="button" onClick={() => setMenu(flyoutOpen ? null : name)} aria-expanded={flyoutOpen} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base ${active ? 'bg-th-nav-accent text-th-on-accent' : flyoutOpen ? 'bg-th-surface-alt text-th-heading' : 'text-th-secondary hover:bg-th-surface-alt'}`}><span>{name}</span><span className="text-[10px] font-mono opacity-60">›</span></button>
                    {flyoutOpen && <div className="compact-flyout">{NAV_MENUS[name].map(item => <Link key={item.to} to={item.to} data-active={isItemActive(item.to) || undefined} className="compact-flyout-link"><span>{item.label}</span><i aria-hidden="true">→</i></Link>)}</div>}
                  </div>
                );
              }
              return <Link key={link.label} to={link.to} data-nav-category={link.label === 'Projects' ? 'projects' : undefined} data-active={active || undefined} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-base ${active ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-secondary hover:bg-th-surface-alt'}`}><span className="flex items-center gap-1.5">{link.label}{link.label === 'Wiki' && <WikiContextIcon />}</span><span className="text-[10px] font-mono opacity-60">→</span></Link>;
            })}
          </nav>
        </div>
      )}
      <header data-hidden={!revealed || undefined} className="global-nav-shell nav-reveal hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-50 h-[3.25rem] items-center gap-1 px-1.5 rounded-2xl bg-th-base/95 backdrop-blur-md border border-th-border shadow-[0_18px_50px_-18px_rgba(0,0,0,.45)]">
        <Link to="/home" className="group flex items-center gap-2 pl-2.5 pr-2 shrink-0" aria-label="InfraPhysics home">
          <Logo className="w-5 h-5 transition-transform group-hover:rotate-6" color="var(--text-heading)" />
          <span className="hidden xl:inline font-mono text-[10px] tracking-[0.18em] uppercase text-th-heading">InfraPhysics</span>
        </Link>
        <nav className="hidden xl:flex items-center gap-0.5" aria-label="Primary navigation">
          {links.map(link => isMenu(link.label) ? (
            <div className="relative" key={link.label} onMouseEnter={() => showMenu(link.label as MenuName)} onMouseLeave={hideMenu}>
              <button type="button" onClick={() => { setOpen(false); setSettings(false); setMenu(menu === link.label ? null : link.label as MenuName); }} aria-expanded={menu === link.label} className={`inline-flex items-center gap-1 ${menuPill(isActive(link.activePath ?? link.to, link.label))}`}>{link.label} <span className="text-[8px] opacity-60">{menu === link.label ? '▴' : '▾'}</span></button>
              {menu === link.label && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3">
                  <div className="w-56 rounded-2xl border border-th-border bg-th-base shadow-2xl overflow-hidden p-1.5">
                    {NAV_MENUS[link.label as MenuName].map(item => { const current = isItemActive(item.to); return <Link key={item.to} to={item.to} onClick={() => setMenu(null)} className={`flex items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-[14px] font-medium ${current ? 'bg-th-nav-accent text-th-on-accent' : 'text-th-secondary hover:bg-th-surface-alt hover:text-th-heading'}`}><span>{item.label}</span><span className={`text-[14px] leading-none font-mono ${current ? 'opacity-70' : 'text-th-muted'}`}>→</span></Link>; })}
                  </div>
                </div>
              )}
            </div>
          ) : <Link key={link.label} to={link.to} data-nav-category={link.label === 'Projects' ? 'projects' : undefined} data-active={isActive(link.activePath ?? link.to, link.label) || undefined} className={`group inline-flex items-center gap-1 ${pill(isActive(link.activePath ?? link.to, link.label))}`}>{link.label}{link.label === 'Wiki' && <WikiContextIcon />}</Link>)}
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
            className={`p-2.5 rounded-xl transition-colors ${settings ? 'bg-th-surface-alt text-th-heading' : 'text-th-tertiary hover:text-th-heading hover:bg-th-surface-alt'}`}
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
                <span>Aesthetic cursor</span>
                <span className="text-[10px] font-mono uppercase tracking-wide text-th-tertiary">{aestheticCursor ? 'On' : 'Off'}</span>
              </button>
              <div className="flex items-center justify-between px-4 py-3 border-t border-th-border text-th-secondary">
                <span>Language</span>
                <span className="font-mono text-[10px] tracking-wide text-th-tertiary">ES / EN</span>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
