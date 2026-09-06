import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeline } from '../../lib/date';
import { Highlight } from '../ui';
import { postPath, STATUS_CONFIG } from '../../config/categories';
import { EmptyState } from './SearchResultsList';
import type { SectionRendererProps } from './index';
import { getProjectDisplayTechnologies } from '../../lib/projectPresentation';

const projectToolIcons: Record<string, string> = {
  angular: '/tool-icons/si-angular.svg',
  azure: '/tool-icons/azure.svg',
  'chart.js': '/tool-icons/si-chartjs.svg',
  'claude api': '/tool-icons/si-claude.svg',
  'cloudflare d1': '/tool-icons/si-cloudflare.svg',
  css: '/tool-icons/si-css.svg',
  'drizzle orm': '/tool-icons/si-drizzle.svg',
  express: '/tool-icons/si-express.svg',
  'gmail api': '/tool-icons/si-gmail.svg',
  'gpt-4o': '/tool-icons/openai.svg',
  hono: '/tool-icons/si-hono.svg',
  html: '/tool-icons/si-html.svg',
  javascript: '/tool-icons/si-javascript.svg',
  langchain: '/tool-icons/si-langchain.svg',
  markdown: '/tool-icons/si-markdown.svg',
  marked: '/tool-icons/marked.png',
  'node.js': '/tool-icons/si-nodejs.svg',
  numpy: '/tool-icons/si-numpy.svg',
  python: '/tool-icons/si-python.svg',
  pytorch: '/tool-icons/si-pytorch.svg',
  react: '/tool-icons/si-react.svg',
  shiki: '/tool-icons/shiki.png',
  'tailwind css': '/tool-icons/si-tailwindcss.svg',
  typescript: '/tool-icons/si-typescript.svg',
  vite: '/tool-icons/si-vite.svg',
};

const monochromeProjectTools = new Set(['angular', 'express', 'claude api', 'gpt-4o', 'markdown', 'marked']);
const paleProjectTools = new Set(['drizzle orm']);

