// App shell: provides layout structure and top-level routing

import React, { Suspense, useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { CursorPreferenceProvider, useCursorPreference } from '../contexts/CursorPreferenceContext';
import { ArticleContextProvider } from '../contexts/ArticleContext';
import { SecondBrainHubProvider } from '../contexts/SecondBrainHubContext';
import { categoryGroup, isSecondBrainPath, secondBrainPath } from '../config/categories';
import { postSummaries } from '../data/postSummaries';
import { Sidebar, MobileNav, Footer, ArticleFloatingBar, AmbientRails } from './layout';
import { ErrorBoundary } from './ErrorBoundary';
import { RetentionHints } from './RetentionHints';
import { ExperimentalCursor } from './ExperimentalCursor';
import { HomeVisualLab } from './personal/HomeVisualLab';
import { HomeView } from '../views/HomeView';

// Lazy-loaded heavy views (code-split into separate chunks)
const AboutView = React.lazy(() => import('../views/AboutView').then(m => ({ default: m.AboutView })));
const CvView = React.lazy(() => import('../views/CvView').then(m => ({ default: m.CvView })));
const StackView = React.lazy(() => import('../views/StackView').then(m => ({ default: m.StackView })));
const ContactView = React.lazy(() => import('../views/ContactView').then(m => ({ default: m.ContactView })));
const ThanksView = React.lazy(() => import('../views/ThanksView').then(m => ({ default: m.ThanksView })));
const SectionView = React.lazy(() => import('../views/SectionView').then(m => ({ default: m.SectionView })));
const PostView = React.lazy(() => import('../views/PostView').then(m => ({ default: m.PostView })));
const SecondBrainView = React.lazy(() => import('../views/SecondBrainView').then(m => ({ default: m.SecondBrainView })));
const SecondBrainSidebar = React.lazy(() => import('./layout/SecondBrainSidebar').then(m => ({ default: m.SecondBrainSidebar })));
const SearchPalette = React.lazy(() => import('./SearchPalette').then(m => ({ default: m.SearchPalette })));
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';

/** Redirect old /:category/:id URLs to grouped /lab|blog/:category/:id */
const LegacyPostRedirect: React.FC = () => {
  const { category, id } = useParams();
  if (!category || !id) return <Navigate to="/home" replace />;
  // A malformed grouped URL such as /lab/unknown must never become
  // /lab/lab/unknown through the legacy category redirect.
  if (category === 'lab' || category === 'blog') return <Navigate to="/home" replace />;
  return <Navigate to={`/${categoryGroup(category)}/${category}/${id}`} replace />;
};

const LegacyWikiRedirect: React.FC = () => {
  const { id } = useParams();
  return <Navigate to={secondBrainPath(id)} replace />;
};

const LegacyEssaysRedirect: React.FC = () => {
  const { id } = useParams();
  return <Navigate to={`/blog/essays/`} replace />;
};

const ARTICLE_ROUTE = /^\/(?:blog|lab)\/[^/]+\/[^/]+/;
const ARTICLE_RETURN_KEY = 'infraphysics:article-return-to';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocationRef = useRef(location);
  // Where the article "Back" button goes: the last non-article page visited in this tab.
  const [articleReturnTo, setArticleReturnTo] = useState<string | null>(() => { try { return sessionStorage.getItem(ARTICLE_RETURN_KEY); } catch { return null; } });
  useEffect(() => {
    const previous = previousLocationRef.current;
    if (ARTICLE_ROUTE.test(location.pathname) && previous.pathname !== location.pathname && !ARTICLE_ROUTE.test(previous.pathname)) {
      const target = `${previous.pathname}${previous.search}${previous.hash}`;
      setArticleReturnTo(target);
      try { sessionStorage.setItem(ARTICLE_RETURN_KEY, target); } catch { /* optional navigation memory */ }
    }
    if (isSecondBrainPath(location.pathname) && !isSecondBrainPath(previous.pathname)) {
      try { sessionStorage.setItem('infraphysics:wiki-return-to', `${previous.pathname}${previous.search}${previous.hash}`); } catch { /* optional navigation memory */ }
    }
    previousLocationRef.current = location;
  }, [location]);
  const { theme, toggleTheme, applyZone } = useTheme();
  const { aestheticCursor } = useCursorPreference();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const sessionWindow = 30 * 60 * 1000;
    try {
      let visitorId = localStorage.getItem('infraphysics:visitor-id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('infraphysics:visitor-id', visitorId);
      }
      const storedSession = JSON.parse(localStorage.getItem('infraphysics:session') || 'null') as { id?: string; lastActive?: number } | null;
      const sessionId = storedSession?.id && storedSession.lastActive && now - storedSession.lastActive < sessionWindow
        ? storedSession.id
        : crypto.randomUUID();
      localStorage.setItem('infraphysics:session', JSON.stringify({ id: sessionId, lastActive: now }));
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname, visitorId, sessionId }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* Analytics must never affect navigation. */ }
  }, [location.pathname]);

  const openSearch = useCallback(() => {
    setSearchLoaded(true);
    setSearchOpen(true);
  }, []);

  // Global keyboard shortcuts (Shift+T for theme)
  const globalShortcuts = useMemo<ShortcutDef[]>(() => [
    {
      key: 't',
      shift: true,
      label: 'Toggle theme',
      action: toggleTheme,
    },
  ], [toggleTheme]);

  useKeyboardShortcuts(globalShortcuts, searchOpen);

  // Global Ctrl+K / Cmd+K  +  Ctrl+Shift+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchLoaded(true);
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);


  // Scroll to top on every route change (standard SPA behavior)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Apply zone-specific theme preference on route change (instant, no flash).
  // An article with `theme:` in its frontmatter forces that theme on entry. This has to happen
  // here, not in the article view: child layout effects run before this one and would be overridden.
  useLayoutEffect(() => {
    const zone = location.pathname.startsWith('/blog')
      ? 'blog'
      : isSecondBrainPath(location.pathname) ? 'wiki' : 'app';
    const article = location.pathname.match(/^\/(?:lab|blog)\/([^/]+)\/([^/]+)/);
    const forced = article
      ? postSummaries.find(p => p.category === article[1] && p.id === article[2])?.theme
      : null;
    applyZone(zone, forced ?? undefined);
  }, [location.pathname, applyZone]);

  const isBlog = location.pathname.startsWith('/blog');
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isAbout = location.pathname === '/about' || location.pathname.startsWith('/about/');
  const hasSystemField = isAbout
    || location.pathname.startsWith('/blog/essays')
    || location.pathname.startsWith('/blog/bits2bricks')
    || location.pathname.startsWith('/lab/projects');
  const clockHome = location.pathname === '/home';
  const isSecondBrain = isSecondBrainPath(location.pathname);
  const wikiBack = useMemo(() => ({ label: 'Return to previous section', onClick: () => {
    let destination = '/home';
    try {
      const stored = sessionStorage.getItem('infraphysics:wiki-return-to');
      if (stored && !isSecondBrainPath(stored)) destination = stored;
    } catch { /* fall back to home */ }
    navigate(destination);
  } }), [navigate]);
  const isArticlePage = /^\/(blog|lab)\/[^/]+\/[^/]+/.test(location.pathname) && !isSecondBrain;
  // Project detail pages drop the grid and paint the page in the box surface color
  const isProjectArticle = isArticlePage && location.pathname.startsWith('/lab/projects/');


  const content = (
    <ErrorBoundary resetKey={location.pathname}>
    {aestheticCursor && !isSecondBrain && <ExperimentalCursor />}
    <div
      className={`min-h-screen overflow-x-clip flex relative ${hasSystemField ? 'about-active ' : ''}${location.pathname.startsWith('/lab/projects') ? 'projects-zone ' : ''}${clockHome ? 'home2-active ' : ''}${isHome ? 'home-light-zone bg-transparent' : isProjectArticle ? '' : isBlog ? 'bg-th-blog' : 'bg-transparent'}`}
      style={isProjectArticle ? { backgroundColor: 'var(--art-surface)' } : undefined}
    >
      {!isArticlePage && <AmbientRails />}
      {hasSystemField && <div className="about-system-visual" aria-hidden="true"><HomeVisualLab variant={2} staticMicroField showTachograph={false} /></div>}

      {/* Navigation: floating bar (desktop) + mobile nav for articles, sidebar+mobile nav for everything else */}
      {isSecondBrain ? (
        /* Wiki: no chrome of its own. The global bar hides completely and slides in when the pointer
           reaches the bottom edge (scroll up on touch); a leading arrow returns to where the reader came from. */
        <>
          <MobileNav onOpenSearch={openSearch} revealOnScrollUp back={wikiBack} />
          <Sidebar onOpenSearch={openSearch} proximityReveal back={wikiBack} />
        </>
      ) : isArticlePage ? (
        <>
          <MobileNav onOpenSearch={openSearch} revealOnScrollUp />
          <Sidebar onOpenSearch={openSearch} revealOnScrollUp />
          <ArticleFloatingBar onOpenSearch={openSearch} returnTo={articleReturnTo} />
        </>
      ) : (
        <>
          <MobileNav onOpenSearch={openSearch} />
          <Sidebar onOpenSearch={openSearch} />
        </>
      )}

      {/* Search Palette */}
      {searchLoaded && (
        <Suspense fallback={null}>
          <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}

      {/* Contextual retention hints */}
      {!isArticlePage && <RetentionHints />}

      {/* Hub Sidebar (second-brain only, desktop only — not on graph view) */}
      {isSecondBrain && (
        <Suspense fallback={null}>
          <SecondBrainSidebar />
        </Suspense>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className={`flex-grow w-full relative z-10 ${isSecondBrain ? 'max-w-[112rem] px-4 md:px-10 pt-6 pb-24 md:pt-8 md:pb-28 mx-auto' : isArticlePage ? 'px-2 pt-[4.5rem] pb-20 md:px-6 md:pt-20 md:pb-28 article-main-viewport' : 'px-6 pt-20 pb-20 md:py-16 md:pb-28 main-center-viewport'}`}>
          <Suspense fallback={<div className="min-h-screen py-20 text-center text-th-tertiary text-sm animate-pulse">Loading…</div>}>
            <React.Fragment key={location.pathname}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomeView visualVariant={1} fieldVariant={3} />} />
              <Route path="/writing" element={<Navigate to="/blog/essays" replace />} />
              <Route path="/blog" element={<Navigate to="/blog/essays" replace />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/about/cv" element={<CvView />} />
              <Route path="/about/stack" element={<StackView />} />
              <Route path="/contact" element={<ContactView />} />
              <Route path="/thanks" element={<ThanksView />} />

              {/* Lab sections */}
              <Route path="/lab/projects" element={<SectionView category="projects" />} />
              <Route path="/blog/essays" element={<SectionView category="essays" />} />
              <Route path="/blog/bits2bricks" element={<SectionView category="bits2bricks" />} />

              {/* Legacy redirects */}
              <Route path="/projects" element={<Navigate to="/lab/projects" replace />} />
              <Route path="/second-brain" element={<Navigate to={secondBrainPath()} replace />} />
              <Route path="/essays" element={<Navigate to="/blog/essays" replace />} />
              <Route path="/blog/threads" element={<Navigate to="/blog/essays" replace />} />
              <Route path="/blog/threads/:id" element={<LegacyEssaysRedirect />} />
              <Route path="/bits2bricks" element={<Navigate to="/blog/bits2bricks" replace />} />

              {/* Wiki — canonical routes */}
              <Route path="/wiki" element={<SecondBrainView />} />
              <Route path="/wiki/graph" element={<Navigate to="/wiki" replace />} />
              <Route path="/wiki/:id" element={<SecondBrainView />} />

              {/* Legacy Wiki URLs remain valid as redirects. */}
              <Route path="/lab/second-brain" element={<LegacyWikiRedirect />} />
              <Route path="/lab/second-brain/graph" element={<Navigate to="/wiki" replace />} />
              <Route path="/lab/second-brain/:id" element={<LegacyWikiRedirect />} />

              {/* Essay style lab (experimental typography variants) */}

              {/* Post detail views */}
              <Route path="/lab/:category/:id" element={<PostView />} />
              <Route path="/blog/:category/:id" element={<PostView />} />

              {/* Legacy: old flat /:category/:id → grouped path */}
              <Route path="/:category/:id" element={<LegacyPostRedirect />} />

              {/* 404 catch-all */}
              <Route path="*" element={
                <div className="py-20 text-center">
                  <div className="text-6xl mb-4 text-th-muted">404</div>
                  <p className="text-th-tertiary">Nothing here.</p>
                  <Link to="/home" className="inline-block mt-6 px-4 py-2 bg-th-active text-th-heading text-sm hover:bg-th-active-hover transition-colors border border-th-border">
                    Return Home
                  </Link>
                </div>
              } />
            </Routes>
            </React.Fragment>
          </Suspense>
        </main>

        {!isSecondBrain && <Footer />}
      </div>
    </div>
    </ErrorBoundary>
  );

  return <ArticleContextProvider><SecondBrainHubProvider>{content}</SecondBrainHubProvider></ArticleContextProvider>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CursorPreferenceProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CursorPreferenceProvider>
    </ThemeProvider>
  );
};

export default App;
