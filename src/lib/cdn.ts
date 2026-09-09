// Public URLs for images managed by scripts/media.js. The manifest is what the
// CDN actually holds; the version query mirrors what the build stamps on
// article urls, so a replaced image refreshes through the one-year cache.
import manifest from '../data/media-manifest.json';

type Manifest = { publicBase: string; files: Record<string, { v: string; width: number | null; height: number | null }> };
const media = manifest as Manifest;

/** URL of a CDN object by bucket key, e.g. cdn('site/home/carousel-feedback-loops.webp'). */
export function cdn(key: string): string {
  const entry = media.files[key];
  if (!entry && import.meta.env.DEV) console.warn(`[cdn] ${key} is not in media-manifest.json; run "npm run media -- push"`);
  return `${media.publicBase}/${key}${entry ? `?v=${entry.v}` : ''}`;
}
