import React, { useMemo, useState } from 'react';
import { useHub } from '../../contexts/SecondBrainHubContext';
import { matchesWikiName } from '../../lib/wikiExplorer';

export function WikiSearchInput({ inputRef, label = 'Search concepts', placeholder = 'Search…' }: {
  inputRef: React.RefObject<HTMLInputElement>; label?: string; placeholder?: string;
}) {
  const { query, setQuery, allWikiNotes } = useHub();
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return allWikiNotes.filter(note => matchesWikiName(note, query)).sort((a, b) =>
      Number((b.name || b.title).toLowerCase().startsWith(query.toLowerCase())) - Number((a.name || a.title).toLowerCase().startsWith(query.toLowerCase()))
      || a.title.localeCompare(b.title)).slice(0, 5);
  }, [allWikiNotes, query]);
  return <div className="wiki-search-control">
    <input ref={inputRef} aria-label={label} value={query} placeholder={placeholder} enterKeyHint="done"
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onChange={event => setQuery(event.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
        if (event.key === 'Escape') { event.preventDefault(); setQuery(''); event.currentTarget.blur(); }
      }} />
    {query && <button type="button" className="wiki-clear-control" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
    {focused && suggestions.length > 0 && <div className="wiki-search-suggestions" role="group" aria-label="Suggested concepts">
      {suggestions.map(note => <button type="button" key={note.id} onPointerDown={event => event.preventDefault()}
        onClick={() => { setQuery(note.name || note.title); inputRef.current?.blur(); }}>
        <strong>{note.displayTitle || note.title}</strong><span>{note.address.replaceAll('//', ' / ')}</span>
      </button>)}
    </div>}
  </div>;
}
