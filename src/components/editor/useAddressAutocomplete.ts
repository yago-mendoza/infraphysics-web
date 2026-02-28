// Address autocomplete hook — terminal-style path completion for fieldnote addresses.
// Builds a segment map from allNotes, offers prefix-filtered suggestions,
// and supports Tab/Shift+Tab cycling.

import { useMemo, useState, useCallback, useEffect } from 'react';
import type { FieldNoteMeta } from '../../types';
import { parseAddress } from '../../lib/content/address.js';

export interface Suggestion {
  segment: string;
  childCount: number;
}

export interface AddressAutocomplete {
  suggestions: Suggestion[];
  selectedIndex: number;
  isOpen: boolean;
  completionPrefix: string;
  filterText: string;
  dismiss: () => void;
  setSelectedIndex: (idx: number) => void;
  cycleNext: () => string;
  cyclePrev: () => string;
}

/**
 * Build segment map: parentPrefix → Set<childSegment>
 * Key "" → root segments, Key "ML" → children of ML, etc.
 */
function buildSegmentMap(allNotes: FieldNoteMeta[]): Map<string, Map<string, number>> {
  // parentPrefix → child segment → count of grandchildren
  const segMap = new Map<string, Map<string, number>>();

  // Collect all addresses
  const allAddresses = allNotes.map(n => n.address);

  for (const addr of allAddresses) {
    const parts = parseAddress(addr);
    for (let i = 0; i < parts.length; i++) {
      const parentKey = i === 0 ? '' : parts.slice(0, i).join('//');
      const seg = parts[i];
      if (!segMap.has(parentKey)) segMap.set(parentKey, new Map());
      const children = segMap.get(parentKey)!;
      if (!children.has(seg)) children.set(seg, 0);
    }
  }

  // Count children for each segment (how many children does "ML//Training" have?)
  for (const addr of allAddresses) {
    const parts = parseAddress(addr);
    if (parts.length >= 2) {
      const parentAddr = parts.slice(0, -1).join('//');
      // parentAddr has at least one child (this note)
      // We want to count children of each segment at each level
      for (let i = 0; i < parts.length; i++) {
        const segAddr = parts.slice(0, i + 1).join('//');
        const parentKey = i === 0 ? '' : parts.slice(0, i).join('//');
        const seg = parts[i];
        const children = segMap.get(parentKey);
        if (children) {
          // Count how many unique direct children segAddr has
          const directChildrenKey = segAddr;
          const directChildren = segMap.get(directChildrenKey);
          if (directChildren) {
            children.set(seg, directChildren.size);
          }
        }
      }
    }
  }

  return segMap;
}

export function useAddressAutocomplete(
  allNotes: FieldNoteMeta[],
  address: string,
): AddressAutocomplete {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [lastAddress, setLastAddress] = useState(address);

  // Re-open when address changes
  useEffect(() => {
    if (address !== lastAddress) {
      setDismissed(false);
      setLastAddress(address);
    }
  }, [address, lastAddress]);

  // Build segment map — only recalculate when allNotes changes
  const segmentMap = useMemo(() => buildSegmentMap(allNotes), [allNotes]);

  // Parse current address into lookup key + filter text
  const { completionPrefix, filterText, lookupKey } = useMemo(() => {
    if (!address) return { completionPrefix: '', filterText: '', lookupKey: '' };

    const lastSep = address.lastIndexOf('//');
    if (lastSep === -1) {
      // No separator — filtering root segments
      return { completionPrefix: '', filterText: address, lookupKey: '' };
    }

    // Has separator — prefix is everything up to and including "//"
    const prefix = address.slice(0, lastSep + 2); // includes "//"
    const filter = address.slice(lastSep + 2);
    const key = address.slice(0, lastSep); // parent address without "//"
    return { completionPrefix: prefix, filterText: filter, lookupKey: key };
  }, [address]);

  // Get filtered suggestions
  const suggestions = useMemo(() => {
    const children = segmentMap.get(lookupKey);
    if (!children) return [];

    const filterLower = filterText.toLowerCase();
    const result: Suggestion[] = [];

    for (const [seg, childCount] of children) {
      if (!filterLower || seg.toLowerCase().startsWith(filterLower)) {
        result.push({ segment: seg, childCount });
      }
    }

    // Sort alphabetically
    result.sort((a, b) => a.segment.localeCompare(b.segment));
    return result;
  }, [segmentMap, lookupKey, filterText]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions.length, lookupKey, filterText]);

  const isOpen = !dismissed && suggestions.length > 0 && (
    // Don't show when there's exactly one suggestion that matches exactly
    !(suggestions.length === 1 && suggestions[0].segment.toLowerCase() === filterText.toLowerCase())
  );

  const dismiss = useCallback(() => setDismissed(true), []);

  const cycleNext = useCallback((): string => {
    if (suggestions.length === 0) return address;
    const idx = selectedIndex >= suggestions.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(idx);
    return completionPrefix + suggestions[idx].segment;
  }, [suggestions, selectedIndex, completionPrefix, address]);

  const cyclePrev = useCallback((): string => {
    if (suggestions.length === 0) return address;
    const idx = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
    setSelectedIndex(idx);
    return completionPrefix + suggestions[idx].segment;
  }, [suggestions, selectedIndex, completionPrefix, address]);

  return {
    suggestions,
    selectedIndex,
    isOpen,
    completionPrefix,
    filterText,
    dismiss,
    setSelectedIndex,
    cycleNext,
    cyclePrev,
  };
}
