// Category accent colors — constant across dark/light themes
// Derived from CATEGORY_CONFIG; only secondBrain and meta are standalone.

import { CATEGORY_CONFIG } from '../config/categories';

export const CATEGORY_ACCENTS = {
  projects: CATEGORY_CONFIG.projects.accent,
  threads: CATEGORY_CONFIG.threads.accent,
  bits2bricks: CATEGORY_CONFIG.bits2bricks.accent,
  secondBrain: '#8B5CF6',
  meta: '#3B82F6',
} as const;
