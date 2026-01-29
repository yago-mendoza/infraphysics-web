// Second Brain logic hook - state and logic for the knowledge base view

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';
import { extractKeywords } from '../lib/content';

export interface NoteConnection {
  targetId: string;
  strength: number;
  sharedConcepts: string[];
}

export const useSecondBrain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');

  // Get all field notes
  const allFieldNotes = useMemo(() => posts.filter(p => p.category === 'fieldnotes'), []);

  // Date range state
  const timestamps = useMemo(() =>
    allFieldNotes.map(p => new Date(p.date).getTime()).sort((a, b) => a - b),
    [allFieldNotes]
  );
  const minTime = timestamps[0] || new Date().getTime();
  const maxTime = timestamps[timestamps.length - 1] || new Date().getTime();
  const [dateRange, setDateRange] = useState<[number, number]>([minTime, maxTime]);

  // Build a map of all keywords per note for efficient lookups
  const noteKeywordsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    allFieldNotes.forEach(note => {
      map.set(note.id, extractKeywords(note.content));
    });
    return map;
  }, [allFieldNotes]);

  // Build complete connection graph
  const connectionGraph = useMemo(() => {
    const graph = new Map<string, NoteConnection[]>();

    allFieldNotes.forEach(note => {
      const connections: NoteConnection[] = [];
      const noteKeywords = noteKeywordsMap.get(note.id) || [];

      allFieldNotes.forEach(other => {
        if (other.id === note.id) return;

        const otherKeywords = noteKeywordsMap.get(other.id) || [];
        const shared = noteKeywords.filter(k => otherKeywords.includes(k));

        // Also check for explicit [[wiki-links]]
        const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
        let match;
        const wikiLinks: string[] = [];
        while ((match = wikiLinkRegex.exec(note.content)) !== null) {
          const linkText = match[1].toLowerCase().replace(/\s+/g, '-');
          if (linkText === other.id || other.title.toLowerCase().includes(match[1].toLowerCase())) {
            wikiLinks.push(match[1]);
          }
        }

        const hasWikiLink = wikiLinks.length > 0;
        const hasSharedConcepts = shared.length > 0;

        if (hasWikiLink || hasSharedConcepts) {
          connections.push({
            targetId: other.id,
            strength: shared.length + (hasWikiLink ? 3 : 0), // Wiki links add extra strength
            sharedConcepts: [...shared, ...wikiLinks],
          });
        }
      });

      // Sort by strength
      connections.sort((a, b) => b.strength - a.strength);
      graph.set(note.id, connections);
    });

    return graph;
  }, [allFieldNotes, noteKeywordsMap]);

  // Find related notes for a specific note
  const findRelatedNotes = useCallback((post: Post): Post[] => {
    if (!post) return [];
    const connections = connectionGraph.get(post.id) || [];
    return connections
      .slice(0, 4)
      .map(conn => allFieldNotes.find(n => n.id === conn.targetId))
      .filter((n): n is Post => n !== undefined);
  }, [connectionGraph, allFieldNotes]);

  // Find backlinks (notes that link TO the current note)
  const findBacklinks = useCallback((post: Post): Post[] => {
    if (!post) return [];
    const backlinks: Post[] = [];

    connectionGraph.forEach((connections, sourceId) => {
      if (sourceId === post.id) return;
      const linksToPost = connections.some(c => c.targetId === post.id);
      if (linksToPost) {
        const source = allFieldNotes.find(n => n.id === sourceId);
        if (source) backlinks.push(source);
      }
    });

    return backlinks;
  }, [connectionGraph, allFieldNotes]);

  // Get connections with their metadata for a note
  const getConnectionsWithMeta = useCallback((noteId: string) => {
    return connectionGraph.get(noteId) || [];
  }, [connectionGraph]);

  // Filter posts logic
  const filteredNotes = useMemo(() => {
    return allFieldNotes
      .filter(p => {
        const t = new Date(p.date).getTime();
        return t >= dateRange[0] && t <= dateRange[1];
      })
      .filter(p =>
        (p.displayTitle || p.title).toLowerCase().includes(query.toLowerCase()) ||
        p.content.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [query, dateRange, allFieldNotes]);

  // Auto-select first note if none selected
  useEffect(() => {
    if (!id && filteredNotes.length > 0) {
      navigate(`/second-brain/${filteredNotes[0].id}`, { replace: true });
    }
  }, [id, filteredNotes, navigate]);

  // Active Post
  const activePost = useMemo(() => {
    if (id) return allFieldNotes.find(p => p.id === id);
    return filteredNotes[0] || null;
  }, [id, filteredNotes, allFieldNotes]);

  // Related notes for active post
  const relatedNotes = useMemo(() => {
    return activePost ? findRelatedNotes(activePost) : [];
  }, [activePost, findRelatedNotes]);

  // Backlinks for active post
  const backlinks = useMemo(() => {
    return activePost ? findBacklinks(activePost) : [];
  }, [activePost, findBacklinks]);

  // Keywords for active post
  const activeKeywords = useMemo(() => {
    return activePost ? noteKeywordsMap.get(activePost.id) || [] : [];
  }, [activePost, noteKeywordsMap]);

  // Get all unique keywords across all notes
  const allKeywords = useMemo(() => {
    const keywordCounts: Record<string, number> = {};
    noteKeywordsMap.forEach(keywords => {
      keywords.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    return Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [noteKeywordsMap]);

  // Slider Handlers
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDateRange([Math.min(val, dateRange[1]), dateRange[1]]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDateRange([dateRange[0], Math.max(val, dateRange[0])]);
  };

  // Navigation handler for clicking nodes in graph
  const navigateToNote = useCallback((noteId: string) => {
    navigate(`/second-brain/${noteId}`);
  }, [navigate]);

  return {
    id,
    query,
    setQuery,
    viewMode,
    setViewMode,
    allFieldNotes,
    filteredNotes,
    activePost,
    relatedNotes,
    backlinks,
    activeKeywords,
    allKeywords,
    dateRange,
    minTime,
    maxTime,
    handleStartChange,
    handleEndChange,
    connectionGraph,
    getConnectionsWithMeta,
    navigateToNote,
    extractKeywords,
  };
};
