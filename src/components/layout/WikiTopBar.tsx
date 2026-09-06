import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { BackChevronIcon, Logo, MoonIcon, SearchIcon, SunIcon } from '../icons';

export const WikiTopBar: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const leaveWiki = () => {
    let destination = '/home';
    try {
      const stored = sessionStorage.getItem('infraphysics:wiki-return-to');
      if (stored && !stored.startsWith('/lab/second-brain')) destination = stored;
    } catch { /* fall back to home */ }
    navigate(destination);
  };

  return (
    <header className="wiki-topbar">
      <div className="wiki-topbar-left">
        <button type="button" className="wiki-topbar-back" onClick={leaveWiki} aria-label="Return to previous section" title="Return to previous section">
          <BackChevronIcon className="wiki-back-icon" />
        </button>
        <Link to="/home" className="wiki-topbar-brand" aria-label="Infraphysics home">
          <Logo className="w-5 h-5" color="currentColor" />
          <span>INFRAPHYSICS</span>
          <small>KNOWLEDGE SYSTEM</small>
        </Link>
      </div>
      <div className="wiki-topbar-actions">
        <button type="button" onClick={onOpenSearch} aria-label="Search" title="Search"><SearchIcon /><span>Search</span></button>
        <button type="button" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
      </div>
    </header>
  );
};
