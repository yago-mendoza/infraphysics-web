// The wiki's accent colour, read from the one place it is defined: the
// `--wiki-accent` custom property in index.html. CSS derives the whole scale
// (`--wiki-50` … `--wiki-950`) from it with color-mix in sRGB; this module
// derives the same steps in JS for the canvas and three.js graph code, which
// cannot use CSS variables. Keep the mix ratios here and in index.html equal.

export type Rgb = [number, number, number];

const FALLBACK: Rgb = [167, 139, 250];
// Same percentages as the color-mix() declarations in index.html.
const WHITE_MIX: Record<number, number> = { 50: .9, 100: .8, 200: .6, 300: .35 };
const BLACK_MIX: Record<number, number> = { 500: .15, 600: .3, 700: .4, 800: .48, 900: .58, 950: .72 };

let cached: Rgb | null = null;

function parse(value: string): Rgb | null {
  const v = value.trim();
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map(i => parseInt(m![1].slice(i, i + 2), 16)) as Rgb;
  m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) return [0, 1, 2].map(i => parseInt(m![1][i] + m![1][i], 16)) as Rgb;
  m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]].map(Math.round) as Rgb;
  m = v.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]].map(c => Math.round(c * 255)) as Rgb;
  return null;
}

/** Base accent as an rgb triplet (the `--wiki-accent` value, resolved). */
export function wikiAccentRgb(): Rgb {
  if (cached) return cached;
  if (typeof document === 'undefined') return FALLBACK;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--wiki-accent');
  cached = parse(raw) ?? FALLBACK;
  return cached;
}

const mix = (base: Rgb, target: number, amount: number): Rgb => base.map(c => Math.round(c + (target - c) * amount)) as Rgb;

/** One step of the scale (50 … 950), same mixes as the CSS custom properties. */
export function wikiStepRgb(step: number): Rgb {
  const base = wikiAccentRgb();
  if (step in WHITE_MIX) return mix(base, 255, WHITE_MIX[step]);
  if (step in BLACK_MIX) return mix(base, 0, BLACK_MIX[step]);
  return base;
}

export const wikiStepCss = (step: number, alpha = 1) => {
  const [r, g, b] = wikiStepRgb(step);
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
};

/** Centrality ramp endpoints (dark hubs to light leaves): steps 800 and 300. */
export const wikiRamp = (): { low: Rgb; high: Rgb } => ({ low: wikiStepRgb(800), high: wikiStepRgb(300) });
