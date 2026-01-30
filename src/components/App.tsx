// App shell: provides layout structure and top-level routing

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileNav, Footer, DualGrid, Starfield } from './layout';
import { HomeView, AboutView, ContactView, ThanksView, SectionView, PostView, SecondBrainView } from '../views';
import { SIDEBAR_WIDTH } from '../constants/layout';

const DARK_PAGES = ['/', '/home', '/about', '/contact', '/thanks'];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isDarkPage = DARK_PAGES.includes(location.pathname);

  return (
    <div
      className="min-h-screen flex selection:bg-yellow-100 selection:text-black relative"
      style={isDarkPage ? { backgroundColor: '#000' } : undefined}
    >
      {/* Background — Starfield on dark pages, DualGrid elsewhere */}
      <div className="hidden md:block">
        {isDarkPage ? (
          <Starfield sidebarWidth={SIDEBAR_WIDTH} />
        ) : (
          <DualGrid sidebarWidth={SIDEBAR_WIDTH} />
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-10 md:py-16 relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/thanks" element={<ThanksView />} />

            <Route path="/projects" element={<SectionView category="projects" colorClass="text-emerald-600" />} />
            <Route path="/threads" element={<SectionView category="threads" colorClass="text-amber-600" />} />
            <Route path="/bits2bricks" element={<SectionView category="bits2bricks" colorClass="text-blue-600" />} />

            {/* Second Brain (formerly Field Notes) */}
            <Route path="/second-brain" element={<SecondBrainView />} />
            <Route path="/second-brain/:id" element={<SecondBrainView />} />

            {/* Legacy redirects */}
            <Route path="/fieldnotes" element={<Navigate to="/second-brain" replace />} />
            <Route path="/fieldnotes/:id" element={<Navigate to="/second-brain" replace />} />

            {/* General post view for other categories */}
            <Route path="/:category/:id" element={<PostView />} />
          </Routes>
        </main>

        {/* Hide footer on dark pages */}
        {!isDarkPage && <Footer />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
