import {
  HISTORICAL_PAGEVIEW_OFFSET,
  HISTORICAL_VISIT_OFFSET,
  HISTORICAL_VISITOR_OFFSET,
} from '../../src/config/analytics';

import { callCounters, durable, type CounterEnv as Env } from '../_lib/counters';

type Visitor = { city: string; region?: string; country: string };

const json = (data: unknown) => new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  },
});

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (durable(env)) {
    const response = await callCounters(env, {op: 'presence'});
    if (!response.ok) return response;
    const data = await response.json() as {lastVisitor: Visitor | null; pageViews: number; visits: number; visitors: number};
    return json({...data, pageViews: data.pageViews + HISTORICAL_PAGEVIEW_OFFSET,
      visits: data.visits + HISTORICAL_VISIT_OFFSET, visitors: data.visitors + HISTORICAL_VISITOR_OFFSET});
  }
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
