// Second Brain logic hook - concept wiki with address-based navigation

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '../types';
import {
  allFieldNotes,
  noteById,
  backlinksMap,
  relatedConceptsMap,
  resolvedHtmlMap,
  globalStats,
} from '../lib/brainIndex';

export const useSecondBrain = () => {
  const { id } = useParams();
  const [query, setQuery] = useState('');

  // Active Post from URL — O(1) lookup
  const activePost = useMemo(() => {
    if (id) return noteById.get(id) || null;
    return null;
  }, [id]);

  // Backlinks — O(1) lookup
  const backlinks = useMemo(() => {
    if (!activePost) return [];
    return (backlinksMap.get(activePost.id) || []).filter(n => n.id !== activePost.id);
  }, [activePost]);

  // Related concepts — O(1) lookup
  const relatedConcepts = useMemo(() => {
    if (!activePost) return [];
    return relatedConceptsMap.get(activePost.id) || [];
  }, [activePost]);

  // Outgoing reference count
  const outgoingRefCount = useMemo(() => {
    return activePost?.references?.length || 0;
  }, [activePost]);

  // Pre-resolved HTML
  const resolvedHtml = useMemo(() => {
    if (!activePost) return '';
    return resolvedHtmlMap.get(activePost.id) || activePost.content;
  }, [activePost]);

  // Smart search: address matches first, then content matches
  const filteredNotes = useMemo(() => {
    if (!query) return allFieldNotes;
    const q = query.toLowerCase();

    const addressMatches: Post[] = [];
    const contentMatches: Post[] = [];

    allFieldNotes.forEach(note => {
      const address = (note.address || note.title).toLowerCase();
      const displayTitle = (note.displayTitle || note.title).toLowerCase();

      if (address.includes(q) || displayTitle.includes(q)) {
        addressMatches.push(note);
      } else if (note.description.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
        contentMatches.push(note);
      }
    });

    return [...addressMatches, ...contentMatches];
  }, [query]);

  return {
    id,
    query,
    setQuery,
    allFieldNotes,
    filteredNotes,
    activePost,
    backlinks,
    relatedConcepts,
    outgoingRefCount,
    resolvedHtml,
    totalLinks: globalStats.totalLinks,
    orphanCount: globalStats.orphanCount,
  };
};
