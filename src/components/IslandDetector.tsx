// Island Detector — shows graph topology: connected components, articulation points (bridges), orphans

import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useGraphRelevance, type IslandsData } from '../hooks/useGraphRelevance';
import { useHub } from '../contexts/SecondBrainHubContext';
import { noteLabel } from '../types';
import { ChevronIcon } from './icons';

const MEMBER_CAP = 10;
const SIDE_MEMBER_CAP = 8;

export interface IslandDetectorHandle {
  collapseAll: () => void;
  hasExpanded: boolean;
}

export const IslandDetector = forwardRef<IslandDetectorHandle, {
  focusComponentId?: number | null;
  focusFlash?: boolean;
  onFocusHandled?: () => void;
  activeIslandScope?: number | null;
  onIslandScope?: (id: number) => void;
  onExpandedChange?: (hasExpanded: boolean) => void;
}>(({ focusComponentId, focusFlash = true, onFocusHandled, activeIslandScope, onIslandScope, onExpandedChange }, ref) => {
  const { getIslands, loaded } = useGraphRelevance();
  const hub = useHub();

  // Track which components/bridges/orphans are expanded
  const [expandedComps, setExpandedComps] = useState<Set<number>>(new Set());
  const [expandedBridges, setExpandedBridges] = useState<Set<string>>(new Set());
  const [orphansExpanded, setOrphansExpanded] = useState(false);

  const toggleComp = useCallback((id: number) => {
    setExpandedComps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleBridge = useCallback((uid: string) => {
    setExpandedBridges(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedComps(new Set());
    setExpandedBridges(new Set());
    setOrphansExpanded(false);
  }, []);

  const hasExpanded = expandedComps.size > 0 || expandedBridges.size > 0 || orphansExpanded;

  useImperativeHandle(ref, () => ({
    collapseAll,
    get hasExpanded() { return expandedComps.size > 0 || expandedBridges.size > 0 || orphansExpanded; },
  }), [collapseAll, expandedComps, expandedBridges, orphansExpanded]);

  // Notify parent when expanded state changes
  useEffect(() => {
    onExpandedChange?.(hasExpanded);
  }, [hasExpanded, onExpandedChange]);

  // Focus handling: when focusComponentId is set, expand that component + scroll to it
  const compRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (focusComponentId == null) return;
    // Expand the target component
    setExpandedComps(prev => new Set(prev).add(focusComponentId));
    // Wait for DOM to update, then optionally scroll + flash
    // Scroll + flash only on direct interaction (chip click), not on passive navigation
    requestAnimationFrame(() => {
      if (focusFlash) {
        const el = compRefs.current.get(focusComponentId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el.classList.add('topology-flash');
          setTimeout(() => el.classList.remove('topology-flash'), 1200);
        }
      }
      onFocusHandled?.();
    });
  }, [focusComponentId, focusFlash, onFocusHandled]);

  if (!hub || !loaded) return null;

  const islands = getIslands();
  if (!islands) return null;

  const { noteById, isVisited } = hub;
  const { components, cuts, orphanUids } = islands;

  const significantComponents = components
    .filter(c => c.size > 1)
    .sort((a, b) => b.size - a.size);

  const getName = (uid: string): string => {
    const note = noteById.get(uid);
    return note ? noteLabel(note) : uid.slice(0, 6);
  };

  return (
    <div className="space-y-2">
      {significantComponents.map(comp => {
        const compCuts = cuts
          .filter(c => c.componentId === comp.id)

          .sort((a, b) => b.criticality - a.criticality);
        const isExpanded = expandedComps.has(comp.id);

        // Detect duplicate display names among bridges to disambiguate
        const bridgeNames = compCuts.map(c => getName(c.uid));
        const dupNames = new Set(bridgeNames.filter((n, i) => bridgeNames.indexOf(n) !== i));

        return (
          <div
            key={comp.id}
            ref={(el) => { if (el) compRefs.current.set(comp.id, el); else compRefs.current.delete(comp.id); }}
            id={`topology-component-${comp.id}`}
            className={activeIslandScope === comp.id ? 'bg-violet-400/10' : ''}
          >
            <div className="flex items-center gap-1.5 text-[10px] group">
              <button
                onClick={() => toggleComp(comp.id)}
                className="flex items-center gap-1.5 flex-1 text-left"
              >
                <ChevronIcon isOpen={isExpanded} />
                <span className="text-violet-400">●</span>
                <span className="text-th-muted tabular-nums">#{comp.id}</span>
                <span className="text-th-secondary">
                  {comp.size} notes
                </span>
                {compCuts.length > 0 && (
                  <span className="text-th-muted">
                    · {compCuts.length} {compCuts.length === 1 ? 'bridge' : 'bridges'}
                  </span>
                )}
              </button>
              {onIslandScope && (
                <button
                  onClick={() => onIslandScope(comp.id)}
                  className={`flex-shrink-0 transition-all ${
                    activeIslandScope === comp.id
                      ? 'text-violet-400 opacity-100'
                      : 'hover-reveal text-th-muted hover:text-violet-400'
                  }`}
                  title={activeIslandScope === comp.id ? 'Clear island scope' : 'Scope search to this island'}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="5" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                </button>
              )}
            </div>

            {isExpanded && (
              <div className="ml-3 mt-1 space-y-1">
                <MemberList
                  members={comp.members}
                  cap={MEMBER_CAP}
                  getName={getName}
                  isVisited={isVisited}
                />
                {compCuts.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {compCuts.map(cut => (
                      <BridgeRow
                        key={cut.uid}
                        cut={cut}
                        getName={getName}
                        isVisited={isVisited}
                        expanded={expandedBridges.has(cut.uid)}
                        onToggle={() => toggleBridge(cut.uid)}
                        disambiguate={dupNames.has(getName(cut.uid))}
                        noteById={noteById}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {orphanUids.length > 0 && (
        <div>
          <button
            onClick={() => setOrphansExpanded(!orphansExpanded)}
            className="flex items-center gap-1.5 text-[10px]"
          >
            <ChevronIcon isOpen={orphansExpanded} />
            <span className="text-th-muted">○</span>
            <span className="text-th-muted">{orphanUids.length} orphans</span>
          </button>

          {orphansExpanded && (
            <div className="ml-3 mt-1">
              <MemberList
                members={orphanUids}
                cap={MEMBER_CAP}
                getName={getName}
                isVisited={isVisited}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// --- Bridge Row ---
const BridgeRow: React.FC<{
  cut: IslandsData['cuts'][number];
  getName: (uid: string) => string;
  isVisited: (uid: string) => boolean;
  expanded: boolean;
  onToggle: () => void;
  disambiguate?: boolean;
  noteById?: Map<string, { address: string }>;
}> = ({ cut, getName, isVisited, expanded, onToggle, disambiguate, noteById }) => {
  // When duplicate names exist, show parent path prefix
  const label = getName(cut.uid);
  const parentHint = disambiguate && noteById ? (() => {
    const note = noteById.get(cut.uid);
    if (!note) return null;
    const parts = note.address.split('//');
    return parts.length > 1 ? parts.slice(0, -1).join(' / ') : null;
  })() : null;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px]">
        <button onClick={onToggle} className="flex-shrink-0">
          <ChevronIcon isOpen={expanded} />
        </button>
        <span className="text-amber-400/70">⚡</span>
        <Link
          to={`/lab/second-brain/${cut.uid}`}
          className="text-th-secondary hover:text-violet-400 transition-colors truncate"
        >
          {label}
        </Link>
        {parentHint && (
          <span className="text-[9px] text-th-muted truncate">({parentHint})</span>
        )}
        <span className="text-th-muted tabular-nums ml-auto flex-shrink-0">
          {cut.sides.map(s => s.size).join(' | ')}
        </span>
      </div>

      {expanded && (
        <div className="ml-5 mt-1 space-y-1.5">
          {cut.sides.map((side, i) => (
            <div key={i}>
              <div className="text-[9px] text-th-muted mb-0.5">
                Side {String.fromCharCode(65 + i)} ({side.size}):
              </div>
              <MemberList
                members={side.members}
                cap={SIDE_MEMBER_CAP}
                getName={getName}
                isVisited={isVisited}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Shared Member List ---
const MemberList: React.FC<{
  members: string[];
  cap: number;
  getName: (uid: string) => string;
  isVisited: (uid: string) => boolean;
}> = ({ members, cap, getName, isVisited }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? members : members.slice(0, cap);
  const remaining = members.length - cap;

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      {shown.map(uid => {
        const v = isVisited(uid);
        return (
          <Link
            key={uid}
            to={`/lab/second-brain/${uid}`}
            className={`text-[10px] transition-colors hover:text-violet-400 ${
              v ? 'text-blue-400/70' : 'text-violet-400/70'
            }`}
          >
            {getName(uid)}
          </Link>
        );
      })}
      {remaining > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[9px] text-th-muted hover:text-violet-400 transition-colors"
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
};
