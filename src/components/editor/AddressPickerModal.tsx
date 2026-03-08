// Modal for interactively browsing the fieldnote hierarchy and selecting a new address.
// Shows tree navigation with breadcrumbs, search, and iterative drilling.

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { FieldNoteMeta } from '../../types';

interface Props {
  allNotes: FieldNoteMeta[];
  currentAddress: string;
  currentName: string;
  onConfirm: (newAddress: string, newName: string) => void;
  onCancel: () => void;
}

interface TreeNode {
  segment: string;
  fullAddress: string;
  hasNote: boolean;
  children: Map<string, TreeNode>;
  noteCount: number;
}

function buildTree(notes: FieldNoteMeta[]): TreeNode {
  const root: TreeNode = {
    segment: '', fullAddress: '', hasNote: false,
    children: new Map(), noteCount: 0,
  };
  for (const note of notes) {
    const parts = note.addressParts || note.address.split('//');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      const addr = parts.slice(0, i + 1).join('//');
      if (!current.children.has(seg)) {
        current.children.set(seg, {
          segment: seg, fullAddress: addr, hasNote: false,
          children: new Map(), noteCount: 0,
        });
      }
      current = current.children.get(seg)!;
      current.noteCount++;
      if (i === parts.length - 1) current.hasNote = true;
    }
  }
  return root;
}

function collectAll(node: TreeNode, results: [string, TreeNode][] = []): [string, TreeNode][] {
  for (const [, child] of node.children) {
    results.push([child.fullAddress, child]);
    collectAll(child, results);
  }
  return results;
}

export const AddressPickerModal: React.FC<Props> = ({
  allNotes, currentAddress, currentName, onConfirm, onCancel,
}) => {
  const currentParts = currentAddress.split('//');
  const currentParentPath = currentParts.slice(0, -1);

  const [path, setPath] = useState<string[]>(currentParentPath);
  const [search, setSearch] = useState('');
  const [noteName, setNoteName] = useState(currentName);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const tree = useMemo(() => buildTree(allNotes), [allNotes]);

  const currentNode = useMemo(() => {
    let node = tree;
    for (const seg of path) {
      const child = node.children.get(seg);
      if (!child) return tree;
      node = child;
    }
    return node;
  }, [tree, path]);

  const displayItems = useMemo((): [string, TreeNode][] => {
    if (search.length >= 1) {
      const lower = search.toLowerCase();
      return collectAll(tree)
        .filter(([addr]) => addr.toLowerCase().includes(lower))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(0, 60);
    }
    return [...currentNode.children.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [currentNode, search, tree]);

  const newAddress = path.length > 0
    ? [...path, noteName.trim()].join('//')
    : noteName.trim();

  const isChanged = newAddress !== currentAddress || noteName !== currentName;
  const isValid = noteName.trim().length > 0;

  const handleDrillDown = useCallback((node: TreeNode) => {
    setPath(node.fullAddress.split('//'));
    setSearch('');
    searchRef.current?.focus();
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="flex flex-col rounded-lg border overflow-hidden"
        style={{
          width: 520, maxHeight: '80vh',
          backgroundColor: 'var(--bg-primary, #0a0a0a)',
          borderColor: 'var(--editor-border, rgba(255,255,255,0.08))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--editor-border)' }}>
          <span className="text-sm text-violet-400 font-medium">Move note</span>
          <button onClick={onCancel} className="text-th-muted hover:text-th-secondary text-[10px]">ESC</button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--editor-border)' }}>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search addresses..."
            className="w-full bg-transparent text-sm text-th-body outline-none placeholder:text-th-muted/50"
          />
        </div>

        {/* Breadcrumb — current parent path */}
        <div
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] border-b flex-wrap"
          style={{ borderColor: 'var(--editor-border)', backgroundColor: 'var(--hub-sidebar-bg, #1a1a1a)' }}
        >
          <span className="text-th-muted/40 text-[10px] mr-1">Parent:</span>
          <button
            onClick={() => { setPath([]); setSearch(''); }}
            className={`hover:text-violet-400 transition-colors ${path.length === 0 ? 'text-violet-400 font-medium' : 'text-th-muted'}`}
          >
            ROOT
          </button>
          {path.map((seg, i) => (
            <React.Fragment key={i}>
              <span className="text-th-muted/30">//</span>
              <button
                onClick={() => { setPath(path.slice(0, i + 1)); setSearch(''); }}
                className={`hover:text-violet-400 transition-colors ${i === path.length - 1 ? 'text-violet-400 font-medium' : 'text-th-muted'}`}
              >
                {seg}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Tree list */}
        <div className="flex-1 overflow-y-auto thin-scrollbar" style={{ maxHeight: 300 }}>
          {path.length > 0 && !search && (
            <button
              onClick={() => { setPath(path.slice(0, -1)); setSearch(''); }}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-left hover:bg-violet-400/5 transition-colors text-th-muted text-[12px]"
            >
              <span className="text-violet-400/40">&#9666;</span>
              <span>..</span>
            </button>
          )}
          {displayItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-th-muted text-xs">
              {search ? 'No matches' : 'No children here'}
            </div>
          ) : (
            displayItems.map(([label, node]) => {
              const isSelf = node.fullAddress === currentAddress;
              return (
                <button
                  key={node.fullAddress}
                  onClick={() => handleDrillDown(node)}
                  disabled={isSelf}
                  className={`w-full flex items-center gap-2 px-4 py-1.5 text-left transition-colors group ${
                    isSelf ? 'opacity-30 cursor-default' : 'hover:bg-violet-400/5'
                  }`}
                >
                  <span className="text-violet-400/40 text-[10px] w-3 text-center">
                    {node.children.size > 0 ? '\u25B8' : '\u00B7'}
                  </span>
                  <span className={`text-[13px] truncate transition-colors ${
                    search ? 'text-th-muted' : 'text-th-body group-hover:text-violet-400'
                  }`}>
                    {search ? label.replace(/\/\//g, ' / ') : node.segment}
                  </span>
                  {node.noteCount > 0 && (
                    <span className="text-[10px] text-th-muted/50 ml-auto tabular-nums">{node.noteCount}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Bottom: name input + result preview + confirm */}
        <div className="border-t px-4 py-3 space-y-2" style={{ borderColor: 'var(--editor-border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-th-muted shrink-0">Name:</span>
            <input
              type="text"
              value={noteName}
              onChange={e => setNoteName(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-th-body outline-none border-b border-violet-400/30 focus:border-violet-400 px-1 py-0.5 transition-colors"
              onKeyDown={e => {
                if (e.key === 'Enter' && isChanged && isValid) onConfirm(newAddress, noteName.trim());
              }}
            />
          </div>
          <div className="text-[11px]">
            <span className="text-th-muted/60">Result: </span>
            <span className="text-violet-400 font-mono">{newAddress || '...'}</span>
          </div>
          {currentAddress !== newAddress && (
            <div className="text-[10px] text-th-muted/50">
              From: <span className="line-through">{currentAddress}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onCancel}
              className="text-[11px] px-3 py-1 text-th-muted hover:text-th-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(newAddress, noteName.trim())}
              disabled={!isChanged || !isValid}
              className={`text-[11px] px-3 py-1 border rounded transition-colors ${
                isChanged && isValid
                  ? 'border-violet-400/50 text-violet-400 hover:bg-violet-400/10'
                  : 'border-transparent text-th-muted/40 cursor-default'
              }`}
            >
              Move
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
