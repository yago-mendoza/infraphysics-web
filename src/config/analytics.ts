/**
 * Historical analytics baselines, frozen on 2026-09-01.
 *
 * Before site-wide analytics existed, Cloudflare KV already held per-article
 * counters under `views:{slug}`. The 27 published articles summed to 249
 * verified views at the migration cut-off. Another 51 page views are a
 * deliberately conservative allowance for previously untracked Home, About,
 * Writing, Wiki, index and Contact traffic, giving a 300-page baseline.
 *
 * The old counters cannot reconstruct sessions or unique visitors. Their
 * baselines are therefore documented estimates, not measured values: 100
 * historical visitors at roughly three pages each, with 130 visits to allow
 * for a modest number of returning visitors. Live analytics accumulate on top
 * of these frozen values after the migration cut-off.
 */
export const HISTORICAL_PAGEVIEW_OFFSET = 300;
export const HISTORICAL_VISIT_OFFSET = 130;
export const HISTORICAL_VISITOR_OFFSET = 100;
