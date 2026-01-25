// Category metadata with associated icons and colors

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
}

export const CATEGORY_CONFIG: Record<string, CategoryDisplayConfig> = {
  projects: {
    title: 'Projects',
    description: 'Technical explorations, implementations, and case studies. Each project includes architecture decisions, challenges faced, and lessons learned.',
    icon: <GearIcon />,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    accent: '#10B981',
  },
  threads: {
    title: 'Threads',
    description: 'Long-form essays and connected thoughts on software engineering, systems design, and the philosophy of building things.',
    icon: <ThreadIcon />,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    accent: '#F59E0B',
  },
  bits2bricks: {
    title: 'Bits to Bricks',
    description: 'Hardware projects bridging digital logic and physical reality. From FPGAs to 3D printing, exploring where code meets atoms.',
    icon: <GradCapIcon />,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    accent: '#3B82F6',
  },
};

/**
 * Get category color class (text color)
 */
export const getCategoryColor = (cat: Category): string => {
  if (cat === 'projects') return 'text-emerald-600';
  if (cat === 'threads') return 'text-amber-600';
  if (cat === 'bits2bricks') return 'text-blue-600';
  return 'text-gray-600';
};

/**
 * Get category background classes (bg + border)
 */
export const getCategoryBg = (cat: Category): string => {
  if (cat === 'projects') return 'bg-emerald-50 border-emerald-200';
  if (cat === 'threads') return 'bg-amber-50 border-amber-200';
  if (cat === 'bits2bricks') return 'bg-blue-50 border-blue-200';
  return 'bg-gray-50 border-gray-200';
};
