// Desktop sidebar navigation component

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Logo,
  HomeIcon,
  GearIcon,
  ThreadIcon,
  GradCapIcon,
  DiamondIcon,
  MailIcon,
} from '../icons';
import { COLORS } from '../../constants/theme';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const { sidebar, category } = COLORS;

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
          color: active ? sidebar.textActive : sidebar.text,
          backgroundColor: active ? `${accent}26` : 'transparent',
        }}
      >
        <span style={{ color: active ? accent : sidebar.icon }}>{icon}</span>
        <span className="text-[11px]">{label}</span>
      </Link>
    );
  };

  const sectionLabel = (text: string) => (
    <div
      className="text-[9px] uppercase tracking-[0.2em] text-center mt-4 mb-1 select-none"
      style={{ color: sidebar.sectionLabel }}
    >
      {text}
    </div>
  );

  return (
    <aside
      className="hidden md:flex flex-col w-36 flex-shrink-0 sticky top-0 h-screen py-6 px-3 z-40"
      style={{ backgroundColor: sidebar.bg, transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      {/* Logo */}
      <Link
        to="/home"
        className="flex justify-center mb-6 mt-6 group"
      >
        <div className="w-10 h-10 transition-transform group-hover:scale-110">
          <Logo color={sidebar.text} />
        </div>
      </Link>

      {/* ── LAB ── */}
      {sectionLabel('lab')}
      <nav className="flex flex-col gap-1">
        {navLink('/projects', <GearIcon />, 'projects', category.projects.accent)}
        {navLink('/threads', <ThreadIcon />, 'threads', category.threads.accent)}
        {navLink('/bits2bricks', <GradCapIcon />, 'bits2bricks', category.bits2bricks.accent)}
      </nav>

      {/* ── WIKI ── */}
      {sectionLabel('wiki')}
      <nav className="flex flex-col gap-1">
        {navLink('/second-brain', <DiamondIcon />, <span>2<sup>nd</sup> Brain</span>, category.secondBrain.accent)}
      </nav>

      {/* ── META ── */}
      {sectionLabel('meta')}
      <nav className="flex flex-col gap-1">
        {navLink('/about', <HomeIcon />, 'about', sidebar.activeAccent)}
        {navLink('/contact', <MailIcon />, 'contact', sidebar.activeAccent)}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  );
};
