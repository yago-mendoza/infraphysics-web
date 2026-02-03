// App shell: provides layout structure and top-level routing

import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { SecondBrainHubProvider } from '../contexts/SecondBrainHubContext';
import { SectionStateProvider, useSectionState } from '../contexts/SectionStateContext';
import { categoryGroup } from '../config/categories';
import { Sidebar, MobileNav, Footer, DualGrid, Starfield, SecondBrainSidebar } from './layout';
import { HomeView, AboutView, ContactView, ThanksView, SectionView, PostView, SecondBrainView } from '../views';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../constants/layout';

/** Redirect old /:category/:id URLs to grouped /lab|blog/:category/:id */
const LegacyPostRedirect: React.FC = () => {
  const { category, id } = useParams();
  if (!category || !id) return <Navigate to="/home" replace />;
  return <Navigate to={`/${categoryGroup(category)}/${category}/${id}`} replace />;
};

const STARFIELD_PAGES = ['/', '/home', '/about', '/contact', '/thanks'];

const TRACKED_SECTIONS = ['/lab/projects', '/blog/threads', '/blog/bits2bricks'];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { setLastPath } = useSectionState();
  const scrollStore = useRef<Record<string, number>>({});
  const pathRef = useRef(location.pathname);
  const restoringRef = useRef(false);

  // Update ref synchronously during render so the scroll handler
  // always writes to the CURRENT pathname. This prevents transitional
  // scroll events (fired when old DOM unmounts and the browser clamps
  // scroll) from overwriting the saved position of the page we left.
  pathRef.current = location.pathname;

  // Persistent scroll listener — saves position for the current page
  useEffect(() => {
    const handler = () => {
      if (!restoringRef.current) {
        scrollStore.current[pathRef.current] = window.scrollY;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // On navigation: restore saved scroll or go to top
  useEffect(() => {
    const saved = scrollStore.current[location.pathname];
    if (saved != null && saved > 0) {
      restoringRef.current = true;
      let frame: number;
      let count = 0;
      const restore = () => {
        window.scrollTo(0, saved);
        if (++count < 12) {
          frame = requestAnimationFrame(restore);
        } else {
          restoringRef.current = false;
        }
      };
      frame = requestAnimationFrame(restore);
      return () => { cancelAnimationFrame(frame); restoringRef.current = false; };
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    const matched = TRACKED_SECTIONS.find(base =>
      location.pathname === base || location.pathname.startsWith(base + '/')
    );
    if (matched) setLastPath(matched, location.pathname);
  }, [location.pathname, setLastPath]);
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
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Hub Sidebar (second-brain only, desktop only) */}
      {isSecondBrain && <SecondBrainSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className={`flex-grow w-full mx-auto relative z-10 ${isSecondBrain ? 'max-w-6xl px-10 py-10 md:py-12' : 'max-w-4xl px-6 py-10 md:py-16'}`}>
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
        </main>

        {!isSecondBrain && location.pathname !== '/contact' && <Footer />}
      </div>
    </div>
  );

  return <SecondBrainHubProvider>{content}</SecondBrainHubProvider>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SectionStateProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </SectionStateProvider>
    </ThemeProvider>
  );
};

export default App;
