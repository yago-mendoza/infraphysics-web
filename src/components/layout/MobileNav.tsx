// Mobile hamburger menu navigation component

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { posts } from '../../data/data';
import {
  Logo,
  HomeIcon,
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
        isActive(to) ? colorClass + ' bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span className={isActive(to) ? colorClass : 'text-gray-400'}>{icon}</span>
      <span>{children}</span>
    </Link>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[9px] uppercase tracking-[0.2em] text-gray-400 px-4 pt-4 pb-1 select-none">
      {children}
    </div>
  );

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center">
            <Logo className="w-5 h-5" color="#E8EAED" />
          </div>
          <span className="font-bold text-sm">InfraPhysics</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-lg animate-fade-in">
            <nav className="flex flex-col p-4 gap-1">
              {/* LAB */}
              <SectionLabel>lab</SectionLabel>
              <NavLink to="/projects" colorClass="text-emerald-600" icon={<GearIcon />}>Projects</NavLink>
              <NavLink to="/threads" colorClass="text-amber-600" icon={<ThreadIcon />}>Threads</NavLink>
              <NavLink to="/bits2bricks" colorClass="text-blue-600" icon={<GradCapIcon />}>Bits2Bricks</NavLink>

              {/* WIKI */}
              <SectionLabel>wiki</SectionLabel>
              <NavLink to="/second-brain" colorClass="text-violet-600" icon={<DiamondIcon />}>2<sup>nd</sup> brain</NavLink>

              {/* META */}
              <SectionLabel>meta</SectionLabel>
              <NavLink to="/about" colorClass="text-gray-900" icon={<HomeIcon />}>About</NavLink>
              <NavLink to="/contact" colorClass="text-gray-900" icon={<MailIcon />}>Contact</NavLink>

              {/* Divider */}
              <div className="my-3 border-t border-gray-100"></div>

              {/* Random Button */}
              <button
                onClick={handleRandom}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-sm text-[10px]">?</span>
                Random post
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};
