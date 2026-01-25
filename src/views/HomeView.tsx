// Home page view component

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { formatDate, formatRelativeTime, calculateReadingTime } from '../lib';
import { getCategoryColor, getCategoryBg } from '../config/categories';
import {
  Logo,
  GitHubIcon,
  ClockIcon,
  ArrowRightIcon,
  GearIcon,
  ThreadIcon,
  GradCapIcon,
  DiamondIcon
} from '../components/icons';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();

  // Get all non-fieldnotes posts sorted by date
  const sortedPosts = useMemo(() => {
    return posts
      .filter(p => p.category !== 'fieldnotes')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const latestPost = sortedPosts[0];
  const recentPosts = sortedPosts.slice(1, 5);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    posts.filter(p => p.category !== 'fieldnotes').forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });
    return stats;
  }, []);

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      {/* Hero Section - Professional Intro */}
      <section className="pb-8 border-b border-gray-200">
        {/* Name & Role */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-900 rounded-sm flex items-center justify-center flex-shrink-0">
            <Logo className="w-10 h-10" color="#E8EAED" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              Yago
            </h1>
            <p className="text-sm text-gray-500 font-mono">
              Software Engineer & Systems Thinker
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="max-w-2xl mb-6">
          <p className="text-gray-600 leading-relaxed mb-4">
            Building at the intersection of <span className="text-blue-600 font-medium">software entropy</span>, <span className="text-emerald-600 font-medium">hardware permanence</span>, and <span className="text-amber-600 font-medium">minimal logic</span>. I believe in systems that are simple enough to understand, robust enough to last, and elegant enough to inspire.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Currently exploring distributed systems, FPGA design, and the philosophy of building things that matter. This site is my public notebook — a collection of projects, essays, and observations from the frontier.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-6 mb-6 py-4 px-5 bg-gray-50 border border-gray-200 rounded-sm">
          <div>
            <span className="text-2xl font-bold text-gray-900">{sortedPosts.length}</span>
            <span className="text-xs font-mono text-gray-500 ml-2 uppercase">Publications</span>
          </div>
          <div className="border-l border-gray-300 pl-6">
            <span className="text-2xl font-bold text-gray-900">{posts.filter(p => p.category === 'fieldnotes').length}</span>
            <span className="text-xs font-mono text-gray-500 ml-2 uppercase">Notes</span>
          </div>
          <div className="border-l border-gray-300 pl-6">
            <span className="text-2xl font-bold text-gray-900">{Object.keys(categoryStats).length}</span>
            <span className="text-xs font-mono text-gray-500 ml-2 uppercase">Topics</span>
          </div>
        </div>

        {/* Social Links - Industrial Style */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-gray-400 uppercase">Connect:</span>
          <a
            href="https://github.com/yago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-gray-900 text-white rounded-sm hover:bg-gray-800 transition-colors"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/yago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-300 text-gray-600 rounded-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://x.com/yago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-300 text-gray-600 rounded-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="mailto:yago@infraphysics.net"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-300 text-gray-600 rounded-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
          >
            Email
          </a>
        </div>
      </section>

      {/* Featured / Latest Post */}
      {latestPost && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Latest
            </h2>
            <span className="text-[10px] font-mono text-gray-400">{formatRelativeTime(latestPost.date)}</span>
          </div>

          <div
            onClick={() => navigate(`/${latestPost.category}/${latestPost.id}`)}
            className="cursor-pointer group bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="md:flex">
              {/* Thumbnail */}
              <div className="md:w-1/3 aspect-video md:aspect-auto bg-gray-100">
                <img
                  src={latestPost.thumbnail || 'https://via.placeholder.com/400'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${getCategoryColor(latestPost.category)} ${getCategoryBg(latestPost.category)} border rounded-sm`}>
                    {latestPost.category}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{formatDate(latestPost.date)}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 group-hover:text-blue-600 transition-colors lowercase">
                  {latestPost.displayTitle || latestPost.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {latestPost.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <ClockIcon />
                    {calculateReadingTime(latestPost.content)} min read
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 group-hover:underline">
                    Read case study
                    <ArrowRightIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Cards */}
      <section>
        <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Projects */}
          <Link
            to="/projects"
            className="group p-5 bg-white border border-gray-200 rounded-sm hover:border-emerald-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-sm text-emerald-600">
                <GearIcon />
              </div>
              <span className="text-lg font-semibold group-hover:text-emerald-600 transition-colors">Projects</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Technical explorations and implementations with full case studies.</p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">{categoryStats['projects'] || 0} entries</span>
              <span className="text-emerald-600 flex items-center gap-1 group-hover:underline">
                Browse <ArrowRightIcon />
              </span>
            </div>
          </Link>

          {/* Threads */}
          <Link
            to="/threads"
            className="group p-5 bg-white border border-gray-200 rounded-sm hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-sm text-amber-600">
                <ThreadIcon />
              </div>
              <span className="text-lg font-semibold group-hover:text-amber-600 transition-colors">Threads</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Long-form essays on engineering, systems design, and philosophy.</p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">{categoryStats['threads'] || 0} entries</span>
              <span className="text-amber-600 flex items-center gap-1 group-hover:underline">
                Browse <ArrowRightIcon />
              </span>
            </div>
          </Link>

          {/* Bits2Bricks */}
          <Link
            to="/bits2bricks"
            className="group p-5 bg-white border border-gray-200 rounded-sm hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-sm text-blue-600">
                <GradCapIcon />
              </div>
              <span className="text-lg font-semibold group-hover:text-blue-600 transition-colors">Bits2Bricks</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Hardware projects bridging digital logic and physical reality.</p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">{categoryStats['bits2bricks'] || 0} entries</span>
              <span className="text-blue-600 flex items-center gap-1 group-hover:underline">
                Browse <ArrowRightIcon />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Recent</h2>
            <Link to="/projects" className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPosts.map(post => (
              <Link
                key={post.id}
                to={`/${post.category}/${post.id}`}
                className="group flex gap-4 items-start p-4 bg-white border border-gray-200 rounded-sm hover:border-gray-400 transition-all"
              >
                <div className="w-24 h-16 bg-gray-100 overflow-hidden flex-shrink-0 rounded-sm">
                  <img
                    src={post.thumbnail || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono uppercase ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono">{formatDate(post.date)}</span>
                  </div>
                  <h4 className="text-sm font-semibold leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 lowercase">
                    {post.displayTitle || post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Second Brain Promo */}
      <section className="p-6 bg-gray-900 text-white rounded-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-800 rounded-sm">
            <DiamondIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Second Brain</h3>
            <p className="text-sm text-gray-400 mb-4">
              A personal knowledge base with interconnected notes, observations, and working thoughts.
              Explore the raw material behind the polished publications.
            </p>
            <Link
              to="/second-brain"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-mono hover:bg-gray-100 transition-colors rounded-sm"
            >
              Explore Notes
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
