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
} from '../icons';
import { CATEGORY_ACCENTS } from '../../constants/theme';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLink = (
    to: string,
    icon: React.ReactNode,
    label: React.ReactNode,
    accent: string,
  ) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
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
        className="flex justify-center mb-6 mt-6 group"
      >
        <div className="w-10 h-10 transition-transform group-hover:scale-110">
          <Logo color="var(--sidebar-text)" />
        </div>
      </Link>

      {/* LAB */}
      {sectionLabel('lab')}
      <nav className="flex flex-col gap-1">
        {navLink('/lab/projects', <GearIcon />, 'projects', CATEGORY_ACCENTS.projects)}
        {navLink('/lab/threads', <ThreadIcon />, 'threads', CATEGORY_ACCENTS.threads)}
        {navLink('/lab/bits2bricks', <GradCapIcon />, 'bits2bricks', CATEGORY_ACCENTS.bits2bricks)}
      </nav>

      {/* WIKI */}
      {sectionLabel('wiki')}
      <nav className="flex flex-col gap-1">
        {navLink('/second-brain', <DiamondIcon />, <span>2<sup>nd</sup> brain</span>, CATEGORY_ACCENTS.secondBrain)}
      </nav>

      {/* META */}
      {sectionLabel('meta')}
      <nav className="flex flex-col gap-1">
        {navLink('/about', <UserIcon />, 'about', CATEGORY_ACCENTS.meta)}
        {navLink('/contact', <MailIcon />, 'contact', CATEGORY_ACCENTS.meta)}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center p-2 rounded-sm transition-all mx-auto mb-2"
        style={{ color: 'var(--sidebar-icon)' }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </aside>
  );
};
