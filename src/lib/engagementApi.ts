const PRODUCTION_ORIGIN = 'https://infraphysics.net';

export function isLocalEngagementPreview(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Cloudflare Pages Functions do not exist behind `vite preview`. In local
 * preview we therefore read the canonical production counters over CORS;
 * deployed builds continue to use same-origin requests.
 */
export function engagementApiUrl(path: string): string {
  return `${isLocalEngagementPreview() ? PRODUCTION_ORIGIN : ''}${path}`;
}
