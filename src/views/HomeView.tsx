// Home page view — minimalist cosmic landing

import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../data/postSummaries';
import type { PostSummary } from '../types';
import { ArrowRightIcon, SearchIcon } from '../components/icons';
import { CATEGORY_CONFIG, catAccentVar, postPath, sectionPath } from '../config/categories';
import { getSearchExcerpt, countMatches } from '../lib';
import { Highlight } from '../components/ui';
import { HomeVisualLab, type HomeVisualVariant } from '../components/HomeVisualLab';
import { shortNotes } from '../data/notes';

const categoryKeys = ['projects', 'threads', 'bits2bricks'] as const;
const selectedWorkIds = ['2718281', '3142718', '3141592', '6184744', '5917362', '9461728'] as const;
type FieldVariant = 1 | 2 | 3 | 4 | 5;
const fieldCoordinates = [
  { label: 'control', x: 48, y: 48, evidence: 'Industrial engineering, dynamic systems and control-oriented modelling.' },
  { label: 'robotics', x: 58, y: 38, evidence: 'ROS 2, sensing and the integration layer between software and machines.' },
  { label: 'networks', x: 63, y: 55, evidence: 'Distributed-systems research and operating Hyperledger Besu infrastructure.' },
  { label: 'infrastructure', x: 78, y: 72, evidence: 'Multi-provider AI systems, Azure deployment, observability and failure handling.' },
  { label: 'intelligence', x: 88, y: 84, evidence: 'Clinical AI evaluation, product ownership and evidence for ship/no-ship decisions.' },
  { label: 'brains', x: 38, y: 24, evidence: 'An active research interest spanning cognition, learning and representation.' },
  { label: 'materials', x: 20, y: 34, evidence: 'Engineering foundations in physical constraints, simulation and failure modes.' },
  { label: 'failure', x: 72, y: 66, evidence: 'Reliability thinking across safety-critical, operational and AI systems.' },
];

type FieldItem = (typeof fieldCoordinates)[number];
const FieldPoints: React.FC<{ projections?: boolean; active?: string | null; onActivate?: (item: FieldItem) => void }> = ({ projections = false, active, onActivate }) => <>{fieldCoordinates.map((item, index) => {
  const content = <>{projections && <><i className="field-projection-x" /><i className="field-projection-y" /></>}<b>{String(index + 1).padStart(2, '0')}</b><span>{item.label}</span></>;
  const props = { className: `field-plot-point${active === item.label ? ' is-active' : ''}${active && active !== item.label ? ' is-muted' : ''}`, style: { '--fx': `${item.x}%`, '--fy': `${100 - item.y}%`, '--point-index': index } as React.CSSProperties };
  return onActivate ? <button type="button" {...props} key={item.label} onMouseEnter={() => onActivate(item)} onFocus={() => onActivate(item)} onClick={() => onActivate(item)}>{content}</button> : <div {...props} key={item.label}>{content}</div>;
})}</>;
const AxisLabels = () => <><span className="field-axis-label field-axis-label-y-top">used in real systems</span><span className="field-axis-label field-axis-label-y-bottom">studied &amp; explored</span><span className="field-axis-label field-axis-label-x-left">background</span><span className="field-axis-label field-axis-label-x-right">current focus</span></>;

const FieldOfView: React.FC<{ variant: FieldVariant }> = ({ variant }) => {
  const [active, setActive] = useState<FieldItem | null>(null);
  const evidence = active?.evidence ?? 'Move through the map to see the work behind each domain.';
  const activeQuadrant = active
    ? (active.x >= 50 ? 1 : 0) + (active.y < 48 ? 2 : 0)
    : -1;
  if (variant === 1) return <section className="home-field-index field-plot-study field-plot-minimal field-plot-interactive pb-14 md:pb-20"><div className="field-plot-caption"><span>Where practice meets curiosity.</span><small>Relative positions, not proficiency scores</small></div><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /></div><div className="field-evidence-editorial"><strong>{active?.label ?? 'Field of view'}</strong><p>{evidence}</p></div></section>;
  if (variant === 2) return <section className="home-field-index field-plot-study field-plot-grid pb-14 md:pb-20"><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints /><p>direction, not rank</p></div></section>;
  if (variant === 3) return <section className="home-field-index field-plot-study field-plot-quadrants field-plot-interactive field-plot-split pb-14 md:pb-20"><div className="field-plot-caption"><span>Field of view</span><small>Evidence on demand</small></div><div className="field-split-layout"><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><div className="field-quadrant-labels" aria-hidden="true">{['FOUNDATIONS', 'DEPLOYMENT', 'EXPLORATION', 'EMERGING PRACTICE'].map((label, index) => <span key={label} className={index === activeQuadrant ? 'is-active' : ''}>{label}</span>)}</div><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /></div><aside><small>{active ? 'Selected domain' : 'Read the map'}</small><strong>{active?.label ?? 'Practice × attention'}</strong><p>{evidence}</p></aside></div></section>;
  if (variant === 4) return <section className="home-field-index field-plot-study field-plot-topographic field-plot-interactive pb-14 md:pb-20"><div className="field-plot-caption"><span>Attention landscape</span><small>Hover or focus to isolate evidence</small></div><div className="field-plot"><svg className="field-contours" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="74" cy="22" rx="25" ry="17"/><ellipse cx="74" cy="22" rx="18" ry="12"/><ellipse cx="74" cy="22" rx="11" ry="7"/><ellipse cx="35" cy="42" rx="25" ry="14"/><ellipse cx="35" cy="42" rx="16" ry="9"/><path d="M0 49C18 39 31 57 51 48s31-26 49-17"/></svg><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /><div className="field-evidence-overlay"><strong>{active?.label ?? 'Select a domain'}</strong><span>{evidence}</span></div></div></section>;
  return <section className="home-field-index field-plot-study field-plot-blueprint field-plot-interactive pb-14 md:pb-20"><div className="field-plot-caption"><span>Operational coordinates</span><small>YM / FOV / 05</small></div><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints projections active={active?.label} onActivate={setActive} /><p>direction, not rank</p></div><div className="field-evidence-console"><span>{active ? `0${fieldCoordinates.indexOf(active) + 1}` : '--'}</span><strong>{active?.label ?? 'Awaiting selection'}</strong><p>{evidence}</p></div></section>;
};

