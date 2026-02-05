import type { CSSProperties } from 'react';

/** CSS custom-property style object for an .accent-chip element.
 *  Works with both CSS var references and raw hex values. */
export function accentChipStyle(accent: string, active: boolean): CSSProperties {
  return {
    '--ac-border': `color-mix(in srgb, ${accent} ${active ? 50 : 20}%, transparent)`,
    '--ac-color': active ? accent : `color-mix(in srgb, ${accent} 60%, transparent)`,
    '--ac-bg': active ? `color-mix(in srgb, ${accent} 20%, transparent)` : undefined,
    '--ac-border-hover': active ? undefined : `color-mix(in srgb, ${accent} 40%, transparent)`,
  } as CSSProperties;
}
