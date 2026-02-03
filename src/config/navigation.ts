// Navigation items and social links

import { CATEGORY_CONFIG } from './categories';

export interface NavItem {
  path: string;
  label: string;
  colorClass: string;
  activeAccent?: string;
}

export interface SocialLink {
  href: string;
  label: string;
  hoverClass: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/home', label: 'home', colorClass: 'text-blue-400', activeAccent: '#3B82F6' },
  { path: '/about', label: 'about', colorClass: 'text-gray-200' },
  { path: '/lab/projects', label: 'projects', colorClass: CATEGORY_CONFIG.projects.colorClass, activeAccent: CATEGORY_CONFIG.projects.accent },
  { path: '/blog/threads', label: 'threads', colorClass: CATEGORY_CONFIG.threads.colorClass, activeAccent: CATEGORY_CONFIG.threads.accent },
  { path: '/blog/bits2bricks', label: 'bits2bricks', colorClass: CATEGORY_CONFIG.bits2bricks.colorClass, activeAccent: CATEGORY_CONFIG.bits2bricks.accent },
  { path: '/lab/second-brain', label: '2\u207F\u1D48 Brain', colorClass: 'text-violet-400', activeAccent: '#8B5CF6' },
  { path: '/contact', label: 'contact', colorClass: 'text-gray-200' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://github.com/yago-mendoza', label: 'GitHub', hoverClass: 'hover:text-white hover:bg-white/10' },
  { href: 'https://linkedin.com/in/yago-mendoza', label: 'LinkedIn', hoverClass: 'hover:text-blue-400 hover:bg-blue-400/10' },
  { href: 'https://x.com/ymdatweets', label: 'Twitter/X', hoverClass: 'hover:text-white hover:bg-white/10' },
];

export const CONTACT_EMAIL = 'contact@infraphysics.net';