export const HomeView: React.FC<{ visualVariant?: HomeVisualVariant; fieldVariant?: FieldVariant }> = ({ visualVariant, fieldVariant = 1 }) => {
  const selectedWorkPosts = useMemo(() => selectedWorkIds
    .map(id => posts.find(post => post.id === id))
    .filter((post): post is PostSummary => Boolean(post)), []);

  // Post counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of categoryKeys) {
      counts[key] = posts.filter(p => p.category === key).length;
    }
    return counts;
  }, []);

  // Unified search
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;

    const allPosts = posts;
    const matches: { post: PostSummary; matchCount: number; excerpt: string | null }[] = [];
    const counts: Record<string, number> = { projects: 0, threads: 0, bits2bricks: 0 };

    for (const post of allPosts) {
      const mc = countMatches(post.displayTitle || post.title || '', q)
        + countMatches(post.description || '', q);
      if (mc === 0) continue;
      const excerpt = getSearchExcerpt(post.description || '', q);
      matches.push({ post, matchCount: mc, excerpt });
      counts[post.category] = (counts[post.category] || 0) + 1;
    }

    matches.sort((a, b) => b.matchCount - a.matchCount);
    return { matches, counts };
  }, [searchQuery]);

  return (
    <>
    <div className={`flex flex-col animate-fade-in font-sans home-editorial-shell ${visualVariant ? `home-experiment home-experiment-${visualVariant}` : ''}`}>
      {/* Hero */}
      <section className="relative pt-4 md:pt-12 pb-14 md:pb-20 min-h-[62vh] flex items-end home-hero" {...(visualVariant === 1 ? { 'data-clickable-above': '[data-home-pattern-boundary]', 'data-clickable-offset': '48' } : {})}>
        {visualVariant && <div className={`home-visual-experiment home-visual-${visualVariant}`} aria-hidden="true"><HomeVisualLab variant={visualVariant} interactivePointer showTachograph={false} /></div>}
        <div className="relative z-10 w-full">
          <div>
          {/* Identity anchor */}
          <div className="flex items-end gap-5 mb-10 home-identity-anchor">
            <div className="relative w-20 h-24 shrink-0 home-identity-portrait">
              <div className="absolute -right-2 -bottom-2 w-full h-full border" style={{ borderColor: 'color-mix(in srgb, var(--brand-oxide-strong) 72%, transparent)' }} aria-hidden="true" />
              <img src="https://avatars.githubusercontent.com/yago-mendoza" alt="Yago Mendoza" className="relative w-full h-full border border-th-border object-cover grayscale contrast-110" />
            </div>
            <div>
              <p className="text-xl tracking-tight text-th-heading">Yago Mendoza</p>
              <p className="text-xs text-th-tertiary font-mono tracking-wide">industrial engineer · polymathing</p>
              <Link to="/about" className="inline-flex items-center gap-1 text-xs text-th-secondary hover:text-th-heading transition-colors mt-1">
                Who I am <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <h1 data-home-pattern-boundary className="font-serif text-[3.15rem] md:text-[4.55rem] font-normal tracking-[-0.045em] leading-[0.94] mb-6 max-w-4xl">
            <span className="text-th-heading">From systems to bits</span>
            <br />
            <span className="text-th-secondary">and back.</span>
          </h1>

          <p className="text-sm text-th-tertiary tracking-wide mb-7 max-w-xl">
            Engineering is engineering. The substrate doesn&rsquo;t matter.
          </p>

          <p className="text-th-secondary leading-relaxed text-base max-w-xl mb-4">
            I picked up code because every engineer should&mdash;not to become a developer, but to move faster. Now I build at the boundary. This is my lab, my notebook, and my proof of work.
          </p>

          <p className="text-th-tertiary leading-relaxed text-sm max-w-xl">
            For the things that refuse to stay in one discipline.{' '}
            I build, study and explain systems: robotics, control, infrastructure, intelligence, networks, brains and whatever else becomes too interesting to leave alone.
          </p>
          </div>
          <aside className="hidden">
            <p className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary mb-4">A personal laboratory</p>
            <p className="text-sm leading-relaxed text-th-secondary">For ideas that survive curiosity long enough to become public.</p>
            <div className="mt-8 space-y-2 text-[10px] font-mono text-th-tertiary">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Madrid, Spain</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Systems / robotics / intelligence</div>
              <Link to="/contact" className="inline-block pt-3 text-th-heading hover:text-red-500 transition-colors">Open a conversation →</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Categories */}
      <section className="home-directory-section pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <div className="home-editorial-heading">
          <h2>Explore</h2>
        </div>

        {/* Search input */}
        <div className="flex-1 group flex items-center border border-th-border px-3 py-2.5 focus-within:border-th-border-active transition-colors bg-th-surface-alt mb-6">
          <span className="text-th-tertiary"><SearchIcon /></span>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); searchRef.current?.blur(); } }}
            placeholder="Search published work..."
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent border-none ml-2.5 text-sm focus:outline-none placeholder-th-tertiary text-th-primary"
          />
        </div>

        {searchResults ? (
          <div>
            {/* Category count bar */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mb-6 text-xs text-th-tertiary">
              {categoryKeys.map(key => {
                const config = CATEGORY_CONFIG[key];
                const accent = catAccentVar(key);
                const count = searchResults.counts[key] || 0;
                return (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="text-th-secondary">{config.title}</span>
                    <span className="text-th-tertiary">&mdash; {count}</span>
                  </span>
                );
              })}
            </div>

            {/* Results list */}
            {searchResults.matches.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {searchResults.matches.map(({ post, matchCount, excerpt }) => {
                  const accent = catAccentVar(post.category);
                  return (
                    <Link
                      key={`${post.category}-${post.id}`}
                      to={postPath(post.category, post.id)}
                      className="card-link group flex items-start gap-3 p-3"
                    >
                      <span className="mt-1.5 inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-th-heading font-medium group-hover-accent transition-colors truncate"
                            style={{ '--ac-color': accent } as React.CSSProperties}>
                            <Highlight text={post.displayTitle || post.title} query={searchQuery} />
                          </span>
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded" style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
                            &times;{matchCount}
                          </span>
                        </div>
                        {excerpt && (
                          <p className="text-xs text-th-tertiary mt-1 line-clamp-1 font-sans">
                          <Highlight text={excerpt} query={searchQuery} />
                        </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-th-tertiary py-8 text-center">No results found.</p>
            )}
          </div>
        ) : (
          <>
            <div className="home-entry-list border-y border-th-border">
              {categoryKeys.map((key, index) => {
                const config = CATEGORY_CONFIG[key];
                return (
                  <Link
                    key={key}
                    to={sectionPath(key)}
                    className="group flex items-center gap-5 py-5 border-b last:border-b-0 border-th-border transition-colors"
                  >
                    <span className="text-[10px] font-mono text-th-muted w-7">0{index + 1}</span>
                    <span className="text-th-tertiary group-hover:text-th-heading transition-colors">{config.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-th-heading group-hover:text-th-primary transition-colors">{config.title}</span>
                      <span className="block text-th-tertiary text-sm leading-relaxed line-clamp-1 font-sans mt-1">{config.description}</span>
                    </span>
                    <span className="hidden sm:block text-[10px] font-mono text-th-muted">{categoryCounts[key]} pieces</span>
                    <ArrowRightIcon />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Selected work */}
      <section className="home-work-section pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <div className="home-editorial-heading">
          <div>
            <h2>Selected work</h2>
            <p>A few useful places to start.</p>
          </div>
          <Link to="/writing">View all →</Link>
        </div>

        <div className="home-selected-list edu-entry-list edu-article-list">
          {selectedWorkPosts.map(post => (
            <Link key={`${post.category}-${post.id}`} to={postPath(post.category, post.id)} className="edu-entry-row">
              <span className="edu-entry-mark edu-entry-mark-article" aria-hidden="true"><i /><i /><i /><i /></span>
              <span className="edu-entry-copy">
                <time>{post.date}</time>
                <strong>{post.displayTitle || post.title}</strong>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Synthesis after the evidence: slightly wider than the editorial column. */}
      <div className="home-field-wide">
        <FieldOfView variant={fieldVariant} />
      </div>

      {/* Notes — intentionally absent from global navigation */}
      <section className="home-notes-section border-t border-th-border pt-8 md:pt-12 pb-12 md:pb-20">
        <div className="home-editorial-heading">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-th-tertiary mb-2">Unfiltered log</p>
            <h2><Link to="/notes" aria-label="Open Notes">Notes</Link></h2>
          </div>
        </div>
        <div className="home-notes-list">
          {shortNotes.slice(0, 4).map((note, index) => (
            <Link key={note.id} to={`/notes/${note.id}`} className="home-note-row group">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{note.title}</strong>
              <time>{note.date}</time>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
    </>
  );
};
