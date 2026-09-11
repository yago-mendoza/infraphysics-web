// shareCardDesigns: the share card of each kind of url, laid out at 1200 x 630 with the elements of the
// site. Articles sit on engineering paper inside a drawing frame with their cover dimmed behind; the
// article shelves sit on the same paper with the clock lattice of the home in the shelf colour;
// wiki notes sit on the same paper with the wiki's brain as the monolith behind; personal pages sit on the
// black ground with the control traces and the dashed fault line, the portrait to its right. Variant B
// adds the contour map as a watermark on every article. Preview: /test/share-cards/<kind>/<a|b>.

import React, { useLayoutEffect, useRef } from 'react';
import { Logo, WikiBrainIcon } from '../components/icons';
import { cdn } from '../lib/cdn';

export type CardKind = 'article' | 'playground' | 'wiki' | 'section' | 'page';
export type Variant = 'a' | 'b';

/** What every design receives. */
export interface CardData {
  kind: CardKind;
  /** Small line above the title: category, wiki path, url. */
  kicker: string;
  title: string;
  /** One line under the title: subtitle, description, section line. */
  line: string;
  /** Theme-constant accent for the card (category, wiki violet, oxide). */
  accent: string;
  /** Article category, for the per-category looks (project cover further back, no frame on essays). */
  category?: string;
  /** The article's cover, shown dimmed behind the paper. */
  image?: string;
  /** Vertical crop anchor of the cover, % from the top. */
  imageFocus?: number;
  /** The home card shows the site emblem where the other personal pages show the portrait. */
  emblem?: boolean;
}

/* ---------- shared pieces ---------- */

const Mark: React.FC = () => <span className="sc-mark"><Logo /><b>InfraPhysics</b><span>infraphysics.net</span></span>;
const Author: React.FC = () => <span className="sc-author"><img src="/avatar.jpg" alt="" /><span>Yago Mendoza</span></span>;
const Body: React.FC<{ data: CardData; className?: string; children?: React.ReactNode }> = ({ data, className, children }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let cancelled = false;
    const fit = () => {
      const body = bodyRef.current;
      if (cancelled || !body) return;
      const title = body.querySelector<HTMLElement>('.sc-title');
      const line = body.querySelector<HTMLElement>('.sc-line');
      if (!title) return;
      title.style.removeProperty('font-size');
      line?.style.removeProperty('font-size');
      let titleSize = parseFloat(getComputedStyle(title).fontSize);
      let lineSize = line ? parseFloat(getComputedStyle(line).fontSize) : 0;
      const children = Array.from<HTMLElement>(body.children);
      const gap = parseFloat(getComputedStyle(body).rowGap) || 0;
      // flex-end overflow can extend above the box without increasing scrollHeight.
      const occupiedHeight = () => children.reduce((sum, child) => {
        const css = getComputedStyle(child);
        return sum + child.offsetHeight + (parseFloat(css.marginTop) || 0) + (parseFloat(css.marginBottom) || 0);
      }, gap * (children.length - 1));
      for (let i = 0; i < 80 && (occupiedHeight() > body.clientHeight + 1 || body.scrollHeight > body.clientHeight + 1); i++) {
        titleSize *= .96; lineSize *= .96;
        title.style.fontSize = `${titleSize}px`;
        if (line) line.style.fontSize = `${lineSize}px`;
      }
    };
    fit();
    void document.fonts.ready.then(fit);
    document.fonts.addEventListener('loadingdone', fit);
    const observer = new ResizeObserver(fit);
    if (bodyRef.current) observer.observe(bodyRef.current);
    return () => { cancelled = true; observer.disconnect(); document.fonts.removeEventListener('loadingdone', fit); };
  }, [data.title, data.line, data.kicker, className]);
  return <div ref={bodyRef} className={`sc-body ${className ?? ''}`}>
    {data.kicker && <small className="sc-kicker">{data.kicker}</small>}
    <h1 className={`sc-title${data.title.length > 56 ? ' is-long' : ''}`}>{data.title}</h1>
    {data.line && <p className="sc-line">{data.line}</p>}
    {children}
  </div>;
};

/* ---------- ingredients ---------- */

/** Engineering paper: a fine grid and a coarse grid. The frame with corner ticks is a CSS element. */
const Paper: React.FC = () => (
  <svg className="sc-ground sc-paper" viewBox="0 0 1200 630" aria-hidden="true">
    <defs>
      <pattern id="sc-fine" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" /></pattern>
      <pattern id="sc-coarse" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" /></pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#sc-fine)" />
    <rect width="1200" height="630" fill="url(#sc-coarse)" />
  </svg>
);
const FrameLine: React.FC = () => <i className="sc-frame-line" aria-hidden="true" />;

