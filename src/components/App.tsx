// App shell: provides layout structure and top-level routing

import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ArticleContextProvider } from '../contexts/ArticleContext';
import { SecondBrainHubProvider } from '../contexts/SecondBrainHubContext';
import { categoryGroup, postPath } from '../config/categories';
import { Sidebar, MobileNav, Footer, DualGrid, Starfield, SecondBrainSidebar } from './layout';
import { ErrorBoundary } from './ErrorBoundary';
import { SearchPalette } from './SearchPalette';
import { HomeView, AboutView, ContactView, ThanksView, SectionView, PostView, SecondBrainView } from '../views';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../constants/layout';
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';
import { posts } from '../data/data';
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
  const { theme, toggleTheme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const openSearch = useCallback(() => setSearchOpen(true), []);

  // Global keyboard shortcuts (. for most recent, Shift+T for theme)
  const globalShortcuts = useMemo<ShortcutDef[]>(() => {
    const mostRecent = [...posts]
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    return [
      {
        key: '.',
        label: 'Most recent post',
        action: () => {
          if (mostRecent) navigate(postPath(mostRecent.category, mostRecent.id));
        },
        enabled: !!mostRecent,
      },
      {
        key: 't',
        shift: true,
        label: 'Toggle theme',
        action: toggleTheme,
      },
    ];
  }, [navigate, toggleTheme]);

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

  // Auto-switch theme by route: blog (threads/bits2bricks) → light, lab (projects/second-brain) → dark
  // useLayoutEffect fires BEFORE browser paint — no flash
  useLayoutEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/blog')) setTheme('light');
    else if (path.startsWith('/lab')) setTheme('dark');
  }, [location.pathname, setTheme]);

  const isStarfieldPage = STARFIELD_PAGES.includes(location.pathname);
  const showGrid = location.pathname.startsWith('/lab');
  const isBlog = location.pathname.startsWith('/blog');
  const isSecondBrain = location.pathname.startsWith('/lab/second-brain');

  const gridOffset = isSecondBrain
    ? SIDEBAR_WIDTH + SECOND_BRAIN_SIDEBAR_WIDTH
    : SIDEBAR_WIDTH;

  const content = (
    <div className={`min-h-screen flex relative ${isBlog ? 'bg-th-blog' : 'bg-th-base'}`}>
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
      <div className="flex-1 flex flex-col min-h-screen">
        <main className={`flex-grow w-full mx-auto relative z-10 ${isSecondBrain ? 'max-w-6xl px-10 py-10 md:py-12' : 'max-w-4xl px-6 py-10 md:py-16'}`}>
          <ErrorBoundary>
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
          </Routes>
          </ErrorBoundary>
        </main>

        {!isSecondBrain && location.pathname !== '/contact' && <Footer />}
      </div>
    </div>
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
