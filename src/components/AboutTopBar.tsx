import React from 'react';
import { Link } from 'react-router-dom';

type AboutSection = 'profile' | 'cv' | 'stack';
const sections: { id: AboutSection; label: string; to: string }[] = [
  { id: 'profile', label: 'Profile', to: '/about' },
  { id: 'cv', label: 'Experience / CV', to: '/about/cv' },
  { id: 'stack', label: 'Stack', to: '/about/stack' },
];

export const AboutTopBar: React.FC<{ active: AboutSection }> = ({ active }) => (
  <div className="about-topbar">
    <p>About / Yago Mendoza</p>
    <nav aria-label="About sections">
      {sections.map(section => section.id === active ? <span className="about-topbar-active" key={section.id}>{section.label}</span> : <Link to={section.to} key={section.id}>{section.label}</Link>)}
      <span className="about-topbar-actions">
        <a className="about-topbar-icon" href="/Yago-Mendoza-CV.pdf" download aria-label="Download CV as PDF" title="Download CV as PDF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg></a>
        <button className="about-topbar-icon" type="button" onClick={() => window.print()} aria-label="Print page" title="Print page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z" /></svg></button>
      </span>
    </nav>
  </div>
);