export const ProjectsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, projectVariant = 5 }) => {
  if (posts.length === 0) return <EmptyState query={query} />;

  return (
    <div className={projectVariant === 5 ? 'project-exhibition-list max-w-6xl mx-auto' : 'max-w-4xl mx-auto border-t border-th-border'}>
      {posts.map((post, index) => {
        const excerpt = getExcerpt(post.content, query);
        const matchCount = query ? getMatchCount(post.content, query) : 0;
        const status = post.status ? (STATUS_CONFIG[post.status]?.label || post.status) : 'Project';
        const title = <Highlight text={post.displayTitle || post.title} query={query} />;
        const description = <Highlight text={post.description} query={query} />;
        const technologies = getProjectDisplayTechnologies(post.technologies);

        if (projectVariant === 5) return (
          <article key={post.id} className="project-exhibition-card group">
            <Link to={postPath(post.category, post.id)}>
              <span className="project-exhibition-image">
                {post.thumbnail ? <img src={post.thumbnail} alt="" loading="lazy" /> : <i>{String(index + 1).padStart(2, '0')}</i>}
              </span>
              <span className="project-exhibition-copy">
                <span className="project-exhibition-meta"><span><i>P{String(index + 1).padStart(2, '0')}</i><b>{status}</b></span><time>{formatDateTimeline(post.date)}</time></span>
                <strong><Highlight text={post.displayTitle || post.title} query={query} /></strong>
                <small><Highlight text={post.description} query={query} /></small>
                <span className="project-exhibition-tags">{technologies.map(technology => {
                  const icon = projectToolIcons[technology.toLowerCase()];
                  const key = technology.toLowerCase();
                  const treatment = monochromeProjectTools.has(key) ? ' is-monochrome' : paleProjectTools.has(key) ? ' is-pale' : '';
                  return <i key={technology}>{icon && <span className={`project-tool-icon${treatment}`} aria-hidden="true"><img src={icon} alt="" /></span>}{technology}</i>;
                })}</span>
                {excerpt && <em><Highlight text={excerpt} query={query} />{matchCount > 0 && ` · ${matchCount} matches`}</em>}
              </span>
            </Link>
          </article>
        );

        if (projectVariant === 2) return (
          <article key={post.id} className="group border-b border-th-border">
            <Link to={postPath(post.category, post.id)} className="grid grid-cols-[2.2rem_minmax(0,1fr)] md:grid-cols-[2.2rem_6.5rem_minmax(0,1fr)_6rem] gap-x-4 md:gap-x-6 items-baseline py-5 md:py-6">
              <span className="text-[8px] font-mono text-th-muted">{String(index + 1).padStart(2, '0')}</span>
              <time className="hidden md:block text-[9px] font-mono text-th-muted">{formatDateTimeline(post.date)}</time>
              <span className="min-w-0">
                <span className="project-list-title block text-xl md:text-[1.65rem] leading-tight text-th-heading transition-colors">{title}</span>
                <span className="block mt-1.5 text-xs md:text-sm leading-relaxed text-th-tertiary font-sans line-clamp-1">{description}</span>
                {excerpt && <span className="block mt-2 text-xs text-th-tertiary line-clamp-1"><Highlight text={excerpt} query={query} /> {matchCount > 0 && `· ${matchCount} matches`}</span>}
              </span>
              <span className="hidden md:block justify-self-end text-[8px] font-mono uppercase tracking-[.14em] text-th-muted">{status}</span>
            </Link>
          </article>
        );

        if (projectVariant === 3) return (
          <article key={post.id} className="group border-b border-th-border py-5 md:py-6">
            <Link to={postPath(post.category, post.id)} className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[11rem_minmax(0,1fr)_7.5rem] gap-4 md:gap-6 items-stretch">
              <span className="relative hidden md:block min-h-28 overflow-hidden border border-th-border bg-th-surface-alt">
                {post.thumbnail ? <img src={post.thumbnail} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale-[20%]" /> : <span className="absolute inset-0 grid place-items-center text-[9px] font-mono text-th-muted">{String(index + 1).padStart(2, '0')}</span>}
                <span className="absolute top-2 left-2 px-1.5 py-1 bg-th-base/85 text-[8px] font-mono text-th-secondary">{String(index + 1).padStart(2, '0')}</span>
              </span>
              <span className="min-w-0 self-center">
                <span className="project-list-title block text-xl md:text-2xl leading-tight text-th-heading transition-colors">{title}</span>
                <span className="block mt-2 text-sm leading-relaxed text-th-secondary font-sans line-clamp-2">{description}</span>
                {excerpt && <span className="block mt-2 text-xs text-th-tertiary line-clamp-1"><Highlight text={excerpt} query={query} /></span>}
              </span>
              <span className="hidden md:flex flex-col justify-between border-l border-th-border pl-4 py-1 text-[8px] font-mono uppercase tracking-[.1em] text-th-muted">
                <span>{status}</span><span>{technologies.join(' · ') || 'Independent'}</span><time>{formatDateTimeline(post.date)}</time>
              </span>
            </Link>
          </article>
        );

        if (projectVariant === 4) return (
          <article key={post.id} className="group border-b border-th-border py-4 md:py-5">
            <Link to={postPath(post.category, post.id)} className="grid grid-cols-[2rem_5rem_minmax(0,1fr)] md:grid-cols-[2rem_7.5rem_minmax(0,1fr)_auto] gap-3 md:gap-5 items-start">
              <span className="text-[8px] font-mono text-th-muted pt-1">P/{String(index + 1).padStart(2, '0')}</span>
              <span className="relative block w-20 md:w-[7.5rem] aspect-[4/3] overflow-hidden border border-th-border bg-th-surface-alt">
                {post.thumbnail
                  ? <img src={post.thumbnail} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale-[18%]" />
                  : <span className="absolute inset-0 grid place-items-center text-[7px] font-mono text-th-muted">{String(index + 1).padStart(2, '0')}</span>}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="project-list-title text-lg md:text-xl leading-tight text-th-heading transition-colors">{title}</span>
                  <span className="text-[8px] font-mono uppercase tracking-[.13em] text-th-muted">{status} · {formatDateTimeline(post.date)}</span>
                </span>
                <span className="block mt-2 text-xs md:text-sm leading-relaxed text-th-secondary font-sans line-clamp-1">{description}</span>
                <span className="flex flex-wrap gap-1.5 mt-3">{technologies.map(technology => <span key={technology} className="px-2 py-1 border border-th-border text-[8px] font-mono uppercase tracking-[.08em] text-th-tertiary">{technology}</span>)}</span>
                {excerpt && <span className="block mt-2 text-xs text-th-tertiary line-clamp-1"><Highlight text={excerpt} query={query} /> {matchCount > 0 && `· ${matchCount}`}</span>}
              </span>
              <span className="hidden md:block text-th-muted text-sm pt-1 transition-colors group-hover:text-[var(--cat-projects-accent)]">↗</span>
            </Link>
          </article>
        );

        return (
          <article key={post.id} className="group border-b border-th-border py-6 md:py-7">
            <Link to={postPath(post.category, post.id)} className="grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[2rem_7rem_minmax(0,1fr)_8rem] gap-4 md:gap-5 items-start">
              <span className="text-[9px] font-mono text-th-muted pt-1">{String(index + 1).padStart(2, '0')}</span>

              {post.thumbnail ? (
                <img src={post.thumbnail} alt="" loading="lazy" className="hidden md:block w-28 h-20 object-cover grayscale-[20%] border border-th-border" />
              ) : (
                <div className="hidden md:flex w-28 h-20 border border-th-border items-center justify-center">
                  <span className={`w-2 h-2 rounded-full ${index % 3 === 0 ? 'bg-red-500' : index % 3 === 1 ? 'bg-blue-500' : 'bg-green-600'}`} />
                </div>
              )}

              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-th-tertiary">{status}</span>
                  <span className="text-[9px] font-mono text-th-muted">{formatDateTimeline(post.date)}</span>
                </span>
                <span className="project-list-title block text-xl md:text-2xl leading-tight text-th-heading transition-colors">
                  {title}
                </span>
                <span className="block mt-2 text-sm leading-relaxed text-th-secondary font-sans line-clamp-2">
                  {description}
                </span>
                {excerpt && <span className="block mt-3 text-xs text-th-tertiary font-sans line-clamp-2"><Highlight text={excerpt} query={query} /> {matchCount > 0 && `· ${matchCount} matches`}</span>}
              </span>

              <span className="hidden md:block text-right text-[9px] font-mono uppercase tracking-[0.12em] text-th-muted pt-1">
                {(post.technologies || []).slice(0, 2).join(' · ') || (post.tags || []).slice(0, 2).join(' · ')}
              </span>
            </Link>
          </article>
        );
      })}
    </div>
  );
};
