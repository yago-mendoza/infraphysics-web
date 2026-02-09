// Mobile hamburger menu navigation component — theme-aware

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { posts } from '../../data/data';
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
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();


  const handleRandom = () => {
    if (posts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * posts.length);
    const randomPost = posts[randomIndex];
    navigate(`/${randomPost.category}/${randomPost.id}`);
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, basePath, accent: linkAccent, icon, children }: { to: string, basePath?: string, accent: string, icon: React.ReactNode, children: React.ReactNode }) => {
    const active = isActive(basePath ?? to);
    return (
      <Link
        to={active && basePath ? basePath : to}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 py-3 px-4 rounded-sm transition-all ${
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
    <div className="text-[9px] uppercase tracking-[0.2em] text-th-tertiary px-4 pt-4 pb-1 select-none">
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
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-th-overlay z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-14 left-0 right-0 bg-th-sidebar border-b border-th-border z-50 shadow-lg animate-fade-in">
            <nav className="flex flex-col p-4 gap-1">
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

              {/* Divider */}
              <div className="my-3 border-t border-th-border"></div>

              {/* Random Button */}
              <button
                onClick={handleRandom}
                className="flex items-center gap-2 px-4 py-2 text-xs text-th-tertiary hover:text-th-secondary transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center bg-th-elevated rounded-sm text-[10px]">?</span>
                Random post
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};
