// Mobile hamburger menu navigation component — dark theme

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { posts } from '../../data/data';
import {
  Logo,
  UserIcon,
  GearIcon,
  ThreadIcon,
  GradCapIcon,
  DiamondIcon,
  MailIcon,
  MenuIcon,
  CloseIcon
} from '../icons';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleRandom = () => {
    const validPosts = posts.filter(p => p.category !== 'fieldnotes');
    if (validPosts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * validPosts.length);
    const randomPost = validPosts[randomIndex];
    navigate(`/${randomPost.category}/${randomPost.id}`);
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, colorClass, icon, children }: { to: string, colorClass: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`flex items-center gap-3 py-3 px-4 rounded-sm transition-all ${
        isActive(to) ? colorClass + ' bg-white/[0.06] font-medium' : 'text-gray-400 hover:bg-white/[0.04]'
      }`}
    >
      <span className={isActive(to) ? colorClass : 'text-gray-500'}>{icon}</span>
      <span>{children}</span>
    </Link>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 px-4 pt-4 pb-1 select-none">
      {children}
    </div>
  );

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-sm flex items-center justify-center">
            <Logo className="w-5 h-5" color="#E8EAED" />
          </div>
          <span className="font-bold text-sm text-gray-200">InfraPhysics</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors text-gray-300"
          aria-label="Toggle menu"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-14 left-0 right-0 bg-[#111111] border-b border-white/10 z-50 shadow-lg animate-fade-in">
            <nav className="flex flex-col p-4 gap-1">
              {/* LAB */}
              <SectionLabel>lab</SectionLabel>
              <NavLink to="/lab/projects" colorClass="text-emerald-400" icon={<GearIcon />}>Projects</NavLink>
              <NavLink to="/lab/threads" colorClass="text-amber-400" icon={<ThreadIcon />}>Threads</NavLink>
              <NavLink to="/lab/bits2bricks" colorClass="text-blue-400" icon={<GradCapIcon />}>Bits2Bricks</NavLink>

              {/* WIKI */}
              <SectionLabel>wiki</SectionLabel>
              <NavLink to="/second-brain" colorClass="text-violet-400" icon={<DiamondIcon />}>2<sup>nd</sup> brain</NavLink>

              {/* META */}
              <SectionLabel>meta</SectionLabel>
              <NavLink to="/about" colorClass="text-gray-200" icon={<UserIcon />}>About</NavLink>
              <NavLink to="/contact" colorClass="text-gray-200" icon={<MailIcon />}>Contact</NavLink>

              {/* Divider */}
              <div className="my-3 border-t border-white/8"></div>

              {/* Random Button */}
              <button
                onClick={handleRandom}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center bg-white/[0.06] rounded-sm text-[10px]">?</span>
                Random post
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};
