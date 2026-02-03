// Category metadata with associated icons and colors — dark theme

import React from 'react';
import { GearIcon, ThreadIcon, GradCapIcon } from '../components/icons';
import { Category } from '../types';

export interface CategoryDisplayConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  accent: string;
  darkBadge: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryDisplayConfig> = {
  projects: {
    title: 'Projects',
    description: "What I've built, why, and what broke along the way.",
    icon: <GearIcon />,
    colorClass: 'text-lime-400',
    bgClass: 'bg-lime-400/10',
    borderClass: 'border-lime-400/20',
    accent: '#a3e635',
    darkBadge: 'text-lime-400 border-lime-400/30 bg-lime-400/10',
  },
  threads: {
    title: 'Threads',
    description: 'Long-form thinking on engineering, systems, and how things work.',
    icon: <ThreadIcon />,
    colorClass: 'text-amber-200',
    bgClass: 'bg-amber-200/10',
    borderClass: 'border-amber-200/20',
    accent: '#fb7185',
    darkBadge: 'text-amber-200 border-amber-200/30 bg-amber-200/10',
  },
  bits2bricks: {
    title: 'Bits2Bricks',
    description: 'Where code meets atoms. Hardware, fabrication, physical computing.',
    icon: <GradCapIcon />,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-400/10',
    borderClass: 'border-blue-400/20',
    accent: '#3B82F6',
    darkBadge: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  },
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
