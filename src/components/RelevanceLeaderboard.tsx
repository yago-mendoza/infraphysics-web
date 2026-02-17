import React from 'react';
import { Link } from 'react-router-dom';
import { noteLabel, type FieldNoteMeta } from '../types';

interface RelevanceEntry {
  uid: string;
  score: number;
}

export interface FamilyItem {
  note: FieldNoteMeta;
  zone: 'parent' | 'siblings' | 'children';
}

interface BaseProps {
  noteById: Map<string, FieldNoteMeta>;
  onNoteClick: (note: FieldNoteMeta) => void;
  isVisited: (id: string) => boolean;
  getPercentile: (uid: string) => number;
}

interface AllModeProps extends BaseProps {
  mode: 'all';
  entries: RelevanceEntry[];
}

interface FamilyModeProps extends BaseProps {
  mode: 'family';
  familyItems: FamilyItem[];
}

type Props = AllModeProps | FamilyModeProps;

const MAX_ROWS = 20;

const CENT_BAR_W = 32;
const CENT_BAR_H = 5;
const TRI_SIZE = 3;
const BAR_FILL = 'rgba(167,139,250,0.45)';
const TRI_FILL = 'rgba(167,139,250,0.7)';

const ZONE_LABELS: Record<FamilyItem['zone'], string> = { parent: 'P', siblings: 'S', children: 'C' };

// Fixed-width elements per row (px): zone label + centrality bar + % label + margins
const FAMILY_FIXED_PX = 94;
const ALL_FIXED_PX = 122;
const AVG_CHAR_PX = 7; // conservative avg char width at text-[11px]

function CentralityIndicator({ percentile }: { percentile: number }) {
  const isTop = percentile >= 50;
  const pctLabel = isTop ? Math.max(1, 100 - percentile) : Math.max(1, percentile);
  const segX = isTop ? (percentile / 100) * CENT_BAR_W : 0;
  const segW = isTop ? CENT_BAR_W - (percentile / 100) * CENT_BAR_W : (percentile / 100) * CENT_BAR_W;
  const triX = (percentile / 100) * CENT_BAR_W;

  return (
    <>
      <svg
        width={CENT_BAR_W}
        height={CENT_BAR_H}
        viewBox={`0 0 ${CENT_BAR_W} ${CENT_BAR_H}`}
        className="relative z-10 flex-shrink-0 self-center ml-1"
        style={{ overflow: 'visible', marginTop: 1 }}
      >
        <rect x={0} y={0} width={CENT_BAR_W} height={CENT_BAR_H} rx={1} fill="rgba(255,255,255,0.15)" />
        <rect x={segX} y={0} width={segW} height={CENT_BAR_H} rx={1} fill={BAR_FILL} />
        <polygon
          points={`${triX - TRI_SIZE / 2},${-TRI_SIZE - 1} ${triX + TRI_SIZE / 2},${-TRI_SIZE - 1} ${triX},${-1}`}
          fill={TRI_FILL}
        />
      </svg>
      <span className="relative z-10 text-[10px] text-th-muted tabular-nums flex-shrink-0 w-7 text-right pr-2 ml-1">
        {pctLabel}%
      </span>
    </>
  );
}

/** Drop segments from the left until it fits; truncate the name only as last resort. */
function smartAddr(parts: string[], budget: number): string {
  const full = parts.join(' / ');
  if (full.length <= budget) return full;

  for (let drop = 1; drop < parts.length; drop++) {
    const tail = '\u2026 / ' + parts.slice(drop).join(' / ');
    if (tail.length <= budget) return tail;
  }

  const name = parts[parts.length - 1];
  if (name.length <= budget) return name;
  return name.slice(0, budget - 1) + '\u2026';
}

function useCharBudget(fixedPx: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [budget, setBudget] = React.useState(28);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setBudget(Math.max(10, Math.floor((w - fixedPx) / AVG_CHAR_PX)));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [fixedPx]);

  return { ref, budget };
}

