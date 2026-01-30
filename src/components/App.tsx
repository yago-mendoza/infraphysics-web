// App shell: provides layout structure and top-level routing

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { SecondBrainHubProvider } from '../contexts/SecondBrainHubContext';
import { Sidebar, MobileNav, Footer, DualGrid, Starfield, SecondBrainSidebar } from './layout';
import { HomeView, AboutView, ContactView, ThanksView, SectionView, PostView, SecondBrainView } from '../views';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../constants/layout';

const STARFIELD_PAGES = ['/', '/home', '/about', '/contact', '/thanks'];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const isStarfieldPage = STARFIELD_PAGES.includes(location.pathname);
  const showGrid = location.pathname.startsWith('/lab') ||
                   location.pathname.startsWith('/second-brain');
  const isSecondBrain = location.pathname.startsWith('/second-brain');

  const gridOffset = isSecondBrain
    ? SIDEBAR_WIDTH + SECOND_BRAIN_SIDEBAR_WIDTH
    : SIDEBAR_WIDTH;

  const content = (
    <div className="min-h-screen flex relative bg-th-base">
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
        <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-10 md:py-16 relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/thanks" element={<ThanksView />} />

            {/* Lab sections */}
            <Route path="/lab/projects" element={<SectionView category="projects" colorClass="text-emerald-400" />} />
            <Route path="/lab/threads" element={<SectionView category="threads" colorClass="text-amber-400" />} />
            <Route path="/lab/bits2bricks" element={<SectionView category="bits2bricks" colorClass="text-blue-400" />} />

            {/* Legacy redirects */}
            <Route path="/projects" element={<Navigate to="/lab/projects" replace />} />
            <Route path="/threads" element={<Navigate to="/lab/threads" replace />} />
            <Route path="/bits2bricks" element={<Navigate to="/lab/bits2bricks" replace />} />

            {/* Second Brain */}
            <Route path="/second-brain" element={<SecondBrainView />} />
            <Route path="/second-brain/:id" element={<SecondBrainView />} />
            <Route path="/fieldnotes" element={<Navigate to="/second-brain" replace />} />
            <Route path="/fieldnotes/:id" element={<Navigate to="/second-brain" replace />} />

            {/* Post detail views */}
            <Route path="/:category/:id" element={<PostView />} />
          </Routes>
        </main>

        {!isSecondBrain && <Footer />}
      </div>
    </div>
  );

  // Wrap second-brain routes in HubProvider
  if (isSecondBrain) {
    return <SecondBrainHubProvider>{content}</SecondBrainHubProvider>;
  }

  return content;
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
