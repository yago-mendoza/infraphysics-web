import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import profile from '../data/agent-profile.json';
import { shortNotes, type ShortNote } from '../data/notes';
import '../styles/x-notes.css';

type IconProps = React.SVGProps<SVGSVGElement>;

const SearchIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
  </svg>
);

const HomeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="m3.5 10.5 8.5-7 8.5 7V21h-6v-6h-5v6h-6V10.5Z" />
  </svg>
);

const XIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const ProfileIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c.55-4.05 3-6 7-6s6.45 1.95 7 6H5Z" />
  </svg>
);

const RepostIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="m7 7 3-3m-3 3 3 3M7 7h8a4 4 0 0 1 4 4v1M17 17l-3 3m3-3-3-3m3 3H9a4 4 0 0 1-4-4v-1" />
  </svg>
);

const BookmarkIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M6 4.5h12v16l-6-4-6 4v-16Z" />
  </svg>
);

const MoreIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" />
  </svg>
);

const LinkIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M10 13.5a4.5 4.5 0 0 0 6.36.14l2.28-2.28A4.5 4.5 0 0 0 12.28 5l-1.3 1.3m3.02 4.2a4.5 4.5 0 0 0-6.36-.14l-2.28 2.28A4.5 4.5 0 0 0 11.72 19l1.3-1.3" />
  </svg>
);

const ShareIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v7h14v-7" />
  </svg>
);

const ExternalIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M14 5h5v5m0-5-9 9m8 0v5H5V6h5" />
  </svg>
);

const CloseIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

interface TopicRule {
  label: string;
  terms: string[];
}

const TOPIC_RULES: TopicRule[] = [
  { label: 'FSD', terms: ['fsd', 'self driving', 'autonomous driving', 'conduccion autonoma', 'nivel 4', 'nivel 5', 'tesla'] },
  { label: 'IA', terms: ['llm', 'inteligencia artificial', 'modelo', 'agente', 'ai ', 'astra'] },
  { label: 'Robótica', terms: ['robot', 'robotica', 'humanoide', 'embodiment', 'actuador'] },
  { label: 'Transporte', terms: ['transporte', 'conduccion', 'driving', 'vehicle', 'vehiculo', 'coche', ' car ', 'bus', 'volkswagen'] },
  { label: 'Sistemas', terms: ['systems', 'sistema', 'infraestructura', 'interface', 'deployment', 'control', 'reliable'] },
  { label: 'Productividad', terms: ['productividad', 'productivity', 'junior', 'senior', 'prototipo', 'descartar', 'trabajo'] },
  { label: 'Europa', terms: ['europa', 'europe', 'regulacion', 'regulation', 'mandate', 'gobierno'] },
];

const normalize = (value: string) => ` ${value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()} `;

const noteText = (note: ShortNote) => normalize(`${note.title} ${note.body.join(' ')}`);

const topicsFor = (note: ShortNote) => {
  const text = noteText(note);
  return TOPIC_RULES
    .map(topic => ({ ...topic, score: topic.terms.filter(term => text.includes(term)).length }))
    .filter(topic => topic.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(topic => topic.label);
};

const renderNoteText = (text: string) => text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g).map((part, index) => {
  const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
  return match
    ? <a key={index} href={match[2]} target="_blank" rel="noreferrer">{match[1]}</a>
    : part;
});

const formatDate = (date: string) => new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(`${date}T12:00:00`));

const xUrl = profile.identity.sameAs.find(url => url.includes('x.com/')) ?? 'https://x.com/ymdatweets';
const xHandle = `@${new URL(xUrl).pathname.replace(/^\//, '')}`;

