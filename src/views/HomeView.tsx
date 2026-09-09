// Home page view — minimalist cosmic landing

import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { postSummaries as posts } from '../data/postSummaries';
import type { PostSummary } from '../types';
import { ArrowRightIcon, SearchIcon } from '../components/icons';
import { CATEGORY_CONFIG, catAccentVar, postPath, sectionPath } from '../config/categories';
import { getSearchExcerpt, countMatches } from '../lib';
import { Highlight } from '../components/ui';
import { HomeVisualLab, type HomeVisualVariant } from '../components/personal/HomeVisualLab';
import { StartHere } from '../components/personal/StartHere';
import { WikiBanner } from '../components/personal/WikiBanner';
import { points as fieldCoordinates } from '../data/field-of-view.generated.json';
import { secondBrainPath } from '../config/categories';
import { placeFieldLabels } from '../lib/fieldLayout';
import { usePresence } from '../hooks/usePresence';
import { PresenceInfo } from '../components/personal/PresenceInfo';

const categoryKeys = ['projects', 'essays', 'bits2bricks'] as const;
const selectedWorkIds = ['2718281', '3142718', '3141592', '6184744', '5917362'] as const;
type FieldVariant = 1 | 2 | 3 | 4 | 5;

type FieldItem = (typeof fieldCoordinates)[number];
const FieldPoints: React.FC<{ active?: string | null; onActivate?: (item: FieldItem) => void }> = ({ active, onActivate }) => {
  const elements = useRef<(HTMLElement | null)[]>([]);
  const [positions, setPositions] = useState(fieldCoordinates.map(item => ({ x: item.x, y: item.y })));
  useLayoutEffect(() => {
    const plot = elements.current[0]?.closest('.field-plot');
    if (!plot) return;
    const place = () => {
      // Measure each pill at its widest text (label or coordinates), not at the slot currently open, so hovering never re-places the labels.
      // Fractional rects (not offsetWidth, which rounds) so the value is identical at every frame of the width transition.
      const widest = (element: HTMLElement | null) => {
        if (!element) return 80;
        const copy = element.querySelector<HTMLElement>('.field-pill-copy');
        if (!copy) return element.offsetWidth;
        const chrome = element.getBoundingClientRect().width - copy.getBoundingClientRect().width;
        const inner = Array.from(copy.querySelectorAll<HTMLElement>('.field-pill-slot > span'));
        return Math.ceil(chrome + Math.max(0, ...inner.map(span => span.scrollWidth)));
      };
      const next = placeFieldLabels(fieldCoordinates.map((item, index) => ({ ...item, width: widest(elements.current[index]), height: elements.current[index]?.offsetHeight || 24 })), plot.clientWidth, plot.clientHeight);
      setPositions(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(plot);
    elements.current.forEach(element => { if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  return <>{fieldCoordinates.map((item, index) => {
  const selected = active === item.label;
  const metrics = `(${Math.round(item.share * 100)}%, ${Math.round(item.practicalRatio * 100)}%)`;
  // Each text sits in its own slot; the slot that is not showing collapses to zero width so the pill is as wide as its current text (global.css, .field-pill-slot).
  const content = <><b>{String(index + 1).padStart(2, '0')}</b><span className="field-pill-copy" aria-hidden="true"><span className={`field-pill-slot${selected ? '' : ' is-visible'}`}><span>{item.label}</span></span><span className={`field-pill-slot field-coordinate-pair${selected ? ' is-visible' : ''}`}><span>{metrics}</span></span></span></>;
  const props = { className: `field-plot-point${active === item.label ? ' is-active' : ''}${active && active !== item.label ? ' is-muted' : ''}`, style: { '--fx': `${positions[index].x}%`, '--fy': `${100 - positions[index].y}%`, '--point-index': index } as React.CSSProperties };
  return onActivate ? <button ref={element => { elements.current[index] = element; }} type="button" aria-label={`${item.label}: ${Math.round(item.share * 100)}% coverage, ${Math.round(item.practicalRatio * 100)}% practical emphasis`} aria-pressed={selected} aria-controls="field-domain-detail" {...props} key={item.label} onMouseEnter={() => onActivate(item)} onFocus={() => onActivate(item)} onClick={() => onActivate(item)}>{content}</button> : <div ref={element => { elements.current[index] = element; }} {...props} key={item.label}>{content}</div>;
})}</>;
};
const AxisLabels = () => <><span className="field-axis-label field-axis-label-y-top">projects &amp; mechanisms</span><span className="field-axis-label field-axis-label-y-bottom">essay-led</span><span className="field-axis-label field-axis-label-x-left">less coverage</span><span className="field-axis-label field-axis-label-x-right">more coverage</span></>;

const FieldDetail: React.FC<{ item: FieldItem | null }> = ({ item }) => (
  <div className="field-detail" id="field-domain-detail">
    <small>{item ? 'Selected domain' : 'Read the map'}</small>
    <div className="field-detail-heading">
      {/* The title itself is the link to the wiki note; it takes the brand colour on hover. */}
      {item
        ? <Link className="field-detail-title" to={secondBrainPath(item.id)} title={`Explore ${item.label} in the Wiki`}><strong>{item.label}</strong></Link>
        : <strong>Practice and coverage</strong>}
    </div>
    {item ? <>
      <p className="field-detail-rationale">{item.rationale}</p>
      <div className="field-detail-summary">
        <span>{item.relatedArticles} related articles</span>
      </div>
      <nav className="field-source-links" aria-label={`Articles behind ${item.label}`}>
        {item.sources.slice(0, 3).map(source => <Link key={source.id} title={source.title} to={postPath(source.category as PostSummary['category'], source.id)}><span className="field-source-arrow" aria-hidden="true">↗</span><span className="field-source-title">{source.title}</span></Link>)}
      </nav>
    </> : <p>Select a domain to see its coverage, practical emphasis and supporting articles.</p>}
  </div>
);

const FieldOfView: React.FC<{ variant: FieldVariant }> = ({ variant }) => {
  const [active, setActive] = useState<FieldItem | null>(null);
  const evidence = <FieldDetail item={active} />;
  if (variant === 1) return <section className="home-field-index field-plot-study field-plot-minimal field-plot-interactive"><div className="field-plot-caption"><span>Where the published work leads.</span><small>Coverage and practical emphasis</small></div><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /></div><div className="field-evidence-editorial">{evidence}</div></section>;
  if (variant === 2) return <section className="home-field-index field-plot-study field-plot-grid"><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints /><p>coverage rank</p></div></section>;
  if (variant === 3) return <section className="home-field-index field-plot-study field-plot-quadrants field-plot-interactive field-plot-split"><div className="field-split-layout"><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /></div><aside>{evidence}</aside></div></section>;
  if (variant === 4) return <section className="home-field-index field-plot-study field-plot-topographic field-plot-interactive"><div className="field-plot-caption"><span>Attention landscape</span><small>Hover or focus to isolate evidence</small></div><div className="field-plot"><svg className="field-contours" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="74" cy="22" rx="25" ry="17"/><ellipse cx="74" cy="22" rx="18" ry="12"/><ellipse cx="74" cy="22" rx="11" ry="7"/><ellipse cx="35" cy="42" rx="25" ry="14"/><ellipse cx="35" cy="42" rx="16" ry="9"/><path d="M0 49C18 39 31 57 51 48s31-26 49-17"/></svg><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /><div className="field-evidence-overlay">{evidence}</div></div></section>;
  return <section className="home-field-index field-plot-study field-plot-blueprint field-plot-interactive"><div className="field-plot-caption"><span>Operational coordinates</span><small>YM / FOV / 05</small></div><div className="field-plot"><i className="field-axis-x" /><i className="field-axis-y" /><AxisLabels /><FieldPoints active={active?.label} onActivate={setActive} /><p>coverage rank</p></div><div className="field-evidence-console">{evidence}</div></section>;
};

export const HomeView: React.FC<{ visualVariant?: HomeVisualVariant; fieldVariant?: FieldVariant }> = ({ visualVariant, fieldVariant = 1 }) => {
  const presence = usePresence();
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
    const counts: Record<string, number> = { projects: 0, essays: 0, bits2bricks: 0 };

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
          {/* Phones: the counters the desktop rails show, as one line above everything. */}
          <p className="md:hidden home-presence-strip">
            <span>{presence.visits == null ? '—' : presence.visits.toLocaleString()} visits</span>
            <i aria-hidden="true">·</i>
            <span>{presence.visitors == null ? '—' : presence.visitors.toLocaleString()} visitors</span>
            <i aria-hidden="true">·</i>
            <span>{presence.pageViews == null ? '—' : presence.pageViews.toLocaleString()} page views</span>
            <PresenceInfo />
          </p>
          {/* Identity anchor */}
          <div className="flex items-end gap-5 mb-10 home-identity-anchor">
            <Link to="/about" aria-label="Who I am" className="relative block w-20 h-24 shrink-0 home-identity-portrait">
              <div className="absolute -right-2 -bottom-2 w-full h-full border" style={{ borderColor: 'color-mix(in srgb, var(--brand-oxide-strong) 72%, transparent)' }} aria-hidden="true" />
              <img src="/avatar.jpg" alt="Yago Mendoza" width={240} height={240} loading="eager" fetchPriority="high" decoding="async" className="relative w-full h-full border border-th-border object-cover grayscale contrast-110" />
            </Link>
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
            I build systems, study how they fail, and ask what evidence would let us trust them. This is my lab, my notebook, and my proof of work.
          </p>

          <p className="text-th-tertiary leading-relaxed text-sm max-w-xl">
            For the things that refuse to stay in one discipline.{' '}
            I build, study and explain systems: robotics, control, infrastructure, intelligence, networks, brains and whatever else becomes too interesting to leave alone.
          </p>
          {/* Four doors, rotating: the wiki, an essay, a project, a lesson. */}
          <div className="mt-10 home-intro-carousel home-field-wide"><StartHere /></div>
          </div>
          <aside className="hidden">
            <p className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary mb-4">A personal laboratory</p>
            <p className="text-sm leading-relaxed text-th-secondary">For ideas that survive curiosity long enough to become public.</p>
            <div className="mt-8 space-y-2 text-[10px] font-mono text-th-tertiary">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Barcelona, Spain</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Systems / robotics / intelligence</div>
              <Link to="/contact" className="inline-block pt-3 text-th-heading hover:text-red-500 transition-colors">Open a conversation →</Link>
            </div>
          </aside>
        </div>
      </section>


      {/* Categories */}
      <section className="home-directory-section pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <div className="home-editorial-heading">
          <div>
            <h2>Explore</h2>
            <p>Three shelves: things built, arguments made, subjects explained.</p>
          </div>
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
            aria-label="Search published work"
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
                    className="home-directory-row group flex items-center gap-5 py-5 border-b last:border-b-0 border-th-border transition-colors"
                    style={{ '--ac-color': catAccentVar(key) } as React.CSSProperties}
                  >
                    <span className="text-[10px] font-mono text-th-muted w-7">0{index + 1}</span>
                    <span className="home-directory-icon transition-colors">{config.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="home-directory-title block text-th-heading transition-colors">{config.title}</span>
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

      {/* Field of view: titled like the other shelves, then a plain note on what the map means, then the map itself, slightly wider than the column. */}
      <section className="home-field-section pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
      <div className="home-editorial-heading">
        <div>
          <h2>Field of view</h2>
          <p>The subjects the work keeps returning to, with the evidence behind each one.</p>
        </div>
      </div>
      <p className="home-field-note">A map of the published work. Further right means a higher coverage rank; higher means a greater share of projects and technical walkthroughs. Tags and Wiki links connect the domains. Select a label to see its (coverage, practical emphasis) and supporting articles.</p>
      <div className="home-field-wide">
        <FieldOfView variant={fieldVariant} />
      </div>
      </section>

      {/* Ideas in public */}
      <section className="home-work-section pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <div className="home-editorial-heading">
          <div>
            <h2>Ideas in public</h2>
            <p>Arguments, investigations and technical explanations. Different forms, one continuous body of work.</p>
          </div>
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

      {/* Closing plate: the wiki as sponsor of the whole thing, behind the same rule the other sections open with. */}
      <hr className="home-section-rule" />
      <WikiBanner />

    </div>
    </>
  );
};
