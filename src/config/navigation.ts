// Navigation items and social links

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
  { path: '/home', label: 'home', colorClass: 'text-gray-900' },
  { path: '/projects', label: 'projects', colorClass: 'text-emerald-600', activeAccent: '#10B981' },
  { path: '/threads', label: 'threads', colorClass: 'text-amber-600', activeAccent: '#F59E0B' },
  { path: '/bits2bricks', label: 'bits2bricks', colorClass: 'text-blue-600', activeAccent: '#3B82F6' },
  { path: '/second-brain', label: 'notes', colorClass: 'text-gray-900' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://github.com/yago', label: 'GitHub', hoverClass: 'hover:text-white hover:bg-white/10' },
  { href: 'https://linkedin.com/in/yago', label: 'LinkedIn', hoverClass: 'hover:text-blue-400 hover:bg-blue-400/10' },
  { href: 'https://x.com/yago', label: 'Twitter/X', hoverClass: 'hover:text-white hover:bg-white/10' },
];

export const CONTACT_EMAIL = 'yago@infraphysics.net';
