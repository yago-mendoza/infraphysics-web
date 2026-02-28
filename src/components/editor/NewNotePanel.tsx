// New note creation panel — address input with terminal-style autocomplete,
// live validation, collision preview, stub parent detection, auto-fill date.
// Name always = leaf segment (no override).

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { FieldNoteMeta } from '../../types';
import { parseAddress, getLeafSegment } from '../../lib/content/address.js';
import { useAddressAutocomplete } from './useAddressAutocomplete';
import type { Suggestion } from './useAddressAutocomplete';

interface Props {
  allNotes: FieldNoteMeta[];
  onCreated: (uid: string) => void;
  onCancel: () => void;
  initialName?: string;
}

export const NewNotePanel: React.FC<Props> = ({ allNotes, onCreated, onCancel, initialName }) => {
  const [address, setAddress] = useState(initialName || '');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize: strip trailing "//" for validation/creation (user may still be typing)
  const cleanAddress = useMemo(() => address.replace(/\/\/+$/, ''), [address]);
  const addressParts = useMemo(() => cleanAddress ? parseAddress(cleanAddress) : [], [cleanAddress]);
  const autoName = useMemo(() => addressParts.length > 0 ? addressParts[addressParts.length - 1] : '', [addressParts]);

  // Check for duplicate address
  const existingAddresses = useMemo(() => new Set(allNotes.map(n => n.address)), [allNotes]);
  const isDuplicate = address && existingAddresses.has(address);

  // Check for segment collisions (notes sharing the same leaf segment)
  const leafSegment = useMemo(() => address ? getLeafSegment(address).toLowerCase() : '', [address]);
  const collisionNotes = useMemo(() => {
    if (!leafSegment) return [];
    return allNotes.filter(n => {
      const parts = n.addressParts || [];
      const leaf = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
      return leaf === leafSegment && n.address !== address;
    });
  }, [leafSegment, allNotes, address]);

  // Check for missing parent addresses
  const missingParents = useMemo(() => {
    if (addressParts.length <= 1) return [];
    const missing: string[] = [];
    for (let i = 1; i < addressParts.length; i++) {
      const parentAddr = addressParts.slice(0, i).join('//');
      if (!existingAddresses.has(parentAddr)) {
        missing.push(parentAddr);
      }
    }
    return missing;
  }, [addressParts, existingAddresses]);

  // Autocomplete
  const ac = useAddressAutocomplete(allNotes, address);

  // Scroll selected item into view
  useEffect(() => {
    if (!ac.isOpen || !dropdownRef.current) return;
    if (ac.selectedIndex < 0) return;
    // +1 to skip the sticky header div
    const el = dropdownRef.current.children[ac.selectedIndex + 1] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [ac.selectedIndex, ac.isOpen]);

  const acceptSuggestion = useCallback((suggestion: Suggestion) => {
    const full = ac.completionPrefix + suggestion.segment;
    // If address already exists, force "//" — you can only create sub-concepts
    setAddress(existingAddresses.has(full) ? full + '//' : full);
    inputRef.current?.focus();
  }, [ac.completionPrefix, existingAddresses]);

  const canCreate = cleanAddress && autoName && !isDuplicate && !creating;

  const handleCreate = useCallback(async () => {
    if (!canCreate) return;
    setCreating(true);
    setError(null);

    try {
      const resp = await fetch('/api/fieldnotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: cleanAddress,
          name: autoName,
          date: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        setError(data.error || 'Creation failed');
        return;
      }

      const { uid } = await resp.json();
      onCreated(uid);
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }, [canCreate, cleanAddress, autoName, onCreated]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      if (!ac.isOpen) return; // let normal Tab behavior through
      e.preventDefault();
      if (e.shiftKey) {
        setAddress(ac.cyclePrev());
      } else {
        setAddress(ac.cycleNext());
      }
      return;
    }

    if (ac.isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = ac.selectedIndex >= ac.suggestions.length - 1 ? 0 : ac.selectedIndex + 1;
        ac.setSelectedIndex(next);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (ac.selectedIndex <= 0) {
          ac.dismiss();
        } else {
          ac.setSelectedIndex(ac.selectedIndex - 1);
        }
        return;
      }
      if (e.key === 'Enter') {
        if (ac.selectedIndex >= 0) {
          e.preventDefault();
          acceptSuggestion(ac.suggestions[ac.selectedIndex]);
          return;
        }
        // No suggestion selected — fall through to create
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        ac.dismiss();
        return;
      }
    } else {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
    }

    // Enter with no dropdown selection → create if ready
    if (e.key === 'Enter' && canCreate) {
      e.preventDefault();
      handleCreate();
    }
  }, [ac, acceptSuggestion, onCancel, canCreate, handleCreate]);

  return (
    <div
      className="border p-4 space-y-4"
      style={{
        backgroundColor: 'var(--editor-bg)',
        borderColor: 'var(--editor-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-th-secondary uppercase tracking-wider">New Note</h3>
        <button onClick={onCancel} className="text-th-muted hover:text-th-secondary text-sm">&times;</button>
      </div>

      {/* Address input with autocomplete */}
      <div>
        <label className="text-[10px] text-th-muted uppercase tracking-wider block mb-1">
          Address
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={address}
            onChange={e => {
              const v = e.target.value;
              // Auto-append "//" when typing forward into an existing address,
              // but only if no other sibling address starts with the same text
              // (e.g. "Blockchain" + "Blockchain de Nodos" → don't auto-append)
              if (v.length > address.length && !v.endsWith('//') && existingAddresses.has(v)) {
                const hasAmbiguousSibling = allNotes.some(n =>
                  n.address !== v && n.address.startsWith(v) && !n.address.startsWith(v + '//')
                );
                setAddress(hasAmbiguousSibling ? v : v + '//');
              } else {
                setAddress(v);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Hardware//CPU//cache line"
            autoFocus
            className="w-full text-[12px] px-2 py-1.5 bg-th-surface border border-th-border focus:border-violet-400/50 focus:outline-none text-th-primary placeholder-th-muted font-mono"
          />
          {ac.isOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-20 w-full mt-1 border border-th-border overflow-hidden max-h-96 overflow-y-auto thin-scrollbar"
              style={{ backgroundColor: 'var(--hub-sidebar-bg, #1a1a1a)' }}
              onMouseDown={e => e.stopPropagation()}
            >
              <div className="px-2 py-0.5 text-[9px] text-th-muted sticky top-0" style={{ backgroundColor: 'var(--hub-sidebar-bg, #1a1a1a)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {ac.suggestions.length} entries
              </div>
              {ac.suggestions.map((s, i) => (
                <button
                  key={s.segment}
                  onMouseEnter={() => ac.setSelectedIndex(i)}
                  onClick={() => acceptSuggestion(s)}
                  className={`w-full text-left px-2 py-1 text-[11px] flex items-center justify-between transition-colors ${
                    i === ac.selectedIndex
                      ? 'bg-violet-400/15 text-violet-400'
                      : 'text-th-primary hover:bg-violet-400/5'
                  }`}
                >
                  <span className="font-mono truncate">
                    <HighlightMatch text={s.segment} filter={ac.filterText} />
                  </span>
                  {s.childCount > 0 && (
                    <span className="text-th-muted text-[10px] ml-2 flex-shrink-0">
                      {s.childCount}&rarr;
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {isDuplicate && (
          <div className="text-[10px] text-red-400 mt-1">Address already exists</div>
        )}
      </div>

      {/* Collision hints — clickable, non-blocking */}
      {collisionNotes.length > 0 && (
        <div className="text-[11px] space-y-0.5">
          <span className="text-th-muted">already exists at</span>
          {collisionNotes.map(n => (
            <button
              key={n.id}
              onClick={() => setAddress(n.address)}
              className="w-full text-left px-2 py-1 text-violet-400/70 hover:text-violet-400 hover:bg-violet-400/5 transition-colors font-mono truncate"
              title={n.address}
            >
              {n.address.replace(/\/\//g, ' / ')}
            </button>
          ))}
        </div>
      )}

      {/* Missing parents */}
      {missingParents.length > 0 && (
        <div className="border border-violet-400/30 p-2 text-[11px]">
          <div className="text-violet-400 mb-1">
            {missingParents.length} stub parent{missingParents.length > 1 ? 's' : ''} needed:
          </div>
          {missingParents.map(p => (
            <div key={p} className="text-th-secondary ml-2 font-mono">
              {p.replace(/\/\//g, ' / ')}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-[11px] text-red-400">{error}</div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className={`flex-1 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
            canCreate
              ? 'border border-violet-400/50 text-violet-400 hover:bg-violet-400/10'
              : 'border border-th-border/30 text-th-muted cursor-default'
          }`}
        >
          {creating ? 'Creating...' : 'Create note'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[11px] text-th-muted hover:text-th-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/** Highlight the matching prefix within a suggestion segment */
const HighlightMatch: React.FC<{ text: string; filter: string }> = ({ text, filter }) => {
  if (!filter) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(filter.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-violet-400 font-semibold">{text.slice(idx, idx + filter.length)}</span>
      {text.slice(idx + filter.length)}
    </>
  );
};
