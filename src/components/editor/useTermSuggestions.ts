// Detects unlinked mentions of known fieldnote names in the editor body
// and surfaces them as suggestions in the diagnostics terminal.

import { useMemo, useState, useDeferredValue, useCallback, useEffect } from 'react';
import type { FieldNoteMeta } from '../../types';

export interface TermSuggestion {
  uid: string;
  name: string;
  address: string;
  term: string;       // the matched text in the body
  offset: number;     // char offset in rawContent
  length: number;
  line: number;
}

interface TermEntry {
  uid: string;
  name: string;
  address: string;
  term: string;       // the name/alias string to match
  regex: RegExp;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Build skip ranges: frontmatter, wiki-links, fenced code, inline code, trailing refs */
function buildSkipRanges(raw: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];

  // Frontmatter (--- ... ---)
  const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---/);
  if (fmMatch) {
    ranges.push([0, fmMatch[0].length]);
  }

  // Wiki-links [[...]]
  const wikiRe = /\[\[[\s\S]*?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = wikiRe.exec(raw)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // Fenced code blocks ```...```
  const fenceRe = /^```[^\n]*\n[\s\S]*?^```/gm;
  while ((m = fenceRe.exec(raw)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // Inline code `...`
  const inlineRe = /`[^`\n]+`/g;
  while ((m = inlineRe.exec(raw)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // Trailing refs: contiguous block of `- [[` lines anchored at document end
  const trailingMatch = raw.match(/(?:\n- \[\[.*)+\s*$/);
  if (trailingMatch && trailingMatch.index != null) {
    ranges.push([trailingMatch.index, raw.length]);
  }

  return ranges;
}

function isInsideSkip(offset: number, length: number, skipRanges: Array<[number, number]>): boolean {
  const end = offset + length;
  for (const [start, stop] of skipRanges) {
    if (offset >= start && end <= stop) return true;
  }
  return false;
}

function lineAt(raw: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < raw.length; i++) {
    if (raw[i] === '\n') line++;
  }
  return line;
}

export function useTermSuggestions(
  rawContent: string,
  allNotes: FieldNoteMeta[],
  currentUid: string | null,
): { suggestions: TermSuggestion[]; dismiss: (s: TermSuggestion) => void } {
  const deferredContent = useDeferredValue(rawContent);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Reset dismissed when note changes
  useEffect(() => {
    setDismissed(new Set());
  }, [currentUid]);

  // Build term index from allNotes
  const termIndex = useMemo(() => {
    if (!currentUid) return [];
    const entries: TermEntry[] = [];

    for (const note of allNotes) {
      if (note.id === currentUid) continue;

      // Add note name (2+ chars — \b prevents false matches like "ML" inside "HTML")
      if (note.name && note.name.length >= 2) {
        entries.push({
          uid: note.id,
          name: note.name,
          address: note.address,
          term: note.name,
          regex: new RegExp(`\\b${escapeRegex(note.name)}\\b`, 'gi'),
        });
      }

      // Add aliases
      if (note.aliases) {
        for (const alias of note.aliases) {
          if (alias.length >= 2) {
            entries.push({
              uid: note.id,
              name: note.name,
              address: note.address,
              term: alias,
              regex: new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi'),
            });
          }
        }
      }
    }

    // Sort longest first — "vanishing gradient" matches before "gradient"
    entries.sort((a, b) => b.term.length - a.term.length);
    return entries;
  }, [allNotes, currentUid]);

  // Scan body for suggestions
  const suggestions = useMemo(() => {
    if (!deferredContent || termIndex.length === 0) return [];

    const skipRanges = buildSkipRanges(deferredContent);
    const results: TermSuggestion[] = [];
    // Track matched ranges to avoid overlapping suggestions
    const matchedRanges: Array<[number, number]> = [];

    for (const entry of termIndex) {
      entry.regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = entry.regex.exec(deferredContent)) !== null) {
        const offset = m.index;
        const length = m[0].length;

        if (isInsideSkip(offset, length, skipRanges)) continue;

        // Check overlap with already-matched ranges
        const overlaps = matchedRanges.some(([s, e]) =>
          (offset < e && offset + length > s)
        );
        if (overlaps) continue;

        // Check dismissed
        const dismissKey = `${entry.uid}:${entry.term.toLowerCase()}`;
        if (dismissed.has(dismissKey)) continue;

        matchedRanges.push([offset, offset + length]);
        results.push({
          uid: entry.uid,
          name: entry.name,
          address: entry.address,
          term: m[0],
          offset,
          length,
          line: lineAt(deferredContent, offset),
        });

        if (results.length >= 20) break;
      }
      if (results.length >= 20) break;
    }

    // Sort by offset for consistent display order
    results.sort((a, b) => a.offset - b.offset);
    return results;
  }, [deferredContent, termIndex, dismissed]);

  const dismiss = useCallback((s: TermSuggestion) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(`${s.uid}:${s.term.toLowerCase()}`);
      return next;
    });
  }, []);

  return { suggestions, dismiss };
}
