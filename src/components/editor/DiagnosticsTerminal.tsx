// Terminal-style diagnostics panel below the code editor
// Displays validation messages tagged by source and severity

import React from 'react';
import type { Diagnostic } from './useFieldnoteEditor';

const SEVERITY_COLORS: Record<string, string> = {
  ERROR: 'text-red-400',
  WARN: 'text-violet-300',
  INFO: 'text-blue-400',
};

const SOURCE_COLORS: Record<string, string> = {
  PARSE: 'text-violet-400',
  VALIDATE: 'text-cyan-400',
  SAVE: 'text-green-400',
  BUILD: 'text-orange-400',
  SUGGEST: 'text-yellow-400',
};

export const DiagnosticsTerminal: React.FC<{
  diagnostics: Diagnostic[];
  saveStatus: string;
}> = ({ diagnostics, saveStatus }) => {
  // Separate suggestions from regular diagnostics
  const regularDiags = diagnostics.filter(d => d.source !== 'SUGGEST');
  const suggestions = diagnostics.filter(d => d.source === 'SUGGEST');

  return (
    <div
      className="font-mono text-[11px] leading-relaxed"
    >
      {/* Regular diagnostics */}
      {regularDiags.length === 0 && suggestions.length === 0 && saveStatus === 'idle' && (
        <div className="text-th-muted px-3 py-1">No diagnostics</div>
      )}

      {saveStatus === 'saving' && (
        <div className="text-violet-300 px-3 py-0.5">[SAVE] saving...</div>
      )}
      {saveStatus === 'saved' && (
        <div className="text-green-400 px-3 py-0.5">[SAVE] saved and rebuilt</div>
      )}
      {saveStatus === 'error' && (
        <div className="text-red-400 px-3 py-0.5">[SAVE] save failed</div>
      )}

      {regularDiags.map((d, i) => (
        <div key={`d-${i}`} className="flex items-center gap-2 px-3 py-0.5">
          <span className={SOURCE_COLORS[d.source] || 'text-th-muted'}>
            [{d.source}]
          </span>
          <span className={`${SEVERITY_COLORS[d.severity] || 'text-th-secondary'} flex-1`}>
            {d.message}
          </span>
          {d.actions?.map((action, j) => (
            <button
              key={j}
              onClick={action.onAction}
              className="px-2 py-0 text-[10px] border rounded transition-colors flex-shrink-0 border-violet-400/30 text-violet-300 hover:bg-violet-400/15 hover:text-violet-200"
            >
              {action.label}
            </button>
          ))}
        </div>
      ))}

      {/* Suggestions — visually separated band */}
      {suggestions.length > 0 && (
        <div
          className="mt-0.5"
          style={{
            borderTop: '1px solid rgba(234, 179, 8, 0.15)',
            background: 'rgba(234, 179, 8, 0.04)',
          }}
        >
          {suggestions.map((d, i) => (
            <div
              key={`s-${i}`}
              className="flex items-center gap-2 px-3"
              style={{
                padding: '3px 0.75rem',
                borderBottom: i < suggestions.length - 1
                  ? '1px solid rgba(234, 179, 8, 0.08)'
                  : 'none',
              }}
            >
              <span className="text-yellow-500/70 flex-shrink-0 px-1">//</span>
              <span className="text-yellow-300/80 flex-1 truncate">
                {d.message}
              </span>
              {d.actions?.map((action, j) => (
                <button
                  key={j}
                  onClick={action.onAction}
                  className={`px-2 py-0 text-[10px] border rounded transition-colors flex-shrink-0 ${
                    action.style === 'accept'
                      ? 'border-violet-400/30 text-violet-300 hover:bg-violet-400/15 hover:text-violet-200'
                      : 'border-violet-900/30 text-violet-400/40 hover:bg-violet-400/10 hover:text-violet-300/60'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