export const XNotesView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('infraphysics:x-bookmarks') ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });

  const noteTopics = useMemo(() => new Map(shortNotes.map(note => [note.id, topicsFor(note)])), []);
  const availableTopics = useMemo(() => TOPIC_RULES
    .map(topic => ({
      label: topic.label,
      count: shortNotes.filter(note => noteTopics.get(note.id)?.includes(topic.label)).length,
    }))
    .filter(topic => topic.count >= 2)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)), [noteTopics]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return shortNotes.filter(note => {
      const matchesQuery = !query.trim() || noteText(note).includes(normalizedQuery.trim());
      const matchesFrom = !fromDate || note.date >= fromDate;
      const matchesTo = !toDate || note.date <= toDate;
      const matchesTopic = !activeTopic || noteTopics.get(note.id)?.includes(activeTopic);
      return matchesQuery && matchesFrom && matchesTo && matchesTopic;
    });
  }, [activeTopic, fromDate, noteTopics, query, toDate]);

  const hasFilters = Boolean(query || fromDate || toDate || activeTopic);

  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView({ block: 'start' });
  }, []);

  const clearFilters = () => {
    setQuery('');
    setFromDate('');
    setToDate('');
    setActiveTopic('');
  };

  const copyPostLink = async (noteId: string) => {
    const url = `${window.location.origin}/x#${noteId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(noteId);
      window.setTimeout(() => setCopiedId(current => current === noteId ? '' : current), 1600);
    } catch {
      window.location.hash = noteId;
    }
  };

  const toggleBookmark = (noteId: string) => {
    setBookmarkedIds(current => {
      const next = new Set(current);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      try { localStorage.setItem('infraphysics:x-bookmarks', JSON.stringify([...next])); } catch { /* Optional local preference. */ }
      return next;
    });
  };

  return (
    <div className="x-notes-page">
      <div className="x-notes-layout">
        <nav className="x-notes-rail" aria-label="Experimental feed navigation">
          <a className="x-notes-mark" href="#top" aria-label="Top of feed"><XIcon /></a>
          <Link className="x-notes-rail-link" to="/home" aria-label="Infraphysics home"><HomeIcon /><span>Home</span></Link>
          <a className="x-notes-rail-link" href="#filters" aria-label="Explore this feed"><SearchIcon /><span>Explore</span></a>
          <a className="x-notes-rail-link" href={xUrl} target="_blank" rel="noreferrer" aria-label="Profile on X"><ProfileIcon /><span>Profile</span></a>
          <a className="x-notes-compose" href="https://x.com/compose/post" target="_blank" rel="noreferrer"><span>Post</span><XIcon /></a>
          <a className="x-notes-rail-profile" href={xUrl} target="_blank" rel="noreferrer" aria-label={`${profile.identity.name} on X`}>
            <img src={profile.identity.image} alt="" />
            <span><strong>{profile.identity.name}</strong><small>{xHandle}</small></span>
            <MoreIcon />
          </a>
        </nav>

        <main className="x-notes-timeline" id="top">
          <header className="x-notes-sticky-header">
            <div>
              <h1>{profile.identity.name}</h1>
              <span>{shortNotes.length} posts</span>
            </div>
            <a href={xUrl} target="_blank" rel="noreferrer" aria-label={`${profile.identity.name} on X`} title="Open profile on X"><ExternalIcon /></a>
          </header>

          <section className="x-notes-profile" aria-label="Profile summary">
            <div className="x-notes-profile-rule" aria-hidden="true" />
            <div className="x-notes-profile-row">
              <img src={profile.identity.image} alt={profile.identity.name} />
              <a href={xUrl} target="_blank" rel="noreferrer">View on X</a>
            </div>
            <h2>{profile.identity.name}</h2>
            <p className="x-notes-handle">{xHandle}</p>
            <p className="x-notes-bio">Industrial engineer and systems-oriented generalist, with particular depth in applied AI. Short observations from InfraPhysics, arranged as a timeline.</p>
          </section>

          <section className="x-notes-filters" id="filters" aria-label="Filter posts">
            <label className="x-notes-search">
              <SearchIcon />
              <span className="sr-only">Search posts</span>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Yago's posts" type="search" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><CloseIcon /></button>}
            </label>
            <div className="x-notes-date-range">
              <label><span>From</span><input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /></label>
              <label><span>To</span><input type="date" value={toDate} onChange={event => setToDate(event.target.value)} /></label>
            </div>
            <div className="x-notes-topics" aria-label="Detected topics">
              {availableTopics.map(topic => (
                <button
                  type="button"
                  key={topic.label}
                  className={activeTopic === topic.label ? 'is-active' : ''}
                  onClick={() => setActiveTopic(current => current === topic.label ? '' : topic.label)}
                >
                  {topic.label}<span>{topic.count}</span>
                </button>
              ))}
              {hasFilters && <button type="button" className="x-notes-clear" onClick={clearFilters}>Clear</button>}
            </div>
            <p className="x-notes-filter-status" aria-live="polite">
              {hasFilters ? `${filteredNotes.length} of ${shortNotes.length} posts` : 'Topics are inferred from the language of the notes.'}
            </p>
          </section>

          <section className="x-notes-feed" aria-label="Posts">
            {filteredNotes.map(note => (
              <article className="x-note-post" id={note.id} key={note.id}>
                <img className="x-note-avatar" src={profile.identity.image} alt="" />
                <div className="x-note-content">
                  <header className="x-note-author">
                    <strong>{profile.identity.name}</strong>
                    <span>{xHandle}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={note.date}>{formatDate(note.date)}</time>
                  </header>
                  <h2>{note.title}</h2>
                  <div className="x-note-body">
                    {note.body.map((paragraph, index) => <p key={index}>{renderNoteText(paragraph)}</p>)}
                  </div>
                  <div className="x-note-tags">
                    {(noteTopics.get(note.id) ?? []).slice(0, 3).map(topic => (
                      <button type="button" key={topic} onClick={() => setActiveTopic(topic)}>#{topic}</button>
                    ))}
                  </div>
                  <footer className="x-note-actions">
                    <a href={`#${note.id}`} aria-label={`Permalink to ${note.title}`} title="Permalink"><LinkIcon /></a>
                    <a
                      className="x-note-repost"
                      href={`https://x.com/intent/post?text=${encodeURIComponent(note.title)}&url=${encodeURIComponent(`${window.location.origin}/x#${note.id}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Share ${note.title} on X`}
                      title="Share on X"
                    ><RepostIcon /></a>
                    <button
                      type="button"
                      className={bookmarkedIds.has(note.id) ? 'is-bookmarked' : ''}
                      onClick={() => toggleBookmark(note.id)}
                      aria-pressed={bookmarkedIds.has(note.id)}
                      aria-label={`${bookmarkedIds.has(note.id) ? 'Remove' : 'Save'} bookmark for ${note.title}`}
                      title={bookmarkedIds.has(note.id) ? 'Remove bookmark' : 'Bookmark'}
                    ><BookmarkIcon /></button>
                    <button type="button" onClick={() => copyPostLink(note.id)} aria-label={`Copy link to ${note.title}`} title="Copy link">
                      <ShareIcon />
                      <span>{copiedId === note.id ? 'Copied' : 'Share'}</span>
                    </button>
                    <span className="x-note-marker">{note.marker}</span>
                  </footer>
                </div>
              </article>
            ))}
            {filteredNotes.length === 0 && (
              <div className="x-notes-empty">
                <h2>No posts found</h2>
                <p>Try a different phrase, topic or date range.</p>
                <button type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </section>
        </main>

        <aside className="x-notes-aside">
          <label className="x-notes-aside-search">
            <SearchIcon />
            <span className="sr-only">Search posts</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search" type="search" />
          </label>
          <div className="x-notes-aside-card">
            <h2>What keeps coming up</h2>
            <p>Themes emerge from the notes themselves. They are not a fixed editorial taxonomy.</p>
            {availableTopics.slice(0, 5).map(topic => (
              <button type="button" key={topic.label} onClick={() => setActiveTopic(topic.label)}>
                <span>Topic</span>
                <strong>{topic.label}</strong>
                <small>{topic.count} posts</small>
              </button>
            ))}
          </div>
          <p className="x-notes-aside-meta">Experimental view · <Link to="/home">Infraphysics</Link></p>
        </aside>
      </div>
    </div>
  );
};