export const RelevanceLeaderboard: React.FC<Props> = (props) => {
  const { noteById, onNoteClick, isVisited, getPercentile } = props;
  const isFamily = props.mode === 'family';
  const { ref, budget } = useCharBudget(isFamily ? FAMILY_FIXED_PX : ALL_FIXED_PX);

  if (isFamily) {
    const { familyItems } = props;
    if (familyItems.length === 0) {
      return <div className="text-xs text-th-tertiary py-6 text-center">No family</div>;
    }
    return (
      <div ref={ref} className="space-y-1 overflow-y-auto no-scrollbar max-h-[40vh] lg:max-h-[calc(100dvh-8rem)]">
        {familyItems.map(({ note, zone }) => {
          const visited = isVisited(note.id);
          const parts = note.addressParts || (note.address ? note.address.split('//') : null);
          const display = parts ? smartAddr(parts, budget) : noteLabel(note);
          const percentile = getPercentile(note.id);
          return (
            <Link
              key={note.id}
              to={`/lab/second-brain/${note.id}`}
              onClick={() => onNoteClick(note)}
              className="wiki-siderow group relative flex items-center h-6 rounded-sm no-underline transition-colors hover:bg-white/5 overflow-visible"
              title={note.address || noteLabel(note)}
              style={{ '--wl-color': visited ? 'var(--wiki-link-visited)' : 'var(--cat-fieldnotes-accent)' } as React.CSSProperties}
            >
              <span className="relative z-10 text-[9px] text-th-muted flex-shrink-0 w-3 text-center mr-1.5">{ZONE_LABELS[zone]}</span>
              <span className="wiki-siderow-text relative z-10 text-[11px] overflow-hidden whitespace-nowrap flex-1 min-w-0 transition-colors">
                {display}
              </span>
              <CentralityIndicator percentile={percentile} />
            </Link>
          );
        })}
      </div>
    );
  }

  // "all" mode — relevance entries
  const { entries } = props;
  if (entries.length === 0) {
    return (
      <div className="text-xs text-th-tertiary py-6 text-center">
        No graph data
      </div>
    );
  }

  const visible = entries.slice(0, MAX_ROWS);
  const maxScore = visible[0].score;

  return (
    <div ref={ref} className="space-y-1 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100dvh - 8rem)' }}>
      {visible.map(({ uid, score }) => {
        const note = noteById.get(uid);
        if (!note) return null;
        const visited = isVisited(uid);
        const parts = note.addressParts || (note.address ? note.address.split('//') : null);
        const display = parts ? smartAddr(parts, budget) : noteLabel(note);
        const relevanceWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const scoreLabel = Math.round(score * 100);
        const percentile = getPercentile(uid);

        return (
          <Link
            key={uid}
            to={`/lab/second-brain/${uid}`}
            onClick={() => onNoteClick(note)}
            className="wiki-siderow group relative flex items-center h-6 rounded-sm no-underline transition-colors hover:bg-white/5 overflow-visible"
            title={note.address || noteLabel(note)}
            style={{ '--wl-color': visited ? 'var(--wiki-link-visited)' : 'var(--cat-fieldnotes-accent)' } as React.CSSProperties}
          >
            {/* Relevance bar fill */}
            <div
              className="wiki-siderow-bar absolute inset-y-0 left-0 rounded-sm transition-all"
              style={{ width: `${relevanceWidth}%` }}
            />
            {/* Name */}
            <span className="wiki-siderow-text relative z-10 text-[11px] overflow-hidden whitespace-nowrap px-2 flex-1 min-w-0 transition-colors">
              {display}
            </span>
            {/* Relevance score */}
            <span className="relative z-10 text-[10px] text-th-muted pr-1.5 tabular-nums flex-shrink-0">
              {scoreLabel}
            </span>
            <CentralityIndicator percentile={percentile} />
          </Link>
        );
      })}
    </div>
  );
};
