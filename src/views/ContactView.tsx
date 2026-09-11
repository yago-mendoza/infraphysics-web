import React, { useState } from 'react';
import { ContactLogoSculpture } from '../components/personal/ContactLogoSculpture';

export const ContactView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('https://formspree.io/f/xojwnobl', { method: 'POST', body: new FormData(event.currentTarget), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Request failed');
      window.location.href = '/thanks';
    } catch { setStatus('error'); }
  };

  return (
    <div className="animate-fade-in max-w-[40rem] mx-auto contact-editorial-shell contact-sculpture-shell">
      <ContactLogoSculpture />
      <div className="contact-content-layer">
      <header className="pt-4 pb-10 md:pb-16 border-b border-th-border">
        <p className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary mb-5">Contact / Barcelona</p>
        <h1 className="max-w-3xl text-[2.85rem] md:text-[4.15rem] font-serif font-normal tracking-[-0.045em] leading-[0.96] text-th-heading">Bring an interesting problem.</h1>
        <p className="mt-6 md:mt-7 max-w-2xl text-base md:text-lg leading-relaxed text-th-secondary font-sans">Systems, infrastructure, robotics, research, technical writing, strange ideas with a concrete edge, or simply a conversation worth having.</p>
        <div className="mt-7 text-sm leading-relaxed text-th-secondary space-y-3">
          <p>You might be evaluating an AI system and wondering what evidence is enough, taking a prototype into real use, or trying to explain a difficult mechanism clearly.</p>
          <p>A paper that changes an argument here, a counterexample, or a specific engineering question is also a good place to start. Tell me what you are trying to understand and where you are stuck.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)] gap-8 md:gap-16 py-8 md:py-10">
        <aside>
          <p className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary mb-4 md:mb-5">Direct routes</p>
          {/* Links only as wide as their text (inline-flex, not block): a tap at the far side of the row must not open them. On phones they sit in one row. */}
          <div className="contact-routes flex flex-wrap gap-x-5 gap-y-3 md:flex-col md:items-start text-sm">
            <a href="mailto:contact@infraphysics.net" className="inline-flex w-fit text-th-heading hover:text-red-500 transition-colors">Email ↗</a>
            <a href="https://linkedin.com/in/yago-mendoza" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit text-th-secondary hover:text-th-heading transition-colors">LinkedIn ↗</a>
            <a href="https://github.com/yago-mendoza" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit text-th-secondary hover:text-th-heading transition-colors">GitHub ↗</a>
            <a href="https://x.com/ymdatweets" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit text-th-secondary hover:text-th-heading transition-colors">X ↗</a>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formspree reads this as the subject of its notification; the visitor's `email` field becomes the Reply-To on its own. */}
          <input type="hidden" name="_subject" value="New message from the InfraPhysics contact page" />
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-th-tertiary mb-2">Your name</span>
            <input name="name" required className="w-full bg-transparent border-0 border-b border-th-border px-0 py-3 text-th-heading outline-none focus:border-th-heading transition-colors" />
          </label>
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-th-tertiary mb-2">Email</span>
            <input type="email" name="email" required className="w-full bg-transparent border-0 border-b border-th-border px-0 py-3 text-th-heading outline-none focus:border-th-heading transition-colors" />
          </label>
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-th-tertiary mb-2">What are you thinking about?</span>
            <textarea name="message" required rows={6} className="w-full bg-transparent border border-th-border p-4 text-th-heading outline-none resize-y focus:border-th-heading transition-colors" />
          </label>
          {status === 'error' && <p className="text-sm text-red-500">The form failed. Email contact@infraphysics.net directly.</p>}
          <button type="submit" disabled={status === 'submitting'} className="text-sm text-th-heading border-b border-th-heading pb-1 hover:text-red-500 hover:border-red-500 transition-colors disabled:opacity-50">
            {status === 'submitting' ? 'Sending…' : 'Send message →'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};
