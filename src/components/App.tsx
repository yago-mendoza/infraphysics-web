// App shell: provides layout structure and top-level routing

import React, { Suspense, useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { CursorPreferenceProvider, useCursorPreference } from '../contexts/CursorPreferenceContext';
import { ArticleContextProvider } from '../contexts/ArticleContext';
import { SecondBrainHubProvider } from '../contexts/SecondBrainHubContext';
import { isSecondBrainPath, secondBrainPath } from '../config/categories';
import { postSummaries } from '../data/postSummaries';
import { contentRoutes } from '../lib/contentRoutes';
import { Sidebar, MobileNav, Footer, AmbientRails } from './layout';
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
// Eager: the 404 page must paint at once, never behind the Suspense fallback.
import { ErrorConceptView, NotFoundContext } from '../views/ErrorConceptView';
const LinkedFromTestView = React.lazy(() => import('../views/LinkedFromTestView').then(m => ({ default: m.LinkedFromTestView })));
const ShareCardsView = React.lazy(() => import('../views/ShareCardsView').then(m => ({ default: m.ShareCardsView })));
const OgCardView = React.lazy(() => import('../views/OgCardView').then(m => ({ default: m.OgCardView })));
const SectionView = React.lazy(() => import('../views/SectionView').then(m => ({ default: m.SectionView })));
const PostView = React.lazy(() => import('../views/PostView').then(m => ({ default: m.PostView })));
const ContextPreviewView = React.lazy(() => import('../views/ContextPreviewView').then(m => ({ default: m.ContextPreviewView })));
const SecondBrainView = React.lazy(() => import('../views/SecondBrainView').then(m => ({ default: m.SecondBrainView })));
const SecondBrainSidebar = React.lazy(() => import('./layout/SecondBrainSidebar').then(m => ({ default: m.SecondBrainSidebar })));
const SearchPalette = React.lazy(() => import('./SearchPalette').then(m => ({ default: m.SearchPalette })));
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';

/** Redirect old /:category/:id URLs to grouped /lab|blog/:category/:id */
const LegacyPostRedirect: React.FC = () => {
  const { category, id } = useParams();
  const location = useLocation();
  if (!category || !id) return <Navigate to="/home" replace />;
  // A malformed grouped URL such as /lab/unknown must never become
  // /lab/lab/unknown through the legacy category redirect.
  if (category === 'lab' || category === 'blog') return <Navigate to="/home" replace />;
  return <Navigate to={(contentRoutes.resolve(location.pathname)?.canonical || contentRoutes.path(category, id)) + location.search + location.hash} replace />;
};

const LegacyWikiRedirect: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={secondBrainPath(id) + location.search + location.hash} replace />;
};

const LegacyEssaysRedirect: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={(id ? contentRoutes.path('essays', id) : '/blog/essays') + location.search + location.hash} replace />;
};

