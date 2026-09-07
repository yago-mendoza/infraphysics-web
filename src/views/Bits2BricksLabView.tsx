// Bits2Bricks format lab: /r1 … /r5 render a Bits2Bricks article in five
// candidate geometries for a technical tutorial, borrowing from the projects
// page (dark band, pills, monospace meta) and the essays geometry (sans
// title, sticky index, rounded hero). Hashtags always sit above the title.
// Compare against /blog/bits2bricks/<id>; remove once one is chosen.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts } from '../data/data';
import { WikiContent } from '../components/wiki/WikiContent';
import { ArticleHashtags } from '../components/article/ArticleHashtags';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { calculateReadingTime, formatDateTerminal } from '../lib';
import { ACTIVE_HEADING_THRESHOLD } from '../lib/headings';
import { CATEGORY_CONFIG, sectionPath } from '../config/categories';
import '../styles/article.css';
import '../styles/article-layout.css';
import '../styles/article-geometry.css';
import '../styles/bits2bricks-lab.css';

interface Heading { level: number; text: string; id: string; depth: number }

/** Give every h1-h4 an id and collect them; same slug rules as ArticlePostView. */
function extractHeadings(html: string): { headings: Heading[]; content: string } {
  const raw: { level: number; text: string; id: string }[] = [];
  const seen = new Map<string, number>();
  const content = html.replace(/<(h[1-4])(\s[^>]*)?>(.+?)<\/\1>/gi, (_match, tag, attrs, inner) => {
    const level = parseInt(tag[1], 10);
    const text = inner.replace(/<[^>]*>/g, '').trim()
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/^\d+\.\s+/, '');
    let slug = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '') || 'section';
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count > 0) slug += `-${count}`;
    const id = `toc-${slug}`;
    raw.push({ level, text, id });
    return `<${tag}${attrs || ''} id="${id}" class="heading-toc-link">${inner.replace(/^\s*\d+\.\s+/, '')}</${tag}>`;
  });
  const minLevel = raw.length ? Math.min(...raw.map(h => h.level)) : 1;
  return { headings: raw.map(h => ({ ...h, depth: h.level - minLevel })), content };
}

const VARIANT_NAMES: Record<number, string> = { 1: 'Manual', 2: 'Steps', 3: 'Textbook', 4: 'Console', 5: 'Split' };

