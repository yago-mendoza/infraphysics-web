// Category metadata with associated icons and colors — dark theme

import React from 'react';
import { GearIcon, ThreadIcon, GradCapIcon } from '../components/icons';
import { Category } from '../types';

export interface CategoryDisplayConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lightColor?: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  accent: string;
  lightAccent?: string;
  darkBadge: string;
  backLabel: string;
  relatedLabel: string;
  relatedCategory: string; // Target category for "Related" section
  breadcrumbLabel?: string;
}

function categoryColors(color: string) {
  return {
    colorClass: `text-${color}`,
    bgClass: `bg-${color}/10`,
    borderClass: `border-${color}/20`,
    darkBadge: `text-${color} border-${color}/30 bg-${color}/10`,
  };
}

export const CATEGORY_CONFIG: Record<string, CategoryDisplayConfig> = {
  projects: {
    title: 'Projects',
    description: "What I've built, why, and what broke along the way.",
    icon: <GearIcon />,
    color: 'lime-400',
    lightColor: 'lime-800',
    accent: '#a3e635',
    lightAccent: '#3f6212',
    backLabel: 'RETURN_TO_ARCHIVES',
    relatedLabel: 'Related Lessons',
    relatedCategory: 'bits2bricks',
    ...categoryColors('lime-400'),
  },
  threads: {
    title: 'Threads',
    description: 'Long-form thinking on engineering, systems, and how things work.',
    icon: <ThreadIcon />,
    color: 'rose-400',
    lightColor: 'rose-700',
    accent: '#fb7185',
    lightAccent: '#be123c',
    backLabel: 'RETURN_TO_THREADS',
    relatedLabel: 'Related Threads',
    relatedCategory: 'threads',
    breadcrumbLabel: 'threads',
    ...categoryColors('rose-400'),
  },
  bits2bricks: {
    title: 'Bits2Bricks',
    description: 'Where code meets atoms. Hardware, fabrication, physical computing.',
    icon: <GradCapIcon />,
    color: 'blue-400',
    lightColor: 'blue-700',
    accent: '#3B82F6',
    lightAccent: '#1d4ed8',
    backLabel: 'RETURN_TO_BITS2BRICKS',
    relatedLabel: 'Related Projects',
    relatedCategory: 'projects',
    breadcrumbLabel: 'bits2bricks',
    ...categoryColors('blue-400'),
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

/**
 * Get theme-aware color/accent for a category.
 * Falls back to dark values when no light override exists.
 */
export const getThemedColor = (cat: string, theme: 'dark' | 'light'): { color: string; accent: string } => {
  const cfg = CATEGORY_CONFIG[cat];
  if (!cfg) return { color: 'gray-400', accent: '#9ca3af' };
  if (theme === 'light' && (cfg.lightColor || cfg.lightAccent)) {
    return { color: cfg.lightColor || cfg.color, accent: cfg.lightAccent || cfg.accent };
  }
  return { color: cfg.color, accent: cfg.accent };
};

/**
 * Get category color class (text color)
 */
export const getCategoryColor = (cat: Category): string =>
  CATEGORY_CONFIG[cat]?.colorClass || 'text-gray-400';

/**
 * Get category background classes (bg + border)
 */
export const getCategoryBg = (cat: Category): string => {
  const cfg = CATEGORY_CONFIG[cat];
  return cfg ? `${cfg.bgClass} ${cfg.borderClass}` : 'bg-white/5 border-white/10';
};
