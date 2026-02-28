import React from 'react';
import { Link } from 'react-router-dom';
import { noteLabel, type FieldNoteMeta } from '../types';
import { secondBrainPath } from '../config/categories';
import type { DriftEntry } from '../hooks/useGraphRelevance';

interface Props {
  entries: DriftEntry[];
  noteById: Map<string, FieldNoteMeta>;
  onNoteClick: (note: FieldNoteMeta) => void;
  isVisited: (id: string) => boolean;
}

export const DriftDetector: React.FC<Props> = ({ entries, noteById, onNoteClick, isVisited }) => {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs text-th-secondary uppercase tracking-wider mb-3">
        Missing links
      </h3>
      <div className="space-y-3">
        {top3.map(({ uid, via }) => {
          const note = noteById.get(uid);
          if (!note) return null;
          const visited = isVisited(uid);
          const viaNames = via
            .map(v => noteById.get(v))
            .filter((n): n is FieldNoteMeta => !!n)
            .map(n => noteLabel(n));

          return (
            <div key={uid}>
              <Link
                to={secondBrainPath(uid)}
                onClick={() => onNoteClick(note)}
                className="wiki-sidelink inline transition-colors no-underline border-b border-solid cursor-pointer"
                style={{ '--wl-color': visited ? 'var(--wiki-link-visited)' : 'var(--cat-fieldnotes-accent)' } as React.CSSProperties}
              >
                <span className="text-sm">{noteLabel(note)}</span>
              </Link>
              {note.address && (
                <span className="text-sm text-th-secondary ml-2">{note.address.replace(/\/\//g, ' / ')}</span>
              )}
              {viaNames.length > 0 && (
                <div className="text-sm text-th-secondary mt-0.5 font-sans">
                  via {viaNames.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
