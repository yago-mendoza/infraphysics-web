// App shell: provides layout structure and top-level routing

import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ArticleContextProvider } from '../contexts/ArticleContext';
import { SecondBrainHubProvider } from '../contexts/SecondBrainHubContext';
import { categoryGroup } from '../config/categories';
import { Sidebar, MobileNav, Footer, DualGrid, Starfield, SecondBrainSidebar } from './layout';
import { ErrorBoundary } from './ErrorBoundary';
import { SearchPalette } from './SearchPalette';
import { HomeView, AboutView, ContactView, ThanksView, SectionView, PostView, SecondBrainView } from '../views';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../constants/layout';
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';
import { initBrainIndex } from '../lib/brainIndex';

// Fire-and-forget: start loading the brain index early so it's ready by navigation time
initBrainIndex();

/** Redirect old /:category/:id URLs to grouped /lab|blog/:category/:id */
const LegacyPostRedirect: React.FC = () => {
  const { category, id } = useParams();
  if (!category || !id) return <Navigate to="/home" replace />;
  return <Navigate to={`/${categoryGroup(category)}/${category}/${id}`} replace />;
};

const STARFIELD_PAGES = ['/', '/home', '/about', '/contact', '/thanks'];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme, applyZone } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);

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

  // Apply zone-specific theme preference on route change (instant, no flash)
  useLayoutEffect(() => {
    applyZone(location.pathname.startsWith('/blog') ? 'blog' : 'app');
  }, [location.pathname, applyZone]);

  const isStarfieldPage = STARFIELD_PAGES.includes(location.pathname);
  const showGrid = location.pathname.startsWith('/lab');
  const isBlog = location.pathname.startsWith('/blog');
  const isSecondBrain = location.pathname.startsWith('/lab/second-brain');

  const gridOffset = isSecondBrain
    ? SIDEBAR_WIDTH + SECOND_BRAIN_SIDEBAR_WIDTH
    : SIDEBAR_WIDTH;

  const content = (
    <ErrorBoundary>
    <div className={`min-h-screen flex relative overflow-x-hidden ${isBlog ? 'bg-th-blog' : 'bg-th-base'}`}>
      {/* Background — Starfield on personal pages (fades with theme), DualGrid on lab/wiki */}
      <div className="hidden md:block">
        {isStarfieldPage && <Starfield sidebarWidth={SIDEBAR_WIDTH} visible={theme === 'dark'} />}
        {showGrid && <DualGrid sidebarWidth={gridOffset} />}
      </div>

      {/* Mobile Navigation */}
      <MobileNav onOpenSearch={openSearch} />

      {/* Desktop Sidebar */}
      <Sidebar onOpenSearch={openSearch} />

      {/* Search Palette */}
      <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Hub Sidebar (second-brain only, desktop only) */}
      {isSecondBrain && <SecondBrainSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className={`flex-grow w-full relative z-10 ${isSecondBrain ? 'max-w-6xl px-4 md:px-10 pt-20 pb-10 md:py-12 mx-auto' : 'max-w-4xl px-6 pt-20 pb-10 md:py-16 main-center-viewport'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/thanks" element={<ThanksView />} />

            {/* Lab sections */}
            <Route path="/lab/projects" element={<SectionView category="projects" />} />
            <Route path="/blog/threads" element={<SectionView category="threads" />} />
            <Route path="/blog/bits2bricks" element={<SectionView category="bits2bricks" />} />

            {/* Legacy redirects */}
            <Route path="/projects" element={<Navigate to="/lab/projects" replace />} />
            <Route path="/second-brain" element={<Navigate to="/lab/second-brain" replace />} />
            <Route path="/threads" element={<Navigate to="/blog/threads" replace />} />
            <Route path="/bits2bricks" element={<Navigate to="/blog/bits2bricks" replace />} />

            {/* Second Brain */}
            <Route path="/lab/second-brain" element={<SecondBrainView />} />
            <Route path="/lab/second-brain/:id" element={<SecondBrainView />} />

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
        </main>

        {!isSecondBrain && location.pathname !== '/contact' && <Footer />}
      </div>
    </div>
    </ErrorBoundary>
  );

  return <ArticleContextProvider><SecondBrainHubProvider>{content}</SecondBrainHubProvider></ArticleContextProvider>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
