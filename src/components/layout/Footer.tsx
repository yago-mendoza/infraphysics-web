// Site footer component — dark theme

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo, GitHubIcon, ExternalLinkIcon } from '../icons';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 mt-16 border-t border-white/8 relative z-20 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="w-6 h-6 text-gray-300" />
              <span className="font-bold text-sm text-gray-200">InfraPhysics</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-sm font-sans">
              An engineer's working journal. Everything here is interconnected.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/yago-mendoza"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-sm transition-all"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://linkedin.com/in/yago-mendoza"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-sm transition-all"
                aria-label="LinkedIn"
              >
                <ExternalLinkIcon />
              </a>
              <a
                href="https://x.com/ymdatweets"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-sm transition-all"
                aria-label="Twitter/X"
              >
                <ExternalLinkIcon />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/lab/projects" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">Projects</Link>
              <Link to="/lab/threads" className="text-xs text-gray-400 hover:text-amber-400 transition-colors">Threads</Link>
              <Link to="/lab/bits2bricks" className="text-xs text-gray-400 hover:text-blue-400 transition-colors">Bits2Bricks</Link>
              <Link to="/second-brain" className="text-xs text-gray-400 hover:text-violet-400 transition-colors">Second Brain</Link>
              <Link to="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-4">Contact</h4>
            <nav className="flex flex-col gap-2">
              <a href="mailto:contact@infraphysics.net" className="text-xs text-gray-400 hover:text-white transition-colors">
                contact@infraphysics.net
              </a>
              <a href="https://github.com/yago-mendoza" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                GitHub <ExternalLinkIcon />
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-gray-500">
            &copy; {new Date().getFullYear()} InfraPhysics. Built with React, TypeScript & Vite.
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
