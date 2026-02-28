// Category metadata with associated icons and colors — dark theme

import React from 'react';
import { GearIcon, ThreadIcon, GradCapIcon } from '../components/icons';

export interface CategoryDisplayConfig {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  accentVar: string;          // CSS var reference, e.g. 'var(--cat-projects-accent)'
  backLabel: string;
  relatedLabel: string;
  relatedCategory: string; // Target category for "Related" section
  breadcrumbLabel?: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryDisplayConfig> = {
  projects: {
    title: 'Projects',
    description: <>Things I build. Design decisions, dead ends and what stuck as it actually happened.</>,
    icon: <GearIcon />,
    accentVar: 'var(--cat-projects-accent)',
    backLabel: 'RETURN_TO_ARCHIVES',
    relatedLabel: 'Related Lessons',
    relatedCategory: 'bits2bricks',
  },
  threads: {
    title: 'Threads',
    description: <>Essays, takes, and personal rants about ideas that won't sit still. When something deserves more depth than an essay can give it, check bits2bricks.</>,
    icon: <ThreadIcon />,
    accentVar: 'var(--cat-threads-accent)',
    backLabel: 'RETURN_TO_THREADS',
    relatedLabel: 'Related Threads',
    relatedCategory: 'threads',
    breadcrumbLabel: 'threads',
  },
  bits2bricks: {
    title: 'Bits2Bricks',
    description: "Subjects I needed to understand, explained the way I wish someone had explained them to me. One topic at a time, taken apart until it clicks.",
    icon: <GradCapIcon />,
    accentVar: 'var(--cat-bits2bricks-accent)',
    backLabel: 'RETURN_TO_BITS2BRICKS',
    relatedLabel: 'Related Projects',
    relatedCategory: 'projects',
    breadcrumbLabel: 'bits2bricks',
  },
};

export const BLOG_CATEGORIES = new Set(['threads', 'bits2bricks']);

/** Whether a category uses the blog layout (threads, bits2bricks) */
export const isBlogCategory = (cat: string): boolean => BLOG_CATEGORIES.has(cat);

/** Route group for a category — 'blog' or 'lab' */
export const categoryGroup = (category: string): 'lab' | 'blog' =>
  BLOG_CATEGORIES.has(category) ? 'blog' : 'lab';

/** Full path to a post detail page, e.g. /lab/projects/my-id */
export const postPath = (category: string, id: string): string =>
  `/${categoryGroup(category)}/${category}/${id}`;

/** Full path to a section listing, e.g. /blog/threads */
export const sectionPath = (category: string): string =>
  `/${categoryGroup(category)}/${category}`;

/** CSS var reference for a category accent. Falls back to neutral gray. */
export const catAccentVar = (cat: string): string =>
  CATEGORY_CONFIG[cat]?.accentVar ?? '#9ca3af';

/** Path to a Second Brain page, or the index if no uid provided */
export const secondBrainPath = (uid?: string): string =>
  uid ? `/lab/second-brain/${uid}` : '/lab/second-brain';

/* ── Status metadata (shared across SectionView filters + ArticlePostView header) ── */

export const STATUS_CONFIG: Record<string, { label: string; accent: string; dotColor: string }> = {
  'ongoing':    { label: 'ONGOING',    accent: '#a78bfa', dotColor: '#a78bfa' },
  'deployed':   { label: 'DEPLOYED',   accent: '#34d399', dotColor: '#34d399' },
  'completed':  { label: 'COMPLETED',  accent: '#60a5fa', dotColor: '#60a5fa' },
  'arrested':   { label: 'ARRESTED',   accent: '#f87171', dotColor: '#f87171' },
};