const ARTICLE_ROUTE = /^\/(?:blog|lab)\/[^/]+\/[^/]+/;
const ARTICLE_RETURN_KEY = 'infraphysics:article-return-to';
const SECTION_RETURN_KEY = 'infraphysics:section-return-to';
const navigationSection = (path: string) => {
  const pathname = path.split(/[?#]/)[0];
  if (isSecondBrainPath(pathname)) return '/wiki';
  if (/^\/(blog|lab)\//.test(pathname)) return pathname.split('/').slice(0, 3).join('/');
  return pathname.split('/')[1] || 'home';
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocationRef = useRef(location);
  const [sectionReturnTo, setSectionReturnTo] = useState<string | null>(() => {
    try { return sessionStorage.getItem(SECTION_RETURN_KEY); } catch { return null; }
  });
  // Where the article "Back" button goes: the last non-article page visited in this tab.
  const [articleReturnTo, setArticleReturnTo] = useState<string | null>(() => { try { return sessionStorage.getItem(ARTICLE_RETURN_KEY); } catch { return null; } });
  useEffect(() => {
    const previous = previousLocationRef.current;
    if (ARTICLE_ROUTE.test(location.pathname) && previous.pathname !== location.pathname && !ARTICLE_ROUTE.test(previous.pathname)) {
      const target = `${previous.pathname}${previous.search}${previous.hash}`;
      setArticleReturnTo(target);
      try { sessionStorage.setItem(ARTICLE_RETURN_KEY, target); } catch { /* optional navigation memory */ }
    }
    if (navigationSection(location.pathname) !== navigationSection(previous.pathname)) {
      const target = `${previous.pathname}${previous.search}${previous.hash}`;
      setSectionReturnTo(target);
      try { sessionStorage.setItem(SECTION_RETURN_KEY, target); } catch { /* optional navigation memory */ }
    }
    previousLocationRef.current = location;
  }, [location]);
  const { theme, toggleTheme, applyRoute } = useTheme();
  const { aestheticCursor } = useCursorPreference();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);

  useEffect(() => {
    const route = contentRoutes.resolve(location.pathname);
    if (route && location.pathname !== route.canonical) return;
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
        body: JSON.stringify({ path: contentRoutes.storagePath(location.pathname), visitorId, sessionId }),
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

  // Re-apply the reader's theme on route change (instant, no flash). An article with `theme:` in its
  // frontmatter forces that theme on entry. This has to happen here, not in the article view: child
  // layout effects run before this one and would be overridden.
  useLayoutEffect(() => {
    const article = location.pathname.match(/^\/(?:lab|blog)\/([^/]+)\/([^/]+)/);
    const forced = article
      ? postSummaries.find(p => p.category === article[1] && p.id === article[2])?.theme
      : null;
    applyRoute(forced ?? undefined);
  }, [location.pathname, applyRoute]);

  const isBlog = location.pathname.startsWith('/blog');
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isAbout = location.pathname === '/about' || location.pathname.startsWith('/about/');
  // A missing page (ErrorConceptView reports its path) drops the section chrome: no wiki sidebar, no article geometry, rails and footer back.
  const [notFoundPath, setNotFoundPath] = useState<string | null>(null);
  const notFound = notFoundPath === location.pathname;
  const notFoundContext = useMemo(() => ({ notFound, report: setNotFoundPath }), [notFound]);
  const isSecondBrain = isSecondBrainPath(location.pathname) && !notFound;
  // The vector-field plate behind about and projects also sits behind home and the wiki.
  const hasSystemField = isAbout
    || isHome
    || isSecondBrain
    || location.pathname.startsWith('/blog/essays')
    || location.pathname.startsWith('/blog/bits2bricks')
    || location.pathname.startsWith('/lab/projects');
  const clockHome = location.pathname === '/home';
  const hasPreviousSection = !!sectionReturnTo && sectionReturnTo.startsWith('/')
    && !sectionReturnTo.startsWith('//')
    && navigationSection(sectionReturnTo) !== navigationSection(location.pathname);
  const sectionBack = useMemo(() => ({
    label: hasPreviousSection ? 'Return to previous section' : 'Return home',
    onClick: () => navigate(hasPreviousSection ? sectionReturnTo! : '/home'),
  }), [navigate, hasPreviousSection, sectionReturnTo]);
  const isContextPreview = /^\/ctx[1-4]$/.test(location.pathname);
  const isArticlePage = ((/^\/(blog|lab)\/[^/]+\/[^/]+/.test(location.pathname) && !isSecondBrain) || isContextPreview) && !notFound;
  // Project detail pages drop the grid and paint the page in the box surface color
  const isProjectArticle = isArticlePage && (location.pathname.startsWith('/lab/projects/') || isContextPreview);


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
          {/* On a phone the bar stays put in the wiki: the reader should always know where to go next. */}
          <MobileNav onOpenSearch={openSearch} back={sectionBack} />
          <Sidebar onOpenSearch={openSearch} proximityReveal back={sectionBack} />
        </>
      ) : isArticlePage ? (
        <>
          <MobileNav onOpenSearch={openSearch} revealOnScrollUp back={sectionBack} />
          <Sidebar onOpenSearch={openSearch} revealOnScrollUp proximityReveal back={sectionBack} />
        </>
      ) : (
        <>
          <MobileNav onOpenSearch={openSearch} back={sectionBack} />
          <Sidebar onOpenSearch={openSearch} back={sectionBack} />
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
        <main className={`flex-grow w-full relative z-10 ${notFound ? 'px-6 flex items-center justify-center overflow-hidden' : isSecondBrain ? 'max-w-[112rem] px-4 md:px-10 pt-6 pb-24 md:pt-8 md:pb-28 mx-auto' : isArticlePage ? 'px-4 pt-[4.5rem] pb-20 md:px-6 md:pt-20 md:pb-28 article-main-viewport' : 'px-6 pt-20 pb-20 md:py-16 md:pb-28 main-center-viewport'}`}>
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
              <Route path="/err5" element={<ErrorConceptView />} />
              {/* Preview of the wiki card's Linked from menu with fictitious articles */}
              <Route path="/test/linked-from" element={<LinkedFromTestView />} />
              {/* Share cards, development only: the gallery, and the single-card page scripts/og-cards.js photographs */}
              {import.meta.env.DEV && <>
                <Route path="/og" element={<ShareCardsView />} />
                <Route path="/og/:kind" element={<ShareCardsView />} />
                <Route path="/og/:kind/:variant" element={<ShareCardsView />} />
                <Route path="/og/card/:kind/:id" element={<OgCardView />} />
              </>}
              <Route path="/ctx1" element={<ContextPreviewView variant={1} />} />
              <Route path="/ctx2" element={<ContextPreviewView variant={2} />} />
              <Route path="/ctx3" element={<ContextPreviewView variant={3} />} />
              <Route path="/ctx4" element={<ContextPreviewView variant={4} />} />

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
              <Route path="/wiki/graph" element={<SecondBrainView />} />
              <Route path="/wiki/:id" element={<SecondBrainView />} />

              {/* Legacy Wiki URLs remain valid as redirects. */}
              <Route path="/lab/second-brain" element={<LegacyWikiRedirect />} />
              <Route path="/lab/second-brain/graph" element={<Navigate to="/wiki" replace />} />
              <Route path="/lab/second-brain/:id" element={<LegacyWikiRedirect />} />


              {/* Post detail views */}
              <Route path="/lab/:category/:id" element={<PostView />} />
              <Route path="/blog/:category/:id" element={<PostView />} />

              {/* Legacy: old flat /:category/:id → grouped path */}
              <Route path="/:category/:id" element={<LegacyPostRedirect />} />

              {/* 404 catch-all: the lost robot (also previewable at /err5) */}
              <Route path="*" element={<ErrorConceptView />} />
            </Routes>
            </React.Fragment>
          </Suspense>
        </main>

        {/* A missing page is the robot alone: no footer, nothing to scroll. */}
        {!isSecondBrain && !notFound && <Footer />}
      </div>
    </div>
    </ErrorBoundary>
  );

  return <NotFoundContext.Provider value={notFoundContext}><ArticleContextProvider><SecondBrainHubProvider>{content}</SecondBrainHubProvider></ArticleContextProvider></NotFoundContext.Provider>;
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
