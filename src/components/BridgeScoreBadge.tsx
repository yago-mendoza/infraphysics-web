import React from 'react';

interface Props {
  percentile: number; // 0–100, higher = more central
}

const BAR_WIDTH = 48;
const BAR_HEIGHT = 6;
const TRI_SIZE = 4;

const BAR_FILL = 'rgba(167,139,250,0.45)';
const TRI_FILL = 'rgba(167,139,250,0.7)';

export const BridgeScoreBadge: React.FC<Props> = ({ percentile }) => {
  const isTop = percentile >= 50;
  const pctLabel = isTop ? Math.max(1, 100 - percentile) : Math.max(1, percentile);
  const prefix = isTop ? 'top' : 'bottom';

  const segX = isTop ? (percentile / 100) * BAR_WIDTH : 0;
  const segW = isTop ? BAR_WIDTH - (percentile / 100) * BAR_WIDTH : (percentile / 100) * BAR_WIDTH;
  const triX = (percentile / 100) * BAR_WIDTH;

  return (
    <span className="inline-flex items-center ml-2.5 gap-1.5" style={{ verticalAlign: 'middle' }}>
      <span className="w-2 h-2 rounded-full inline-block bg-violet-400/30" />
      <span className="text-[10px] tabular-nums text-violet-400/60">
        {prefix} {pctLabel}%
      </span>
      <svg
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
        className="self-center"
        style={{ overflow: 'visible' }}
      >
        <rect x={0} y={0} width={BAR_WIDTH} height={BAR_HEIGHT} rx={1} fill="rgba(255,255,255,0.15)" />
        <rect x={segX} y={0} width={segW} height={BAR_HEIGHT} rx={1} fill={BAR_FILL} />
        <polygon
          points={`${triX - TRI_SIZE / 2},${-TRI_SIZE - 1} ${triX + TRI_SIZE / 2},${-TRI_SIZE - 1} ${triX},${-1}`}
          fill={TRI_FILL}
        />
      </svg>
    </span>
  );
};
