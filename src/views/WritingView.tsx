import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../data/postSummaries';
import { postPath } from '../config/categories';

export const WritingView: React.FC = () => {
  const writing = useMemo(() => posts
    .filter(post => post.category === 'threads' || post.category === 'bits2bricks')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), []);

  const counts = {
    threads: writing.filter(post => post.category === 'threads').length,
    bits2bricks: writing.filter(post => post.category === 'bits2bricks').length,
  };

  return (
    <div className="animate-fade-in max-w-[40rem] mx-auto writing-page">
      <header className="pt-4 pb-12 md:pb-16">
        <p className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary mb-5">Writing / index</p>
        <h1 className="text-[2.85rem] md:text-[4.15rem] font-serif font-normal tracking-[-0.045em] leading-none text-th-heading">Ideas in public.</h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-th-secondary font-sans">Arguments, investigations and technical explanations. Different forms, one continuous body of work.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 border-y border-th-border mb-14">
        <Link to="/blog/threads" className="group py-7 md:pr-8 md:border-r border-th-border">
          <span className="text-[9px] font-mono text-red-500">01</span>
          <h2 className="mt-5 text-2xl font-serif text-th-heading">Essays</h2>
          <p className="mt-3 text-sm leading-relaxed text-th-secondary font-sans">Arguments, opinions and ideas intended to travel beyond one technical domain.</p>
          <span className="block mt-5 text-[10px] font-mono text-th-muted">{counts.threads} pieces →</span>
        </Link>
        <Link to="/blog/bits2bricks" className="group py-7 md:pl-8 border-t md:border-t-0 border-th-border">
          <span className="text-[9px] font-mono text-blue-500">02</span>
          <h2 className="mt-5 text-2xl font-serif text-th-heading">Technical</h2>
          <p className="mt-3 text-sm leading-relaxed text-th-secondary font-sans">Worked explanations, models and the movement from theory into something usable.</p>
          <span className="block mt-5 text-[10px] font-mono text-th-muted">{counts.bits2bricks} pieces →</span>
        </Link>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary">Latest across both</h2>
          <span className="h-px flex-1 bg-th-border" />
        </div>
        <div className="border-t border-th-border">
          {writing.slice(0, 12).map((post, index) => (
            <Link key={post.id} to={postPath(post.category, post.id)} className="group grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[2rem_7rem_minmax(0,1fr)_7rem] gap-4 items-baseline py-4 border-b border-th-border">
              <span className="text-[9px] font-mono text-th-muted">{String(index + 1).padStart(2, '0')}</span>
              <span className={`hidden md:block text-[9px] font-mono uppercase tracking-[0.12em] ${post.category === 'threads' ? 'text-red-500' : 'text-blue-500'}`}>{post.category === 'threads' ? 'essay' : 'technical'}</span>
              <span className="text-[.84rem] leading-snug text-th-heading group-hover:text-th-primary transition-colors">{post.displayTitle || post.title}</span>
              <span className="hidden md:block text-right text-[9px] font-mono text-th-muted">{post.date}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
