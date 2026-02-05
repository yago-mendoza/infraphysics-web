// Accent colors for non-category navigation items (constant across themes).
// Category accents (projects, threads, bits2bricks) are CSS custom properties
// (--cat-*-accent) defined in index.html, accessed via catAccentVar() in config/categories.tsx.

export const CATEGORY_ACCENTS = {
  secondBrain: '#8B5CF6',
  meta: '#9AA0A6',
} as const;
