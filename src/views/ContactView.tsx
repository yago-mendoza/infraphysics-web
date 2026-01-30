// Contact page — emails, social links, dark theme

import React from 'react';
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '../components/icons';

export const ContactView: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in">
      <section className="pb-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
          I'd love to hear from you
        </h1>
        <p className="text-gray-400 text-sm font-sans mb-14 max-w-lg leading-relaxed">
          Whether it's a question, a collaboration idea, or just a conversation worth having — drop me a line.
        </p>

        {/* Email Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div className="p-6 border border-white/10 rounded-sm bg-white/[0.02]">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">General Inquiries</h2>
            <a
              href="mailto:contact@infraphysics.net"
              className="text-white text-sm hover:text-blue-400 transition-colors"
            >
              contact@infraphysics.net
            </a>
          </div>

          <div className="p-6 border border-white/10 rounded-sm bg-white/[0.02]">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Research & Collaborations</h2>
            <a
              href="mailto:yagomj@gmail.com"
              className="text-white text-sm hover:text-blue-400 transition-colors"
            >
              yagomj@gmail.com
            </a>
          </div>
        </div>

        {/* Elsewhere */}
        <div className="mb-14">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-6">Elsewhere</h2>

          <div className="flex flex-col gap-4">
            <a
              href="https://linkedin.com/in/yago-mendoza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="p-2 border border-white/10 rounded-sm group-hover:border-white/25 transition-colors">
                <LinkedInIcon />
              </span>
              <span className="text-sm font-sans">linkedin.com/in/<span className="text-white">yago-mendoza</span></span>
            </a>

            <a
              href="https://github.com/yago-mendoza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="p-2 border border-white/10 rounded-sm group-hover:border-white/25 transition-colors">
                <GitHubIcon />
              </span>
              <span className="text-sm font-sans">github.com/<span className="text-white">yago-mendoza</span></span>
            </a>

            <a
              href="https://x.com/ymdatweets"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="p-2 border border-white/10 rounded-sm group-hover:border-white/25 transition-colors">
                <TwitterIcon />
              </span>
              <span className="text-sm font-sans">x.com/<span className="text-white">@ymdatweets</span></span>
            </a>
          </div>
        </div>

        {/* Tiny copyright footer */}
        <div className="pt-6 border-t border-white/5 text-[10px] text-gray-600">
          &copy; {new Date().getFullYear()} InfraPhysics
        </div>
      </section>
    </div>
  );
};
