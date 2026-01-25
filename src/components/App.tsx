// App shell: provides layout structure and top-level routing

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, MobileNav, Footer, DualGrid } from './layout';
import { HomeView, SectionView, PostView, SecondBrainView } from '../views';
import { SIDEBAR_WIDTH } from '../constants/layout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex selection:bg-yellow-100 selection:text-black relative">
        {/* Dual Grid Background - fixed, covers content area only */}
        <div className="hidden md:block">
          <DualGrid sidebarWidth={SIDEBAR_WIDTH} />
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

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
