/**
 * Per-article counters are always tracked, but a small number reads as an
 * empty room next to a finished piece. The view count is shown only from this
 * many views; the heart button is always there, and its count appears from
 * this many hearts (or as soon as the reader has hearted the piece).
 */
export const ARTICLE_VIEWS_DISPLAY_MIN = 40;
export const ARTICLE_HEARTS_DISPLAY_MIN = 3;

export const REPORT_DEFAULT_DAYS = 30;
export const REPORT_MAX_DAYS = 366;
export function analyticsRange(from?: unknown, to?: unknown, now = new Date()) {
  const dayMs = 86400000;
  const parse = (value: unknown) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid date');
    const time = Date.parse(`${value}T00:00:00Z`);
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) throw new Error('Invalid date');
    return time;
  };
  const end = to === undefined ? parse(now.toISOString().slice(0, 10)) : parse(to);
  const start = from === undefined ? end - (REPORT_DEFAULT_DAYS - 1) * dayMs : parse(from);
  const days = (end - start) / dayMs + 1;
  if (days < 1 || days > REPORT_MAX_DAYS) throw new Error('Choose a period of at most 366 days');
  return {from: new Date(start).toISOString().slice(0, 10), to: new Date(end).toISOString().slice(0, 10), days};
}
