// Contact page — form, social links, dark theme

import React, { useState } from 'react';
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '../components/icons';

export const ContactView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/xojwnobl', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        window.location.href = '/thanks';
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <section className="pt-6 md:pt-10 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
          I'd love to hear from you
        </h1>
        <p className="text-gray-400 text-sm font-sans mb-12 max-w-lg leading-relaxed">
          Whether it's a question, a collaboration idea, or just a conversation worth having — drop me a line.
          I typically respond within a few days. I'm especially interested in conversations about distributed systems, complexity science, and hardware projects.
        </p>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="max-w-lg mb-14">
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-sm text-white text-sm
                           placeholder-gray-600 outline-none transition-colors
                           focus:border-white/25 focus:bg-white/[0.05]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-sm text-white text-sm
                           placeholder-gray-600 outline-none transition-colors
                           focus:border-white/25 focus:bg-white/[0.05]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-sm text-white text-sm
                           placeholder-gray-600 outline-none transition-colors resize-y
                           focus:border-white/25 focus:bg-white/[0.05]"
                placeholder="What's on your mind?"
              />
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs mt-3">
              Something went wrong. You can also reach me at contact@infraphysics.net.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-6 px-6 py-2.5 bg-white/10 border border-white/10 rounded-sm text-white text-sm
                       transition-all hover:bg-white/15 hover:border-white/20
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Sending...' : 'Send message'}
          </button>

          <p className="mt-4 text-xs text-gray-600 leading-relaxed">
            Not a form person —{' '}
            <a href="mailto:contact@infraphysics.net" className="text-gray-500 hover:text-white transition-colors">
              contact@infraphysics.net
            </a>
            {' '}or{' '}
            <a href="mailto:yagomj@gmail.com" className="text-gray-500 hover:text-white transition-colors">
              yagomj@gmail.com
            </a>
            {' '}work just as well.
          </p>
        </form>

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
