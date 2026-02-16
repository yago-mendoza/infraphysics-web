// Mobile hamburger menu navigation component — theme-aware

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Logo,
  UserIcon,
  GearIcon,
  ThreadIcon,
  GradCapIcon,
  DiamondIcon,
  MailIcon,
  MenuIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
} from '../icons';
import { catAccentVar } from '../../config/categories';
import { CATEGORY_ACCENTS } from '../../constants/theme';


export const MobileNav: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);   // controls DOM presence
  const [visible, setVisible] = useState(false);    // controls CSS transition state
  const { theme, toggleTheme } = useTheme();

  // Open: mount first, then trigger visible on next frame
  // Close: remove visible first, then unmount after transition
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const id = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const close = useCallback(() => setIsOpen(false), []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, basePath, accent: linkAccent, icon, children }: { to: string, basePath?: string, accent: string, icon: React.ReactNode, children: React.ReactNode }) => {
    const active = isActive(basePath ?? to);
    return (
      <Link
        to={active && basePath ? basePath : to}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2.5 py-2.5 px-3 rounded-sm text-sm transition-all [&_svg]:w-4 [&_svg]:h-4 ${
          active ? 'bg-th-elevated font-medium' : 'text-th-secondary hover:bg-th-surface-alt'
        }`}
        style={active ? { color: linkAccent } : undefined}
      >
        <span className={active ? undefined : 'text-th-tertiary'} style={active ? { color: linkAccent } : undefined}>{icon}</span>
        <span>{children}</span>
      </Link>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[9px] uppercase tracking-[0.2em] text-th-tertiary px-3 pt-3 pb-0.5 select-none">
      {children}
    </div>
  );

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-th-base border-b border-th-border">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-th-active rounded-sm flex items-center justify-center">
            <Logo className="w-5 h-5" color="var(--text-primary)" />
          </div>
          <span className="font-bold text-sm text-th-primary">InfraPhysics</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 hover:bg-th-active rounded-sm transition-colors text-th-secondary"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-th-active rounded-sm transition-colors text-th-secondary"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-th-active rounded-sm transition-colors text-th-secondary"
            aria-label="Toggle menu"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mounted && (
        <>
          <div
            className={`fixed inset-0 bg-th-overlay z-40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
            onClick={close}
          />
          <div className={`absolute top-14 left-0 right-0 bg-th-sidebar border-b border-th-border z-50 shadow-lg transition-all duration-250 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <nav className="flex flex-col p-3 gap-0.5">
              {/* LAB */}
              <SectionLabel>lab</SectionLabel>
              <NavLink to="/lab/projects" basePath="/lab/projects" accent={catAccentVar('projects')} icon={<GearIcon />}>Projects</NavLink>
              <NavLink to="/lab/second-brain" accent={CATEGORY_ACCENTS.secondBrain} icon={<DiamondIcon />}>2<sup>nd</sup> brain</NavLink>

              {/* BLOG */}
              <SectionLabel>blog</SectionLabel>
              <NavLink to="/blog/threads" basePath="/blog/threads" accent={catAccentVar('threads')} icon={<ThreadIcon />}>Threads</NavLink>
              <NavLink to="/blog/bits2bricks" basePath="/blog/bits2bricks" accent={catAccentVar('bits2bricks')} icon={<GradCapIcon />}>Bits2Bricks</NavLink>

              {/* META */}
              <SectionLabel>meta</SectionLabel>
              <NavLink to="/about" accent={CATEGORY_ACCENTS.meta} icon={<UserIcon />}>About</NavLink>
              <NavLink to="/contact" accent={CATEGORY_ACCENTS.meta} icon={<MailIcon />}>Contact</NavLink>

            </nav>
          </div>
        </>
      )}
    </div>
  );
};
