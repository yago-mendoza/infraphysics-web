// Single post/case study view component

import React, { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { formatDate, formatRelativeTime, calculateReadingTime } from '../lib';
import { StatusBadge } from '../components/ui';
import { WikiContent } from '../components/WikiContent';
import {
  GitHubIcon,
  ExternalLinkIcon,
  ArrowRightIcon
} from '../components/icons';

export const PostView: React.FC = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id && p.category === category);

  // All fieldnotes for wiki-link resolution
  const allFieldNotes = useMemo(() => posts.filter(p => p.category === 'fieldnotes'), []);

  // Get random recommended posts
  const recommendedPosts = useMemo(() => {
    if (!post) return [];
    const others = posts.filter(p => p.id !== post.id && p.category !== 'fieldnotes');
    const shuffled = others.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [post]);

  if (!post) return (
    <div className="py-20 text-center">
      <div className="text-6xl mb-4 text-gray-200">404</div>
      <p className="text-gray-400">Entry not found in the archive</p>
      <Link to="/home" className="inline-block mt-6 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800 transition-colors">
        Return Home
      </Link>
    </div>
  );

  let accentClass = "text-gray-500";
  let accentBg = "bg-gray-100";
  let accentBorder = "border-gray-300";
  if (post.category === 'projects') { accentClass = "text-emerald-600"; accentBg = "bg-emerald-50"; accentBorder = "border-emerald-200"; }
  if (post.category === 'threads') { accentClass = "text-amber-600"; accentBg = "bg-amber-50"; accentBorder = "border-amber-200"; }
  if (post.category === 'bits2bricks') { accentClass = "text-blue-600"; accentBg = "bg-blue-50"; accentBorder = "border-blue-200"; }

  // Mock project metadata - in real app would come from post frontmatter
  const projectMeta = {
    status: 'completed' as const,
    github: `https://github.com/yago-mendoza/${post.id}`,
    technologies: ['React', 'TypeScript', 'Vite'],
    duration: '3 months'
  };

  return (
    <article className="animate-fade-in max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-gray-400 flex items-center gap-2">
        <Link to="/home" className="hover:text-gray-600 transition-colors">home</Link>
        <span>/</span>
        <Link to={`/${post.category}`} className={`hover:text-gray-600 transition-colors`}>{post.category}</Link>
        <span>/</span>
        <span className="text-gray-600">{post.id}</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-10">
        {/* Category & Meta Line */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link
            to={`/${post.category}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-wider ${accentBg} ${accentClass} ${accentBorder} border rounded-sm hover:opacity-80 transition-opacity`}
          >
            {post.category}
          </Link>
          <StatusBadge status={projectMeta.status} />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold lowercase tracking-tight mb-4">
          {post.displayTitle || post.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-500 leading-relaxed mb-6 font-sans">
          {post.description}
        </p>

        {/* Meta Grid - Industrial Info Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
          <div>
            <span className="text-[10px] text-gray-400 uppercase block mb-1">Published</span>
            <span className="text-sm font-medium">{formatDate(post.date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase block mb-1">Read Time</span>
            <span className="text-sm font-medium">{calculateReadingTime(post.content)} min</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase block mb-1">Updated</span>
            <span className="text-sm font-medium">{formatRelativeTime(post.date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase block mb-1">Source</span>
            <a
              href={projectMeta.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <GitHubIcon />
              GitHub
              <ExternalLinkIcon />
            </a>
          </div>
        </div>

        {/* Technologies Tags */}
        {post.category === 'projects' && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[10px] text-gray-400 uppercase">Stack:</span>
            {projectMeta.technologies.map(tech => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] bg-gray-900 text-white rounded-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {post.thumbnail && (
        <div className="mb-10 aspect-video bg-gray-100 border border-gray-200 rounded-sm overflow-hidden">
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
        className="max-w-none text-base leading-loose text-gray-800 font-light content-html"
      />

      {/* Share & Actions Bar */}
      <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.displayTitle || post.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-700 transition-colors text-sm"
          >
            LinkedIn
          </a>
        </div>
        <a
          href={projectMeta.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs hover:bg-gray-800 transition-colors rounded-sm"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </div>

      {/* Related Posts - Case Studies */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider">Related Case Studies</h3>
          <Link to={`/${post.category}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRightIcon />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedPosts.map(rec => {
            let recAccent = "text-gray-500";
            if (rec.category === 'projects') recAccent = "text-emerald-600";
            if (rec.category === 'threads') recAccent = "text-amber-600";
            if (rec.category === 'bits2bricks') recAccent = "text-blue-600";

            return (
              <Link key={rec.id} to={`/${rec.category}/${rec.id}`} className="group block bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img src={rec.thumbnail || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-[10px] uppercase ${recAccent}`}>{rec.category}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(rec.date)}</span>
                  </div>
                  <h4 className="text-sm font-semibold leading-tight group-hover:text-blue-600 transition-colors lowercase">{rec.displayTitle || rec.title}</h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
};
