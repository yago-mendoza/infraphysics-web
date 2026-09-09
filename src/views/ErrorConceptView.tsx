import React, { useContext, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isSecondBrainPath } from '../config/categories';
import '../styles/error-concepts.css';

function LostRobot({ sign = '404' }: { sign?: string }) {
  return <>
    <ellipse className="ec-shadow" cx="302" cy="325" rx="172" ry="10" />
    <g className="ec-wind" aria-hidden="true">
      <path className="ec-gust ec-gust-one" pathLength="100" d="M82 246 C115 220 150 252 166 230 S144 200 128 218 S150 253 192 233" />
      <path className="ec-gust ec-gust-two" pathLength="100" d="M320 219 C355 191 370 238 419 213 S482 179 505 188" />
      <path className="ec-gust ec-gust-three" pathLength="100" d="M97 294 C128 275 141 300 164 290 M410 280 C447 264 460 289 494 270" />
    </g>
    <g className="ec-flying-leaf" aria-hidden="true"><path className="ec-leaf" d="M113 270 q-4-18 15-20 q5 16-15 20Z" /><path d="m113 270 13-17" /></g>
    <g className="ec-sign">
      {/* The pole stops at each board; opaque paper also prevents bleed-through in dark mode. */}
      <path d="M398 318 V202 M398 164 V148 M398 105 V99" />
      <path className="ec-board" d="m349 110 89-6 21 20-19 22-91 6Z" />
      <text className="ec-sign-number" x="399" y="134" textAnchor="middle" transform="rotate(-4 399 128)">{sign}</text>
      <circle className="ec-pin" cx="360" cy="130" r="1.4" />
      <path className="ec-paper" d="m350 161 84 7-2 32-84-6-19-19Z" />
      <path className="ec-grain" d="m359 176 35 3 m8 1 17 1" />
    </g>
    <g className="ec-robot">
      <path className="ec-paper" d="m218 292-7 24-13 1 q-5 1-5 7 h26 l10-29 m24-2 10 23 14 1 q5 1 5 7 h-27 l-12-27" />
      <rect className="ec-paper" x="211" y="230" width="59" height="66" rx="19" />
      <path d="M233 231 v-10 h17 v10" />
      <g className="ec-robot-head">
        <path className="ec-antenna" d="M237 176 q-1-13-8-22" />
        <circle className="ec-board" cx="228" cy="150" r="5" />
        <path className="ec-paper" d="M208 187 h-8 v19 h9 m64-23 h8 v19 h-8" />
        <rect className="ec-paper" x="204" y="176" width="71" height="46" rx="15" transform="rotate(-6 240 199)" />
        <path className="ec-face-panel" d="M217 190 q22-6 44-3 v20 q-22 6-44 3Z" />
        <g className="ec-eyes"><ellipse className="ec-ink" cx="230" cy="199" rx="2.7" ry="3.7" /><ellipse className="ec-ink" cx="250" cy="197" rx="2.7" ry="3.7" /></g>
        <path className="ec-mouth" d="m238 211 6-1" />
      </g>
      <path d="M214 242 q-23-3-27 19 M268 240 q20-9 26 14" />
      <g className="ec-map">
        <path className="ec-paper" d="m187 251 35-12 35 12 40-12-5 56-39 13-34-13-34 12Z" />
        <path className="ec-map-fold" d="m222 240-3 55 m38-44-4 55" />
        <path className="ec-map-river" d="M195 276 q15-17 29-6 t24 1 t35-8" />
        <path className="ec-map-route" d="m199 291 12-7 13 4 17-13 17 5 17-17" />
        <path d="m271 259 9 8 m-1-9-8 10" />
        <path className="ec-map-detail" d="m232 253 4-6 4 7 m-6 39 5-6 5 5" />
      </g>
      <path className="ec-paper" d="M187 260 q-8-2-8 5 q-1 7 8 8 m109-18 q8-2 8 5 q0 7-9 8" />
    </g>
    <g className="ec-plant">
      <path d="M345 321 Q347 297 338 278" />
      <path className="ec-leaf" d="M344 302 q-22 0-25-18 q19-2 25 18Z M346 309 q5-23 23-23 q0 20-23 23Z M340 284 q-13-5-11-19 q14 3 11 19Z" />
      <path className="ec-leaf-vein" d="m322 287 22 15 m3 5 18-17" />
    </g>
    <path className="ec-ground" d="M330 324 h28 m61-1 8-3 7 4 m-271 2 6-3 8 2" />
    <text className="ec-question" x="181" y="187" transform="rotate(-15 181 187)">?</text>
  </>;
}

/* AppLayout provides this so a missing page can declare itself: the layout then drops the section chrome
   (wiki sidebar, article geometry) and shows the plain page with the ambient rails and the footer. */
export const NotFoundContext = React.createContext<{ notFound: boolean; report: (path: string | null) => void }>({ notFound: false, report: () => {} });

/* The one error page of the site. `kind`: a missing page (404) or a crash caught by the ErrorBoundary (offers a retry).
   `accent: 'wiki'` recolours the sign, the route on the map and the links with the wiki accent; when omitted,
   a url under the wiki takes it by itself. */
export function ErrorConceptView({ kind = 'missing', accent, onRetry }: { kind?: 'missing' | 'error'; accent?: 'wiki'; onRetry?: () => void }) {
  const crashed = kind === 'error';
  const { pathname } = useLocation();
  const wiki = accent === 'wiki' || (accent === undefined && isSecondBrainPath(pathname));
  const { report } = useContext(NotFoundContext);
  useLayoutEffect(() => {
    if (crashed) return;
    report(pathname);
    return () => report(null);
  }, [crashed, pathname, report]);
  const home = wiki ? { to: '/wiki', label: 'Back to the wiki' } : { to: '/home', label: 'Back home' };
  return <section className={`error-concept${wiki ? ' error-concept--wiki' : ''}`} aria-label={crashed ? 'Something went wrong' : 'Page not found'}>
    <div className="ec-scene">
      <svg viewBox="70 70 450 285" role="img" aria-label={`A little robot studies its map at a ${crashed ? 'sign that reads ERR' : '404 sign'}. Gusts of wind flutter the map, carry a leaf and bend a small plant.`}>
        <LostRobot sign={crashed ? 'ERR' : '404'} />
      </svg>
    </div>
    {crashed
      ? <h1>Error. <span>Something broke on this page.</span></h1>
      : <h1>404. <span>Well. This isn’t the page.</span></h1>}
    <div className="ec-actions">
      {crashed && onRetry && <button type="button" className="ec-home" onClick={onRetry}>Try again</button>}
      {/* After a crash the home link is a full reload, so no broken state survives the trip. */}
      {crashed ? <a className="ec-home" href={home.to}>{home.label}</a> : <Link className="ec-home" to={home.to}>{home.label}</Link>}
    </div>
  </section>;
}
