// Second Brain logic hook - concept wiki with address-based navigation

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';

export const useSecondBrain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Get all field notes
  const allFieldNotes = useMemo(() => posts.filter(p => p.category === 'fieldnotes'), []);

  // Active Post from URL
  const activePost = useMemo(() => {
    if (id) return allFieldNotes.find(p => p.id === id) || null;
    return null;
  }, [id, allFieldNotes]);

  // Backlinks: concepts whose references[] include the active concept's address
  const backlinks = useMemo(() => {
    if (!activePost) return [];
    return allFieldNotes.filter(note => {
      if (note.id === activePost.id) return false;
      return (note.references || []).some(ref => {
        const refId = ref.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-');
        return refId === activePost.id;
      });
    });
  }, [activePost, allFieldNotes]);

  // Related concepts from trailingRefs
  const relatedConcepts = useMemo(() => {
    if (!activePost || !activePost.trailingRefs) return [];
    return activePost.trailingRefs
      .map(ref => {
        const refId = ref.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-');
        return allFieldNotes.find(n => n.id === refId);
      })
      .filter((n): n is Post => n !== undefined);
  }, [activePost, allFieldNotes]);

  // Outgoing reference count
  const outgoingRefCount = useMemo(() => {
    return activePost?.references?.length || 0;
  }, [activePost]);

  // Global stats
  const totalLinks = useMemo(() => {
    return allFieldNotes.reduce((sum, n) => sum + (n.references?.length || 0), 0);
  }, [allFieldNotes]);

  const orphanCount = useMemo(() => {
    const linkedTo = new Set<string>();
    allFieldNotes.forEach(n => {
      (n.references || []).forEach(ref => {
        linkedTo.add(ref.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-'));
      });
    });
    return allFieldNotes.filter(n => {
      const hasOutgoing = (n.references?.length || 0) > 0;
      const hasIncoming = linkedTo.has(n.id);
      return !hasOutgoing && !hasIncoming;
    }).length;
  }, [allFieldNotes]);

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
  }, [query, allFieldNotes]);

  // Navigation
  const navigateToNote = useCallback((noteId: string) => {
    navigate(`/second-brain/${noteId}`);
  }, [navigate]);

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
    totalLinks,
    orphanCount,
    navigateToNote,
  };
};
