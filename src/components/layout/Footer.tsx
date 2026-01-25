// Site footer component

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo, GitHubIcon, ExternalLinkIcon } from '../icons';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 mt-16 border-t border-gray-200 relative z-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="w-6 h-6 text-gray-900" />
              <span className="font-bold text-sm">InfraPhysics</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-sm">
              A digital laboratory exploring software systems, hardware design, and the philosophy of building things that matter.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/yago"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-sm transition-all"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://linkedin.com/in/yago"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                aria-label="LinkedIn"
              >
                <ExternalLinkIcon />
              </a>
              <a
                href="https://x.com/yago"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-sm transition-all"
                aria-label="Twitter/X"
              >
                <ExternalLinkIcon />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/projects" className="text-xs text-gray-600 hover:text-emerald-600 transition-colors">Projects</Link>
              <Link to="/threads" className="text-xs text-gray-600 hover:text-amber-600 transition-colors">Threads</Link>
              <Link to="/bits2bricks" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Bits2Bricks</Link>
              <Link to="/second-brain" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">Second Brain</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-4">Contact</h4>
            <nav className="flex flex-col gap-2">
              <a href="mailto:yago@infraphysics.net" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                yago@infraphysics.net
              </a>
              <a href="https://github.com/yago" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                GitHub <ExternalLinkIcon />
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-mono text-gray-400">
            &copy; {new Date().getFullYear()} InfraPhysics. Built with React, TypeScript & Vite.
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
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
