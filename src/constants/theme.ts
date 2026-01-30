// Design tokens for consistent styling — dark-first

export const COLORS = {
  sidebar: {
    bg: '#2D2D2D',
    icon: '#9AA0A6',
    text: '#E8EAED',
    textActive: '#FFFFFF',
    hoverBg: 'rgba(255,255,255,0.05)',
    activeBg: 'rgba(59, 130, 246, 0.15)',
    activeAccent: '#3B82F6',
    sectionLabel: '#6B7280',
  },
  surface: {
    base: '#000000',
    elevated: '#0A0A0A',
    hover: '#111111',
  },
  border: {
    default: 'rgba(255,255,255,0.08)',
    hover: 'rgba(255,255,255,0.15)',
    active: 'rgba(255,255,255,0.25)',
  },
  text: {
    primary: '#E8EAED',
    secondary: '#9AA0A6',
    tertiary: '#6B7280',
  },
  category: {
    projects: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', accent: '#10B981' },
    threads: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', accent: '#F59E0B' },
    bits2bricks: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', accent: '#3B82F6' },
    secondBrain: { text: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', accent: '#8B5CF6' },
  },
  status: {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    archived: 'bg-gray-400',
    'in-progress': 'bg-amber-500',
  },
} as const;
