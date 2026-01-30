// Design tokens for consistent styling

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
  category: {
    projects: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: '#10B981' },
    threads: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', accent: '#F59E0B' },
    bits2bricks: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', accent: '#3B82F6' },
    secondBrain: { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', accent: '#8B5CF6' },
  },
  status: {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    archived: 'bg-gray-400',
    'in-progress': 'bg-amber-500',
  },
} as const;
