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
  { path: '/about', label: 'about', colorClass: 'text-gray-900' },
  { path: '/projects', label: 'projects', colorClass: 'text-emerald-600', activeAccent: '#10B981' },
  { path: '/threads', label: 'threads', colorClass: 'text-amber-600', activeAccent: '#F59E0B' },
  { path: '/bits2bricks', label: 'bits2bricks', colorClass: 'text-blue-600', activeAccent: '#3B82F6' },
  { path: '/second-brain', label: '2ⁿᵈ Brain', colorClass: 'text-violet-600', activeAccent: '#8B5CF6' },
  { path: '/contact', label: 'contact', colorClass: 'text-gray-900' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://github.com/yago-mendoza', label: 'GitHub', hoverClass: 'hover:text-white hover:bg-white/10' },
  { href: 'https://linkedin.com/in/yago-mendoza', label: 'LinkedIn', hoverClass: 'hover:text-blue-400 hover:bg-blue-400/10' },
  { href: 'https://x.com/ymdatweets', label: 'Twitter/X', hoverClass: 'hover:text-white hover:bg-white/10' },
];

export const CONTACT_EMAIL = 'contact@infraphysics.net';