/** The home's clock maze: a dial with two hands on every cell of the grid, no gaps, and between them
    the edges that vary: each cell joins its right or lower neighbour with a fixed pseudo-random draw,
    so paths and islands appear as they do on the home. The fade towards the left is a CSS mask.
    Density follows the home lattice (75 columns over a 1.1-viewport width, 2.8px faces): about 21px cells here. */
const CLOCKS = (() => {
  const cols = 57, rows = 30, cellW = 1200 / cols, cellH = 630 / rows;
  let seed = 19;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const pos = (c: number, r: number) => [cellW * (c + .5), cellH * (r + .5)] as const;
  const dials: { x: number; y: number; h: number; m: number }[] = [];
  const edges: (readonly [readonly [number, number], readonly [number, number]])[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const [x, y] = pos(c, r);
    dials.push({ x, y, h: rnd() * 360, m: rnd() * 360 });
    if (c + 1 < cols && rnd() < .42) edges.push([pos(c, r), pos(c + 1, r)]);
    if (r + 1 < rows && rnd() < .3) edges.push([pos(c, r), pos(c, r + 1)]);
  }
  return { dials, edges, radius: 3.4 };
})();
const ClockField: React.FC = () => (
  <svg className="sc-ground sc-clocks" viewBox="0 0 1200 630" aria-hidden="true">
    {CLOCKS.edges.map(([[x1, y1], [x2, y2]], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
    {CLOCKS.dials.map((d, i) => {
      const r = CLOCKS.radius, hr = (d.h - 90) * Math.PI / 180, mr = (d.m - 90) * Math.PI / 180;
      const hand = (a: number, k: number) => `M${d.x} ${d.y}L${d.x + Math.cos(a) * r * k} ${d.y + Math.sin(a) * r * k}`;
      return <g key={i}><circle cx={d.x} cy={d.y} r={r} /><path d={hand(hr, .55) + hand(mr, .85)} /></g>;
    })}
  </svg>
);

/** The monolith: the site's mark (or the wiki's brain), very large, extruded by a few offset copies,
    as on the Contact page. */
const Monolith: React.FC<{ className?: string; brain?: boolean }> = ({ className, brain }) => {
  const Glyph = brain ? WikiBrainIcon : Logo;
  return (
    <span className={`sc-monolith ${className ?? ''}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => <Glyph key={i} className="sc-monolith-layer" />)}
      <Glyph className="sc-monolith-face" />
    </span>
  );
};

/** Contour map: closed, gently deformed rings around two centres. Variant B's watermark. */
const CONTOURS = (() => {
  const rings: string[] = [];
  const centres: [number, number, number][] = [[820, 300, 1], [1060, 540, .7]];
  for (const [cx, cy, scale] of centres) {
    for (let k = 1; k <= 14; k++) {
      const pts: string[] = [];
      const base = k * 38 * scale;
      for (let a = 0; a < 360; a += 6) {
        const t = a * Math.PI / 180;
        const r = base * (1 + .16 * Math.sin(3 * t + k * .4) + .1 * Math.sin(5 * t - k * .7) + .06 * Math.sin(8 * t + k));
        pts.push(`${(cx + Math.cos(t) * r * 1.25).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)}`);
      }
      rings.push('M' + pts.join('L') + 'Z');
    }
  }
  return rings;
})();
const Contours: React.FC = () => (
  <svg className="sc-ground sc-contours" viewBox="0 0 1200 630" aria-hidden="true">{CONTOURS.map((d, i) => <path key={i} d={d} />)}</svg>
);

/** Control traces: the graticule, three channels, the threshold band and the dashed fault line. */
const TRACES = (() => {
  const make = (f: (x: number) => number) => 'M' + Array.from({ length: 121 }, (_, i) => { const x = i * 10; return `${x},${f(x).toFixed(1)}`; }).join('L');
  return [
    // As low as the card allows: the last trace rides just above the bottom edge.
    make(x => 470 + 22 * Math.sin(x * .012) + 8 * Math.sin(x * .047 + 1)),
    make(x => 525 + 12 * Math.sin(x * .021 + 2) + 5 * Math.sin(x * .09)),
    make(x => (x < 760 ? 592 + 7 * Math.sin(x * .03) : 592 - 52 + 7 * Math.sin(x * .03) + Math.min(26, (x - 760) * .08))),
  ];
})();
const Scope: React.FC = () => (
  <svg className="sc-ground sc-scope" viewBox="0 0 1200 630" aria-hidden="true">
    <g className="sc-scope-grid">{Array.from({ length: 13 }, (_, i) => <line key={'v' + i} x1={i * 100} y1="0" x2={i * 100} y2="630" />)}{Array.from({ length: 7 }, (_, i) => <line key={'h' + i} x1="0" y1={i * 105} x2="1200" y2={i * 105} />)}</g>
    <rect className="sc-scope-band" x="0" y="566" width="1200" height="52" />
    <line className="sc-scope-fault" x1="760" y1="0" x2="760" y2="630" />
    {TRACES.map((d, i) => <path key={i} d={d} className={`sc-trace sc-trace-${i + 1}`} />)}
  </svg>
);

/* ---------- the designs ---------- */

type Design = React.FC<{ data: CardData; variant: Variant }>;

/** Essay: white type centred on a quiet ground, the emblem alone under it, then the portrait, the name and the site.
    No cover, no paper, no frame: an essay is words. */
const EssayCard: Design = ({ data }) => (
  <div className="sc-card sc-essay">
    <img className="sc-essay-ground" src={cdn('site/share/essay-ground.webp')} alt="" />
    <Paper />
    <i className="sc-essay-scrim" aria-hidden="true" />
    <div className="sc-essay-body">
      <h1 className={`sc-essay-title${data.title.length > 56 ? ' is-long' : ''}`}>{data.title}</h1>
      {/* The signature: the emblem and the site, nothing else. */}
      <span className="sc-essay-author"><Logo />infraphysics.net</span>
    </div>
  </div>
);

/** Article: the cover dimmed, the paper and the frame, a big title. Variant B adds the contour watermark. Essays use their own card. */
const ArticleCard: Design = (props) => props.data.category === 'essays' ? <EssayCard {...props} /> : <FramedArticleCard {...props} />;
const FramedArticleCard: Design = ({ data, variant }) => (
  <div className={`sc-card sc-article${data.category ? ` sc-article-${data.category}` : ''}`}>
    {data.image && <img className="sc-cover" src={data.image} alt="" style={{ objectPosition: `50% ${data.imageFocus ?? 50}%` }} />}
    <i className="sc-cover-shade" />
    {variant === 'b' && <Contours />}
    <Paper />
    {data.category !== 'projects' && data.category !== 'bits2bricks' && <FrameLine />}
    {/* Projects: the mark (emblem and name) at the top left; in the foot the author on the left and only the site on the right. */}
    {data.category === 'projects' && <span className="sc-mark-top"><span className="sc-mark"><Logo /><b>InfraPhysics</b></span></span>}
    <Body data={data} />
    <div className="sc-foot">{data.category === 'projects' ? <><Author /><span className="sc-site">infraphysics.net</span></> : <><Mark /><Author /></>}</div>
  </div>
);

/** Playground: an interactive page that belongs to an article. A greyed ground with the site's
    monolith behind, the paper and the frame, and a mark so the link reads as something to open and use. */
const PlaygroundCard: Design = ({ data }) => (
  <div className="sc-card sc-playground">
    <Monolith className="is-left" />
    <Paper />
    <FrameLine />
    <Body data={data} />
    <div className="sc-foot"><Mark /><Author /></div>
  </div>
);

/** Article shelf: the monolith peeking from the left, the clock maze in the shelf's colour, the paper
    and the frame. */
const SectionCard: Design = ({ data }) => (
  <div className={`sc-card sc-section sc-section-${data.category}`}>
    <Monolith className="is-left" />
    <ClockField />
    <Paper />
    <FrameLine />
    <Body data={data} />
    <div className="sc-foot"><Mark /><Author /></div>
  </div>
);

/** Wiki note: the brain as the monolith behind, the paper and the frame. */
const WikiCard: Design = ({ data }) => (
  <div className="sc-card sc-wiki">
    <Monolith brain className="is-left" />
    <Paper />
    <FrameLine />
    <Body data={data} />
    <div className="sc-foot"><Mark /><Author /></div>
  </div>
);

/** Personal page: the monolith behind, the black ground with the control traces and the dashed line;
    the portrait to its right with the offset frame; the text to its left. */
const PageCard: Design = ({ data }) => (
  <div className="sc-card sc-page">
    <Monolith />
    <Scope />
    {data.emblem ? <span className="sc-emblem" aria-hidden="true"><Logo /></span> : <span className="sc-portrait"><img src="/avatar.jpg" alt="" /></span>}
    {/* The mark reads as the next line of the text block, and the block sits centred. */}
    <Body data={data} className="is-left"><span className="sc-inline-mark"><Mark /></span></Body>
  </div>
);

export const DESIGNS: Record<CardKind, Design> = { article: ArticleCard, playground: PlaygroundCard, section: SectionCard, wiki: WikiCard, page: PageCard };
