// Island Detector — shows graph topology: connected components, articulation points (bridges), orphans

import React from 'react';
import { Link } from 'react-router-dom';
import { useGraphRelevance, type IslandsData } from '../hooks/useGraphRelevance';
import { useHub } from '../contexts/SecondBrainHubContext';
import { noteLabel } from '../types';

export const IslandDetector: React.FC = () => {
  const { getIslands, loaded } = useGraphRelevance();
  const hub = useHub();
  if (!hub || !loaded) return null;

  const islands = getIslands();
  if (!islands) return null;

  const { noteById } = hub;
  const { components, cuts, orphanUids } = islands;

  // Only show components with size > 1, sorted by size desc
  const significantComponents = components
    .filter(c => c.size > 1)
    .sort((a, b) => b.size - a.size);

  const totalBridges = cuts.length;

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

        return (
          <div key={comp.id}>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-violet-400">●</span>
              <span className="text-th-secondary">
                {comp.size} notes
              </span>
              {compCuts.length > 0 && (
                <span className="text-th-muted">
                  · {compCuts.length} {compCuts.length === 1 ? 'bridge' : 'bridges'}
                </span>
              )}
            </div>

            {compCuts.length > 0 && (
              <div className="ml-3 mt-1 space-y-0.5">
                {compCuts.map(cut => (
                  <div key={cut.uid} className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-amber-400/70">⚡</span>
                    <Link
                      to={`/lab/second-brain/${cut.uid}`}
                      className="text-th-secondary hover:text-violet-400 transition-colors truncate"
                    >
                      {getName(cut.uid)}
                    </Link>
                    <span className="text-th-muted tabular-nums ml-auto flex-shrink-0">
                      {cut.sides.join(' | ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {orphanUids.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-th-muted">○</span>
          <span className="text-th-muted">{orphanUids.length} orphans</span>
        </div>
      )}
    </div>
  );
};
