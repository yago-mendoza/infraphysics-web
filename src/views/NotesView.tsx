import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { shortNotes } from '../data/notes';
import { BackChevronIcon, Logo, MoonIcon, SearchIcon, SunIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';

const renderNoteText = (text: string) => text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g).map((part, index) => {
  const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
  return match
    ? <a key={index} href={match[2]} target="_blank" rel="noreferrer">{match[1]}</a>
    : part;
});

export const NotesView: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const indexRef = useRef<HTMLElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const noteRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indexWidth, setIndexWidth] = useState(() => {
    const saved = Number(localStorage.getItem('infraphysics:notes-index-width'));
    return Number.isFinite(saved) && saved >= 180 && saved <= 420 ? saved : 248;
  });
  const [indexCollapsed, setIndexCollapsed] = useState(() => localStorage.getItem('infraphysics:notes-index-collapsed') === '1');
  const active = shortNotes.find(note => note.id === id) ?? shortNotes[0];

  useEffect(() => { localStorage.setItem('infraphysics:notes-index-width', String(Math.round(indexWidth))); }, [indexWidth]);
  useEffect(() => { localStorage.setItem('infraphysics:notes-index-collapsed', indexCollapsed ? '1' : '0'); }, [indexCollapsed]);

  const goToNote = useCallback((noteId: string) => {
    if (noteId === active.id) return;
    // Selecting messages updates the address without building an internal
    // history stack, so Back always returns to the page that opened Notes.
    navigate(`/notes/${noteId}`, { replace: true });
  }, [active.id, navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const index = shortNotes.findIndex(note => note.id === active.id);
      if (event.key === 'ArrowDown' && index < shortNotes.length - 1) { event.preventDefault(); goToNote(shortNotes[index + 1].id); }
      if (event.key === 'ArrowUp' && index > 0) { event.preventDefault(); goToNote(shortNotes[index - 1].id); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active.id, goToNote]);

  useEffect(() => {
    const index = indexRef.current;
    const selected = noteRefs.current.get(active.id);
    if (!index || !selected) return;
    if (index.scrollWidth > index.clientWidth + 2) {
      const left = selected.offsetLeft;
      const right = left + selected.offsetWidth;
      if (left < index.scrollLeft + 12) index.scrollTo({ left: Math.max(0, left - 12), behavior: 'instant' });
      else if (right > index.scrollLeft + index.clientWidth - 12) index.scrollTo({ left: right - index.clientWidth + 12, behavior: 'instant' });
    } else {
      const top = selected.offsetTop;
      const bottom = top + selected.offsetHeight;
      if (top < index.scrollTop + 12) index.scrollTo({ top: Math.max(0, top - 12), behavior: 'instant' });
      else if (bottom > index.scrollTop + index.clientHeight - 12) index.scrollTo({ top: bottom - index.clientHeight + 12, behavior: 'instant' });
    }
    sheetRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [active.id]);

  if (id && !shortNotes.some(note => note.id === id)) return <Navigate to="/notes" replace />;

  const resizeIndex = (clientX: number) => {
    const left = readerRef.current?.getBoundingClientRect().left ?? 0;
    setIndexWidth(Math.max(180, Math.min(420, clientX - left)));
  };

  return (
    <div className={`notes-archive animate-fade-in${indexCollapsed ? ' is-index-collapsed' : ''}`}>
      <header className="notes-topbar">
        <div className="notes-topbar-left">
          <button type="button" className="notes-back" onClick={() => navigate(-1)} aria-label="Go back" title="Go back"><BackChevronIcon /></button>
          <Link to="/home" className="notes-topbar-brand" aria-label="Infraphysics home">
            <Logo className="notes-topbar-logo" color="currentColor" />
            <strong>INFRAPHYSICS</strong>
            <small>NOTES</small>
          </Link>
        </div>
        <div className="wiki-topbar-actions">
          <button type="button" onClick={onOpenSearch} aria-label="Search notes" title="Search notes"><SearchIcon /><span>Search</span></button>
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
        </div>
      </header>

      <div ref={readerRef} className="notes-reader" style={{ '--notes-index-width': `${indexWidth}px` } as React.CSSProperties}>
        <nav id="notes-index" ref={indexRef} className="notes-index" aria-label="Notes index" aria-hidden={indexCollapsed} inert={indexCollapsed}>
          <div className="notes-index-rule"><span>~/notes</span><span className="notes-index-total">{String(shortNotes.length).padStart(2, '0')}</span></div>
          {shortNotes.map((note, index) => (
            <Link
              key={note.id}
              ref={element => { if (element) noteRefs.current.set(note.id, element); else noteRefs.current.delete(note.id); }}
              to={`/notes/${note.id}`}
              onClick={(event) => { event.preventDefault(); goToNote(note.id); }}
              className={note.id === active.id ? 'is-active' : ''}
              aria-current={note.id === active.id ? 'page' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span><strong>{note.title}</strong><small>{note.date}</small></span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="notes-index-toggle"
          onClick={() => setIndexCollapsed(collapsed => !collapsed)}
          aria-label={`${indexCollapsed ? 'Show' : 'Hide'} notes index`}
          aria-controls="notes-index"
          aria-expanded={!indexCollapsed}
          title={`${indexCollapsed ? 'Show' : 'Hide'} notes index`}
        ><BackChevronIcon /></button>

        <div className="notes-splitter" role="separator" aria-label="Resize notes index" aria-hidden={indexCollapsed} aria-orientation="vertical" aria-valuemin={180} aria-valuemax={420} aria-valuenow={Math.round(indexWidth)} tabIndex={indexCollapsed ? -1 : 0}
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); resizeIndex(event.clientX); }}
          onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) resizeIndex(event.clientX); }}
          onPointerUp={event => { event.currentTarget.releasePointerCapture(event.pointerId); }}
          onKeyDown={event => { if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return; event.preventDefault(); setIndexWidth(width => Math.max(180, Math.min(420, width + (event.key === 'ArrowLeft' ? -12 : 12)))); }}><span /></div>

        <article ref={sheetRef} className="notes-sheet" key={active.id}>
          <div className="notes-document">
            <time className="notes-document-date">{active.date}</time>
            <h2>{active.title}</h2>
            <div className="notes-sheet-body">
              {active.body.map((paragraph, index) => paragraph.startsWith('## ')
                ? <h3 key={index}>{paragraph.slice(3)}</h3>
                : <p key={index}>{renderNoteText(paragraph)}</p>)}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
