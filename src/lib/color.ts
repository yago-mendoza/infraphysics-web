import type { CSSProperties } from 'react';

/** Convert a hex color (#RRGGBB) to an rgba string with the given alpha (0-1). */
export function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** CSS custom-property style object for an .accent-chip element. */
export function accentChipStyle(accent: string, active: boolean): CSSProperties {
  return {
    '--ac-border': active ? hexAlpha(accent, 0.5) : hexAlpha(accent, 0.2),
    '--ac-color': active ? accent : hexAlpha(accent, 0.6),
    '--ac-bg': active ? hexAlpha(accent, 0.2) : undefined,
    '--ac-border-hover': active ? undefined : hexAlpha(accent, 0.4),
  } as CSSProperties;
}
