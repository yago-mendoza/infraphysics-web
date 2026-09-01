import {
  HISTORICAL_PAGEVIEW_OFFSET,
  HISTORICAL_VISIT_OFFSET,
  HISTORICAL_VISITOR_OFFSET,
} from '../../src/config/analytics';

interface Env {
  VIEWS?: KVNamespace;
}

type Visitor = { city: string; region?: string; country: string };

const json = (data: unknown) => new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  },
});

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.VIEWS) return json({ lastVisitor: null, pageViews: null, visits: null, visitors: null });

  const [stored, pageViews, visits, visitors] = await Promise.all([
    env.VIEWS.get('presence:last'),
    env.VIEWS.get('analytics:pageviews'),
    env.VIEWS.get('analytics:sessions'),
    env.VIEWS.get('analytics:visitors'),
  ]);

  let lastVisitor: Visitor | null = null;
  try { lastVisitor = stored ? JSON.parse(stored) : null; } catch { /* ignore malformed legacy data */ }
  return json({
    lastVisitor,
    pageViews: HISTORICAL_PAGEVIEW_OFFSET + (pageViews ? Number.parseInt(pageViews, 10) : 0),
    visits: HISTORICAL_VISIT_OFFSET + (visits ? Number.parseInt(visits, 10) : 0),
    visitors: HISTORICAL_VISITOR_OFFSET + (visitors ? Number.parseInt(visitors, 10) : 0),
  });
};
