// Accent colors for non-category navigation items (constant across themes).
// Category accents (projects, essays, bits2bricks) are CSS custom properties
// (--cat-*-accent) defined in index.html, accessed via catAccentVar() in config/categories.tsx.

export const CATEGORY_ACCENTS = {
  secondBrain: 'var(--wiki-500)',
  meta: '#9AA0A6',
} as const;
