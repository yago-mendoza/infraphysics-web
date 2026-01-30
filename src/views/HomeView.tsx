// Home page view — minimalist cosmic landing

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';
import { ArrowRightIcon } from '../components/icons';
import homeFeaturedData from '../data/home-featured.generated.json';

// Resolve featured post refs ("category/id") to actual Post objects
function resolveFeatured(refs: { ref: string; highlight?: string }[]): (Post & { highlight?: string })[] {
  const resolved: (Post & { highlight?: string })[] = [];
  for (const entry of refs) {
    const [category, id] = entry.ref.split('/');
    const post = posts.find(p => p.category === category && p.id === id);
    if (post) {
      resolved.push({ ...post, highlight: entry.highlight });
    }
  }
  return resolved;
}

// Category badge colors for dark theme
const badgeColors: Record<string, string> = {
  projects: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  threads: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  bits2bricks: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
};

export const HomeView: React.FC = () => {
  const featuredPosts = useMemo(() => resolveFeatured(homeFeaturedData.featured), []);

  return (
    <div className="flex flex-col animate-fade-in font-sans">

      {/* Hero */}
      <section className="pt-8 md:pt-20 pb-20">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-8">
            <span className="text-white">I chase questions</span>
            <br />
            <span className="text-gray-400">that don't have answers yet.</span>
          </h1>

          <p className="text-gray-400 leading-relaxed text-base max-w-lg">
            InfraPhysics is where engineering meets curiosity. I build at the intersection of
            software systems, hardware, and AI — exploring how intelligence becomes infrastructure
            and how complex systems emerge from simple rules.
          </p>
        </div>
      </section>

      {/* Latest Work */}
      <section className="pb-16 border-t border-white/10 pt-12">
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-8">Latest Work</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredPosts.map(post => (
            <Link
              key={post.id}
              to={`/${post.category}/${post.id}`}
              className="group p-5 border border-white/10 rounded-sm bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] transition-all"
            >
              {/* Category badge */}
              <span className={`inline-block px-2 py-0.5 text-[10px] uppercase border rounded-sm mb-3 ${badgeColors[post.category] || 'text-gray-400 border-gray-600'}`}>
                {post.category}
              </span>

              <h3 className="text-white font-semibold leading-snug mb-2 group-hover:text-blue-400 transition-colors lowercase">
                {post.displayTitle || post.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 font-sans">
                {post.highlight || post.description}
              </p>

              <span className="inline-flex items-center gap-1 mt-4 text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                Read <ArrowRightIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
