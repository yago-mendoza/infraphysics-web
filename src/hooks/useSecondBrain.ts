// Second Brain logic hook - state and logic for the knowledge base view

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';
import { extractKeywords } from '../lib/content';

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

  // Find related notes based on shared keywords
  const findRelatedNotes = (post: Post): Post[] => {
    if (!post) return [];
    const postKeywords = extractKeywords(post.content);

    return allFieldNotes
      .filter(p => p.id !== post.id)
      .map(p => {
        const otherKeywords = extractKeywords(p.content);
        const shared = postKeywords.filter(k => otherKeywords.includes(k));
        return { post: p, score: shared.length };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ post }) => post);
  };

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
  }, [activePost, allFieldNotes]);

  // Keywords for active post
  const activeKeywords = useMemo(() => {
    return activePost ? extractKeywords(activePost.content) : [];
  }, [activePost]);

  // Get all unique keywords across all notes
  const allKeywords = useMemo(() => {
    const keywordCounts: Record<string, number> = {};
    allFieldNotes.forEach(note => {
      extractKeywords(note.content).forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    return Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [allFieldNotes]);

  // Slider Handlers
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDateRange([Math.min(val, dateRange[1]), dateRange[1]]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDateRange([dateRange[0], Math.max(val, dateRange[0])]);
  };

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
    activeKeywords,
    allKeywords,
    dateRange,
    minTime,
    maxTime,
    handleStartChange,
    handleEndChange,
  };
};
