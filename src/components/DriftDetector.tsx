import React from 'react';
import { Link } from 'react-router-dom';
import { noteLabel, type FieldNoteMeta } from '../types';
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
      <h3 className="text-[11px] text-th-tertiary uppercase tracking-wider mb-3">
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
                to={`/lab/second-brain/${uid}`}
                onClick={() => onNoteClick(note)}
                className={`inline transition-colors no-underline border-b border-solid cursor-pointer ${visited ? 'text-blue-400/70 hover:text-blue-400 border-blue-400/40 hover:border-blue-400' : 'text-violet-400/70 hover:text-violet-400 border-violet-400/40 hover:border-violet-400'}`}
              >
                <span className="text-sm">{noteLabel(note)}</span>
              </Link>
              {viaNames.length > 0 && (
                <div className="text-xs text-th-tertiary mt-0.5 italic font-sans">
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
