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
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon
} from '../icons';
import { COLORS } from '../../constants/theme';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const { sidebar, category } = COLORS;

  return (
    <aside
      className="hidden md:flex flex-col w-36 flex-shrink-0 sticky top-0 h-screen py-6 px-3 z-40"
      style={{ backgroundColor: sidebar.bg, transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      {/* Logo */}
      <Link
        to="/home"
        className="flex justify-center mb-10 mt-6 group"
      >
        <div className="w-10 h-10 transition-transform group-hover:scale-110">
          <Logo color={sidebar.text} />
        </div>
      </Link>

      {/* Home */}
      <Link
        to="/home"
        className={`flex flex-col items-center gap-1.5 py-3 mb-2 rounded-sm transition-all ${isActive("/home") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
        style={{
          color: isActive("/home") ? sidebar.textActive : sidebar.text,
          backgroundColor: isActive("/home") ? sidebar.activeBg : 'transparent'
        }}
      >
        <span style={{ color: isActive("/home") ? sidebar.activeAccent : sidebar.icon }}><HomeIcon /></span>
        <span className="text-[11px]">home</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-600 mx-auto my-3"></div>

      {/* Categories */}
      <nav className="flex flex-col gap-1">
        <Link
          to="/projects"
          className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${isActive("/projects") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
          style={{
            color: isActive("/projects") ? sidebar.textActive : sidebar.text,
            backgroundColor: isActive("/projects") ? sidebar.activeBg : 'transparent'
          }}
        >
          <span style={{ color: isActive("/projects") ? category.projects.accent : sidebar.icon }}><GearIcon /></span>
          <span className="text-[11px]">projects</span>
        </Link>

        <Link
          to="/threads"
          className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${isActive("/threads") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
          style={{
            color: isActive("/threads") ? sidebar.textActive : sidebar.text,
            backgroundColor: isActive("/threads") ? sidebar.activeBg : 'transparent'
          }}
        >
          <span style={{ color: isActive("/threads") ? category.threads.accent : sidebar.icon }}><ThreadIcon /></span>
          <span className="text-[11px]">threads</span>
        </Link>

        <Link
          to="/bits2bricks"
          className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${isActive("/bits2bricks") ? 'font-medium' : 'opacity-80 hover:opacity-100'}`}
          style={{
            color: isActive("/bits2bricks") ? sidebar.textActive : sidebar.text,
            backgroundColor: isActive("/bits2bricks") ? sidebar.activeBg : 'transparent'
          }}
        >
          <span style={{ color: isActive("/bits2bricks") ? category.bits2bricks.accent : sidebar.icon }}><GradCapIcon /></span>
          <span className="text-[11px]">bits2bricks</span>
        </Link>
      </nav>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Second Brain - Bottom Section */}
      <Link
        to="/second-brain"
        className={`flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all ${
          isActive("/second-brain") ? 'font-medium' : 'opacity-80 hover:opacity-100'
        }`}
        style={{
          color: isActive("/second-brain") ? sidebar.textActive : sidebar.text,
          backgroundColor: isActive("/second-brain") ? sidebar.activeBg : 'transparent'
        }}
      >
        <span style={{ color: isActive("/second-brain") ? sidebar.activeAccent : sidebar.icon }}><DiamondIcon /></span>
        <span className="text-[11px]">notes</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-600 mx-auto my-3"></div>

      {/* Social Links */}
      <div className="flex justify-center gap-2 mb-4">
        <a
          href="https://github.com/yago"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-sm transition-all"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </a>
        <a
          href="https://linkedin.com/in/yago"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-sm transition-all"
          aria-label="LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <a
          href="https://x.com/yago"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-sm transition-all"
          aria-label="Twitter/X"
        >
          <TwitterIcon />
        </a>
      </div>
    </aside>
  );
};
