// Category metadata with associated icons and colors — dark theme

import React from 'react';
import { GearIcon, ThreadIcon, GradCapIcon } from '../components/icons';
import { Category } from '../types';

export interface CategoryDisplayConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  accent: string;
  darkBadge: string;
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
    accent: '#a3e635',
    ...categoryColors('lime-400'),
  },
  threads: {
    title: 'Threads',
    description: 'Long-form thinking on engineering, systems, and how things work.',
    icon: <ThreadIcon />,
    color: 'rose-400',
    accent: '#fb7185',
    ...categoryColors('rose-400'),
  },
  bits2bricks: {
    title: 'Bits2Bricks',
    description: 'Where code meets atoms. Hardware, fabrication, physical computing.',
    icon: <GradCapIcon />,
    color: 'blue-400',
    accent: '#3B82F6',
    ...categoryColors('blue-400'),
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
