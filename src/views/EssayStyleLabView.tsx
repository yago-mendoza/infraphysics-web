// Essay style lab: /r2, /r4, /r5, /r6, /r7, /r12, /r13, /r14. Renders one essay
// (the Astra piece) under several typography configurations so they can be
// compared side by side. Experimental: nothing here touches the production
// essay styling. Each variant is a set of --lab-* CSS variables consumed by
// essay-lab.css. Numbers are kept from the original fifteen-variant round.

import React, { useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { formatDate, calculateReadingTime } from '../lib';
import { WikiContent } from '../components/wiki/WikiContent';
import { posts } from '../data/data';
import '../styles/article.css';
import '../styles/article-layout.css';
import '../styles/essay-lab.css';

const ESSAY_ID = '3358174';

// Extra faces for the lab only; loaded on mount, never part of the site bundle.
const LAB_FONTS_HREF = 'https://fonts.googleapis.com/css2?'
  + 'family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400'
  + '&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400'
  + '&family=EB+Garamond:ital,wght@0,400;0,500;1,400'
  + '&family=Lora:ital,wght@0,400;0,500;1,400'
  + '&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300'
  + '&family=Spectral:ital,wght@0,300;0,400;1,400'
  + '&display=swap';

const SS4 = "'Source Serif 4', Georgia, serif";
const NEWS = "'Newsreader', Georgia, serif";
const LIT = "'Literata', Georgia, serif";
const EBG = "'EB Garamond', Garamond, Georgia, serif";
const LORA = "'Lora', Georgia, serif";
const FRAU = "'Fraunces', Georgia, serif";
const SPEC = "'Spectral', Georgia, serif";
const INTER = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

type Vars = Record<string, string>;
interface Variant { name: string; note: string; vars: Vars; dropcap?: boolean }

const base = (over: Vars): Vars => ({
  '--lab-measure': '42rem',
  '--lab-body-font': SS4, '--lab-body-size': '1.1rem', '--lab-body-lh': '1.75', '--lab-para-gap': '1.25em',
  '--lab-title-font': SS4, '--lab-title-size': '3.4rem', '--lab-title-weight': '300', '--lab-title-lh': '1.04', '--lab-title-ls': '-.02em',
  '--lab-sub-font': INTER, '--lab-sub-size': '1.1rem',
  '--lab-h2-font': SS4, '--lab-h2-size': '1.7rem', '--lab-h2-weight': '400',
  '--lab-meta-font': MONO, '--lab-meta-size': '.72rem',
  ...over,
});

const VARIANTS: Record<number, Variant> = {
  2: { name: 'Source Serif, narrow measure', note: 'Site serif kept; column tightened to 40rem, body 1.12/1.75, light 300 title.', vars: base({ '--lab-measure': '40rem', '--lab-body-size': '1.12rem' }) },
  4: { name: 'Literata', note: 'Google Play Books face. Compact 1.06/1.74 on a 44rem column, medium-weight title.', vars: base({ '--lab-measure': '44rem', '--lab-body-font': LIT, '--lab-body-size': '1.06rem', '--lab-body-lh': '1.74', '--lab-title-font': LIT, '--lab-title-size': '3.2rem', '--lab-title-weight': '500', '--lab-title-ls': '-.015em', '--lab-h2-font': LIT, '--lab-h2-size': '1.5rem', '--lab-h2-weight': '600' }) },
  5: { name: 'EB Garamond classic', note: 'Old-style book serif at 1.25/1.62, italic subtitle, small-caps meta. Most traditional of the set.', vars: base({ '--lab-measure': '42rem', '--lab-body-font': EBG, '--lab-body-size': '1.25rem', '--lab-body-lh': '1.62', '--lab-para-gap': '1.1em', '--lab-title-font': EBG, '--lab-title-size': '4rem', '--lab-title-weight': '400', '--lab-title-lh': '1.02', '--lab-title-ls': '-.01em', '--lab-sub-font': EBG, '--lab-sub-style': 'italic', '--lab-sub-size': '1.35rem', '--lab-h2-font': EBG, '--lab-h2-size': '1.9rem', '--lab-h2-weight': '400', '--lab-meta-font': EBG, '--lab-meta-size': '.85rem', '--lab-meta-variant': 'small-caps', '--lab-meta-ls': '.06em' }) },
  6: { name: 'Lora + Fraunces', note: 'Lora body 1.06/1.8 (calm, slightly warm) under a Fraunces 300 display title.', vars: base({ '--lab-measure': '40rem', '--lab-body-font': LORA, '--lab-body-size': '1.06rem', '--lab-body-lh': '1.8', '--lab-title-font': FRAU, '--lab-title-size': '3.6rem', '--lab-title-weight': '300', '--lab-sub-font': LORA, '--lab-sub-style': 'italic', '--lab-sub-size': '1.15rem', '--lab-h2-font': FRAU, '--lab-h2-size': '1.6rem', '--lab-h2-weight': '400' }) },
  7: { name: 'Spectral, airy', note: 'Spectral 1.1/1.9 with 1.7em paragraph gaps on a 38rem column. Maximum whitespace.', vars: base({ '--lab-measure': '38rem', '--lab-body-font': SPEC, '--lab-body-size': '1.1rem', '--lab-body-lh': '1.9', '--lab-para-gap': '1.7em', '--lab-title-font': SPEC, '--lab-title-size': '3.4rem', '--lab-title-weight': '300', '--lab-title-lh': '1.1', '--lab-sub-font': SPEC, '--lab-sub-style': 'italic', '--lab-h2-font': SPEC, '--lab-h2-size': '1.5rem', '--lab-h2-weight': '400', '--lab-h2-gap': '3.2rem', '--lab-body-gap': '2.4rem' }) },
  12: { name: 'Fraunces display', note: 'Fraunces 300 at 4.2rem with its soft optical shapes, Literata 1.05/1.76 body underneath.', vars: base({ '--lab-measure': '40rem', '--lab-body-font': LIT, '--lab-body-size': '1.05rem', '--lab-body-lh': '1.76', '--lab-title-font': FRAU, '--lab-title-size': '4.2rem', '--lab-title-weight': '300', '--lab-title-lh': '.98', '--lab-sub-font': FRAU, '--lab-sub-style': 'italic', '--lab-sub-weight': '300', '--lab-sub-size': '1.3rem', '--lab-h2-font': FRAU, '--lab-h2-size': '1.7rem', '--lab-h2-weight': '400' }) },
  13: { name: 'Wide measure, small type', note: 'Source Serif at 1rem/1.7 on a 52rem column with a 60rem hero. Denser, more pages-per-screen.', vars: base({ '--lab-measure': '52rem', '--lab-hero': '60rem', '--lab-body-size': '1rem', '--lab-body-lh': '1.7', '--lab-title-size': '3rem', '--lab-title-weight': '400', '--lab-h2-size': '1.4rem' }) },
  14: { name: 'Justified, hyphens, drop cap', note: 'Newsreader 1.12/1.7, justified with automatic hyphenation and an accent-colored drop cap.', dropcap: true, vars: base({ '--lab-measure': '40rem', '--lab-body-font': NEWS, '--lab-body-size': '1.12rem', '--lab-body-lh': '1.7', '--lab-align': 'justify', '--lab-hyphens': 'auto', '--lab-title-font': NEWS, '--lab-title-size': '3.6rem', '--lab-title-weight': '400', '--lab-sub-font': NEWS, '--lab-sub-style': 'italic', '--lab-sub-size': '1.2rem', '--lab-h2-font': NEWS, '--lab-h2-size': '1.6rem', '--lab-h2-weight': '500' }) },
};

// Mirrored in App.tsx, which registers one route per id (kept there so the lab stays lazy-loaded).
const LAB_VARIANT_IDS = Object.keys(VARIANTS).map(Number).sort((a, b) => a - b);

const face = (stack: string) => stack.split(',')[0].replace(/'/g, '');
const describe = (v: Variant) =>
  `${face(v.vars['--lab-body-font'])} ${v.vars['--lab-body-size']}/${v.vars['--lab-body-lh']} · title ${face(v.vars['--lab-title-font'])} ${v.vars['--lab-title-weight']} ${v.vars['--lab-title-size']} · measure ${v.vars['--lab-measure']}`;

export const EssayStyleLabView: React.FC<{ variant: number }> = ({ variant }) => {
  const n = variant;
  const v = VARIANTS[n];
  const post = useMemo(() => posts.find(p => p.id === ESSAY_ID && p.category === 'essays'), []);
  const readingTime = useMemo(() => post ? calculateReadingTime(post.content) : 0, [post]);

  useEffect(() => {
    if (document.querySelector('link[data-essay-lab-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LAB_FONTS_HREF;
    link.dataset.essayLabFonts = '1';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!v) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const index = LAB_VARIANT_IDS.indexOf(n);
      const next = LAB_VARIANT_IDS[index + (event.key === 'ArrowRight' ? 1 : -1)];
      if (next !== undefined) window.location.assign(`/r${next}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n, v]);

  if (!v) return <Navigate to={`/r${LAB_VARIANT_IDS[0]}`} replace />;
  if (!post) return <div className="py-20 text-center text-th-tertiary">Essay {ESSAY_ID} not found.</div>;

  const wrapperClass = `article-page-wrapper article-essays article-blog essay-lab lab-styled lab-v${n}${v.dropcap ? ' lab-dropcap' : ''}`;

  return (
    <div className={wrapperClass} style={v.vars as React.CSSProperties}>
      <article className="article-essays-card">
        {post.thumbnail && (
          <div className={`article-essays-hero-image thumb-${post.thumbnailAspect || 'full'}${post.thumbnailWidth === 'full' ? ' thumb-width-full' : ''}`}>
            <img src={post.thumbnail} alt={post.displayTitle || post.title} className="w-full h-auto rounded-lg" />
          </div>
        )}
        <div className="article-essays-header-content">
          <div className="article-title-block">
            <h1 className="article-title">{post.displayTitle || post.title}</h1>
            {post.subtitle && <p className="article-subtitle">{post.subtitle}</p>}
          </div>
          <div className="article-essays-meta-engagement">
            <div className="article-blog-metabar">
              <span>{formatDate(post.date)}</span>
              <span className="mx-2 text-th-muted">·</span>
              <span>{post.author || 'Yago Mendoza'}</span>
              <span className="mx-2 text-th-muted">·</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
        <div className="article-essays-body">
          <WikiContent html={post.content} className="article-content" />
        </div>
      </article>

      <aside className="essay-lab-switcher" aria-label="Essay style variants">
        <nav>
          {LAB_VARIANT_IDS.map(i => (
            <Link key={i} to={`/r${i}`} aria-current={i === n ? 'page' : undefined} title={VARIANTS[i].name}>r{i}</Link>
          ))}
        </nav>
        <p><b>r{n} · {v.name}</b> <span>· {describe(v)}</span><br />{v.note} <span>(← → to switch)</span></p>
      </aside>
    </div>
  );
};