export const Bits2BricksLabView: React.FC<{ variant: number }> = ({ variant }) => {
  const { id } = useParams();
  const post = useMemo(() => {
    const pool = posts.filter(p => p.category === 'bits2bricks');
    return (id && pool.find(p => p.id === id)) || [...pool].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [id]);
  const [brainIndex, setBrainIndex] = useState<BrainIndex | null>(null);
  useEffect(() => { let alive = true; initBrainIndex().then(index => { if (alive) setBrainIndex(index); }).catch(() => undefined); return () => { alive = false; }; }, []);
  const { headings, content } = useMemo(() => post ? extractHeadings(post.content) : { headings: [], content: '' }, [post]);
  const sections = headings.filter(h => h.depth === 0);

  // Active section, tracked without re-rendering the body; every variant marks its links with .b2l-link.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sections.length < 2) return;
    let frame = 0;
    const tick = () => {
      frame = 0;
      let active = '';
      for (const h of sections) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_HEADING_THRESHOLD) active = h.id;
      }
      rootRef.current?.querySelectorAll('a.b2l-link').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${active}`));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    tick();
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [sections]);

  if (!post) return <div className="py-20 text-center text-th-tertiary">No Bits2Bricks piece to show.</div>;
  const config = CATEGORY_CONFIG.bits2bricks;
  const author = post.author || 'Yago Mendoza';
  const readingTime = calculateReadingTime(post.content);
  const jump = (h: Heading) => (event: React.MouseEvent) => { event.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); };
  const title = post.displayTitle || post.title;
  const number = (i: number) => String(i + 1).padStart(2, '0');

  const crumb = (
    <nav className="glab-crumb" aria-label="Breadcrumb">
      <Link to="/home">home</Link><span>/</span><Link to={sectionPath('bits2bricks')}>blog</Link><span>/</span><b>{config?.title ?? 'Bits2Bricks'}</b>
    </nav>
  );
  const meta = (
    <p className="glab-meta">
      <Link to={author.toLowerCase() === 'yago mendoza' ? '/about' : '/contact'}>{author}</Link>
      <span>·</span><time dateTime={post.date}>{formatDateTerminal(post.date)}</time>
      <span>·</span><span>{readingTime} min read</span>
      {post.complexity != null && <><span>·</span><span>complexity {post.complexity}/10</span></>}
    </p>
  );
  const hero = post.thumbnail && (
    <figure className={`glab-hero thumb-${post.thumbnailAspect || 'full'}`}>
      <img src={post.thumbnail} alt={title} loading="eager" />
    </figure>
  );
  const body = (
    <div className="glab-body">
      <WikiContent html={content} allWikiNotes={brainIndex?.allWikiNotes} className="article-content" />
    </div>
  );
  const sideIndex = (numbered: boolean) => (
    <aside className="glab-index b2l-index">
      {sections.length > 1 && (
        <>
          <small>{numbered ? 'Sections' : 'In this article'}</small>
          <ol>
            {sections.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="b2l-link" onClick={jump(h)}>{numbered && <b>{number(i)}</b>}<span>{h.text}</span></a></li>)}
          </ol>
        </>
      )}
    </aside>
  );
  const tag = <span className="b2l-tag">R{variant} · {VARIANT_NAMES[variant] ?? 'Lab'}</span>;

  let page: React.ReactNode;
  if (variant === 2) {
    /* Steps: a sticky bar of numbered section pills instead of a side index; one reading column. */
    page = (
      <div className="glab b2l-steps">
        {crumb}{tag}
        <ArticleHashtags tags={post.tags} technologies={post.technologies} />
        <h1 className="glab-title">{title}</h1>
        {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
        <div className="glab-meta-row">{meta}</div>
        {hero}
        {sections.length > 1 && <nav className="b2l-stepbar" aria-label="Sections">{sections.map((h, i) => <a key={h.id} href={`#${h.id}`} className="b2l-link" onClick={jump(h)}><b>{number(i)}</b><span>{h.text}</span></a>)}</nav>}
        <div className="b2l-single">{body}</div>
      </div>
    );
  } else if (variant === 3) {
    /* Textbook: no hero on top, a contents box opens the reading column, headings numbered. */
    page = (
      <div className="glab b2l-textbook">
        {crumb}{tag}
        <ArticleHashtags tags={post.tags} technologies={post.technologies} />
        <h1 className="glab-title">{title}</h1>
        {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
        <div className="glab-meta-row">{meta}</div>
        <div className="b2l-single">
          {sections.length > 1 && (
            <div className="b2l-contents">
              <small>Contents</small>
              <ol>{sections.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="b2l-link" onClick={jump(h)}><b>{number(i)}</b><span>{h.text}</span></a></li>)}</ol>
            </div>
          )}
          {hero}
          {body}
        </div>
      </div>
    );
  } else if (variant === 4) {
    /* Console: a dark band from the projects page carries the header; a stepper index on the left. */
    page = (
      <div className="glab b2l-console">
        <header className="b2l-band">
          {crumb}{tag}
          <ArticleHashtags tags={post.tags} technologies={post.technologies} />
          <h1 className="glab-title">{title}</h1>
          {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
          <dl className="b2l-specs">
            <div><dt>Author</dt><dd>{author}</dd></div>
            <div><dt>Date</dt><dd>{formatDateTerminal(post.date)}</dd></div>
            <div><dt>Reading</dt><dd>{readingTime} min</dd></div>
            {post.complexity != null && <div><dt>Complexity</dt><dd>{post.complexity}/10</dd></div>}
            <div><dt>Sections</dt><dd>{sections.length}</dd></div>
          </dl>
        </header>
        {hero}
        <div className="glab-grid">
          <aside className="glab-index b2l-index b2l-stepper">
            {sections.length > 1 && <ol>{sections.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="b2l-link" onClick={jump(h)}><i /><b>{number(i)}</b><span>{h.text}</span></a></li>)}</ol>}
          </aside>
          {body}
        </div>
      </div>
    );
  } else if (variant === 5) {
    /* Split: title and meta on the left, the picture on the right, then the standard sticky index and body. */
    page = (
      <div className="glab b2l-split">
        {crumb}{tag}
        <div className="b2l-split-head">
          <div>
            <ArticleHashtags tags={post.tags} technologies={post.technologies} />
            <h1 className="glab-title">{title}</h1>
            {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
            <div className="glab-meta-row">{meta}</div>
          </div>
          {hero}
        </div>
        <div className="glab-grid">{sideIndex(false)}{body}</div>
      </div>
    );
  } else {
    /* Manual: the essays geometry with a numbered side index and a spec strip under the meta. */
    page = (
      <div className="glab b2l-manual">
        {crumb}{tag}
        <ArticleHashtags tags={post.tags} technologies={post.technologies} />
        <h1 className="glab-title">{title}</h1>
        {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
        <div className="glab-meta-row">{meta}</div>
        <div className="b2l-strip">
          <span><b>{formatDateTerminal(post.date)}</b><small>published</small></span>
          <span><b>{readingTime} min</b><small>reading</small></span>
          {post.complexity != null && <span><b>{post.complexity}/10</b><small>complexity</small></span>}
          <span><b>{sections.length}</b><small>sections</small></span>
          <span><b>{(post.tags || []).length}</b><small>topics</small></span>
        </div>
        {hero}
        <div className="glab-grid">{sideIndex(true)}{body}</div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`article-page-wrapper article-bits2bricks article-blog article-geometry b2l b2l-v${variant} animate-fade-in`}>
      {page}
    </div>
  );
};
