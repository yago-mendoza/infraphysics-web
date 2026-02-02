// Single post/case study view component — theme-aware

import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts } from '../data/data';
import { formatDate, formatRelativeTime, calculateReadingTime } from '../lib';
import { allFieldNotes } from '../lib/brainIndex';
import { StatusBadge } from '../components/ui';
import { WikiContent } from '../components/WikiContent';
import {
  GitHubIcon,
  ExternalLinkIcon,
  ArrowRightIcon
} from '../components/icons';

export const PostView: React.FC = () => {
  const { category, id } = useParams();
  const post = posts.find(p => p.id === id && p.category === category);

  const recommendedPosts = useMemo(() => {
    if (!post) return [];
    const others = posts.filter(p => p.id !== post.id && p.category !== 'fieldnotes');
    const shuffled = others.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [post]);

  if (!post) return (
    <div className="py-20 text-center">
      <div className="text-6xl mb-4 text-th-muted">404</div>
      <p className="text-th-tertiary">Entry not found in the archive</p>
      <Link to="/home" className="inline-block mt-6 px-4 py-2 bg-th-active text-th-heading text-sm hover:bg-th-active-hover transition-colors border border-th-border">
        Return Home
      </Link>
    </div>
  );

  let accentClass = "text-th-secondary";
  let accentBadge = "text-th-secondary border-th-border bg-th-surface";
  if (post.category === 'projects') { accentClass = "text-emerald-400"; accentBadge = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"; }
  if (post.category === 'threads') { accentClass = "text-amber-400"; accentBadge = "text-amber-400 border-amber-400/30 bg-amber-400/10"; }
  if (post.category === 'bits2bricks') { accentClass = "text-blue-400"; accentBadge = "text-blue-400 border-blue-400/30 bg-blue-400/10"; }

  const isBlog = post.category === 'threads' || post.category === 'bits2bricks';
  const sectionPath = isBlog ? `/blog/${post.category}` : `/lab/${post.category}`;
  const sectionGroup = isBlog ? 'blog' : 'lab';

  return (
    <article className="animate-fade-in max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-th-tertiary flex items-center gap-2">
        <Link to="/home" className="hover:text-th-secondary transition-colors">home</Link>
        <span className="text-th-muted">/</span>
        <span className="text-th-muted">{sectionGroup}</span>
        <span className="text-th-muted">/</span>
        <Link to={sectionPath} className="hover:text-th-secondary transition-colors">{post.category}</Link>
        <span className="text-th-muted">/</span>
        <span className="text-th-secondary">{post.id}</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-10">
        {/* Category & Meta Line */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link
            to={labPath}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-wider border rounded-sm hover:opacity-80 transition-opacity ${accentBadge}`}
          >
            {post.category}
          </Link>
          {post.status && <StatusBadge status={post.status} />}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold lowercase tracking-tight mb-4 text-th-heading">
          {post.displayTitle || post.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-th-secondary leading-relaxed mb-6 font-sans">
          {post.description}
        </p>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-th-surface-alt border border-th-border rounded-sm">
          <div>
            <span className="text-[10px] text-th-tertiary uppercase block mb-1">Published</span>
            <span className="text-sm font-medium text-th-primary">{formatDate(post.date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-th-tertiary uppercase block mb-1">Read Time</span>
            <span className="text-sm font-medium text-th-primary">{calculateReadingTime(post.content)} min</span>
          </div>
          <div>
            <span className="text-[10px] text-th-tertiary uppercase block mb-1">Updated</span>
            <span className="text-sm font-medium text-th-primary">{formatRelativeTime(post.date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-th-tertiary uppercase block mb-1">Source</span>
            {post.github ? (
              <a
                href={post.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <GitHubIcon />
                GitHub
                <ExternalLinkIcon />
              </a>
            ) : (
              <span className="text-sm text-th-tertiary">—</span>
            )}
          </div>
        </div>

        {/* Technologies Tags */}
        {post.technologies && post.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[10px] text-th-tertiary uppercase">Stack:</span>
            {post.technologies.map(tech => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] bg-th-elevated text-th-secondary rounded-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {post.thumbnail && (
        <div className="mb-10 aspect-video bg-th-surface-alt border border-th-border rounded-sm overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.displayTitle || post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <WikiContent
        html={post.content}
        allFieldNotes={allFieldNotes}
        className="max-w-none text-base leading-loose text-th-secondary font-light content-html"
      />

      {/* Share & Actions Bar */}
      <div className="mt-12 pt-6 border-t border-th-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-th-tertiary">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.displayTitle || post.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-th-tertiary hover:text-blue-400 transition-colors text-sm"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-th-tertiary hover:text-blue-400 transition-colors text-sm"
          >
            LinkedIn
          </a>
        </div>
        {post.github && (
          <a
            href={post.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-th-active text-th-heading text-xs hover:bg-th-active-hover transition-colors rounded-sm border border-th-border"
          >
            <GitHubIcon />
            View on GitHub
          </a>
        )}
      </div>

      {/* Related Posts */}
      <div className="mt-16 pt-8 border-t border-th-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs text-th-tertiary uppercase tracking-wider">Related Case Studies</h3>
          <Link to={labPath} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            View all <ArrowRightIcon />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedPosts.map(rec => {
            let recAccent = "text-th-secondary";
            if (rec.category === 'projects') recAccent = "text-emerald-400";
            if (rec.category === 'threads') recAccent = "text-amber-400";
            if (rec.category === 'bits2bricks') recAccent = "text-blue-400";

            return (
              <Link key={rec.id} to={`/${rec.category}/${rec.id}`} className="group block border border-th-border rounded-sm overflow-hidden bg-th-surface hover:border-th-border-hover transition-all">
                <div className="aspect-video bg-th-surface-alt overflow-hidden">
                  <img src={rec.thumbnail || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-[10px] uppercase ${recAccent}`}>{rec.category}</span>
                    <span className="text-[10px] text-th-tertiary">{formatDate(rec.date)}</span>
                  </div>
                  <h4 className="text-sm font-semibold leading-tight text-th-primary group-hover:text-blue-400 transition-colors lowercase">{rec.displayTitle || rec.title}</h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
};
