// Article geometry lab: /essays2/:id and /bits2bricks2/:id render a published
// article in a different page geometry (breadcrumb, sans title, meta line,
// rounded full-width hero, sticky index of top-level sections on the left,
// body on the right) while keeping each category's typography: the essay
// drop cap in the brand colour, the Bits2Bricks hashtags above the title.
// Compare against /blog/<category>/<id>; remove once a geometry is chosen.

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
import '../styles/article-geometry-lab.css';

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

export const ArticleGeometryLabView: React.FC<{ category: 'essays' | 'bits2bricks' }> = ({ category }) => {
  const { id } = useParams();
  const post = useMemo(() => {
    const pool = posts.filter(p => p.category === category);
    return (id && pool.find(p => p.id === id)) || [...pool].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [category, id]);
  const [brainIndex, setBrainIndex] = useState<BrainIndex | null>(null);
  useEffect(() => { let alive = true; initBrainIndex().then(index => { if (alive) setBrainIndex(index); }).catch(() => undefined); return () => { alive = false; }; }, []);
  const { headings, content } = useMemo(() => post ? extractHeadings(post.content) : { headings: [], content: '' }, [post]);
  const sections = headings.filter(h => h.depth === 0);

  // Active section: the last top-level heading above the threshold, tracked without re-rendering the body.
  const indexRef = useRef<HTMLOListElement>(null);
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
      indexRef.current?.querySelectorAll('a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${active}`));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    tick();
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [sections]);

  if (!post) return <div className="py-20 text-center text-th-tertiary">No {category} to show.</div>;
  const config = CATEGORY_CONFIG[category];
  const author = post.author || 'Yago Mendoza';
  const readingTime = calculateReadingTime(post.content);

  return (
    <div className={`article-page-wrapper article-${category} article-blog geometry-lab animate-fade-in`}>
      <div className="glab">
        <nav className="glab-crumb" aria-label="Breadcrumb">
          <Link to="/home">home</Link><span>/</span><Link to={sectionPath(category)}>blog</Link><span>/</span><b>{config?.title ?? category}</b>
        </nav>
        {category === 'bits2bricks' && <ArticleHashtags tags={post.tags} technologies={post.technologies} />}
        <h1 className="glab-title">{post.displayTitle || post.title}</h1>
        {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
        <p className="glab-meta">
          <Link to={author.toLowerCase() === 'yago mendoza' ? '/about' : '/contact'}>{author}</Link>
          <span>·</span><time dateTime={post.date}>{formatDateTerminal(post.date)}</time>
          <span>·</span><span>{readingTime} min read</span>
        </p>
        {post.thumbnail && (
          <figure className={`glab-hero thumb-${post.thumbnailAspect || 'full'}`}>
            <img src={post.thumbnail} alt={post.displayTitle || post.title} loading="eager" style={post.thumbnailFocus != null ? { objectPosition: `center ${post.thumbnailFocus}%` } : undefined} />
          </figure>
        )}
        <div className="glab-grid">
          <aside className="glab-index">
            {sections.length > 1 && (
              <>
                <small>In this article</small>
                <ol ref={indexRef}>
                  {sections.map(h => <li key={h.id}><a href={`#${h.id}`} onClick={event => { event.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>{h.text}</a></li>)}
                </ol>
              </>
            )}
          </aside>
          <div className="glab-body">
            <WikiContent html={content} allWikiNotes={brainIndex?.allWikiNotes} className="article-content" />
          </div>
        </div>
      </div>
    </div>
  );
};
