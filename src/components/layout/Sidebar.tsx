// Desktop sidebar navigation component — theme-aware

import React from 'react';
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
  SunIcon,
  MoonIcon,
  SearchIcon,
} from '../icons';
import { CATEGORY_ACCENTS } from '../../constants/theme';
import { getThemedColor } from '../../config/categories';

export const Sidebar: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLink = (
    basePath: string,
    icon: React.ReactNode,
    label: React.ReactNode,
    accent: string,
    to?: string,
  ) => {
    const active = isActive(basePath);
    return (
      <Link
        to={active ? basePath : (to ?? basePath)}
        className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${
          active ? 'font-medium' : 'opacity-80 hover:opacity-100'
        }`}
        style={{
          color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
          backgroundColor: active ? `${accent}26` : 'transparent',
        }}
      >
        <span style={{ color: active ? accent : 'var(--sidebar-icon)' }}>{icon}</span>
        <span className="text-[11px]">{label}</span>
      </Link>
    );
  };

  const sectionLabel = (text: string) => (
    <div
      className="flex items-center gap-2 mt-4 mb-1 select-none px-2"
    >
      <span className="flex-1 h-px opacity-20" style={{ backgroundColor: 'var(--sidebar-section)' }} />
      <span
        className="text-[9px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--sidebar-section)' }}
      >
        {text}
      </span>
      <span className="flex-1 h-px opacity-20" style={{ backgroundColor: 'var(--sidebar-section)' }} />
    </div>
  );

  return (
    <aside
      className="hidden md:flex flex-col w-36 flex-shrink-0 sticky top-0 h-screen py-6 px-3 z-40 bg-th-sidebar"
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      {/* Logo */}
      <Link
        to="/home"
        className="flex justify-center mb-6 mt-6 group flex-shrink-0"
      >
        <div className="w-10 h-10 transition-transform group-hover:scale-110">
          <Logo color="var(--sidebar-text)" />
        </div>
      </Link>

      {/* Nav + theme toggle — scrollable when viewport is short (e.g. browser zoom) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain sidebar-scrollbar">
        {/* LAB */}
        {sectionLabel('lab')}
        <nav className="flex flex-col gap-1">
          {navLink('/lab/projects', <GearIcon />, 'projects', getThemedColor('projects', theme as 'dark' | 'light').accent)}
          {navLink('/lab/second-brain', <DiamondIcon />, <span>2<sup>nd</sup> brain</span>, CATEGORY_ACCENTS.secondBrain)}
        </nav>

        {/* BLOG */}
        {sectionLabel('blog')}
        <nav className="flex flex-col gap-1">
          {navLink('/blog/threads', <ThreadIcon />, 'threads', getThemedColor('threads', theme as 'dark' | 'light').accent)}
          {navLink('/blog/bits2bricks', <GradCapIcon />, 'bits2bricks', getThemedColor('bits2bricks', theme as 'dark' | 'light').accent)}
        </nav>

        {/* META */}
        {sectionLabel('meta')}
        <nav className="flex flex-col gap-1">
          {navLink('/about', <UserIcon />, 'about', CATEGORY_ACCENTS.meta)}
          {navLink('/contact', <MailIcon />, 'contact', CATEGORY_ACCENTS.meta)}
        </nav>

        {/* Theme Toggle + Search */}
        <div className="mt-6 flex justify-center gap-1">
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-center p-2 rounded-sm transition-all"
            style={{ color: 'var(--sidebar-icon)' }}
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-sm transition-all"
            style={{ color: 'var(--sidebar-icon)' }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </aside>
  );
};
