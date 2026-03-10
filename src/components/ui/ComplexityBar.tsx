// Complexity bar — 5 squares representing 10 levels (2 per square)
// The last filled square is lighter (odd) or full (even) to express half-steps.
// Color follows the category accent.

import React from 'react';
import { catAccentVar, getComplexityLevel } from '../../config/categories';

const TOTAL = 5;

interface ComplexityBarProps {
  value: number | null | undefined;
  category?: string;
}

export const ComplexityBar: React.FC<ComplexityBarProps> = ({ value, category }) => {
  if (value == null) return null;
  const cl = getComplexityLevel(value);
  if (!cl) return null;

  const level = Math.ceil(value / 2);     // 1–5
  const isUpper = value % 2 === 0;        // even = upper end of range
  const accent = category ? catAccentVar(category) : 'var(--cat-threads-accent)';

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex gap-[3px]">
        {Array.from({ length: TOTAL }, (_, i) => {
          const seg = i + 1;
          let opacity: number;
          if (seg < level) {
            opacity = 0.75;
          } else if (seg === level) {
            opacity = isUpper ? 0.75 : 0.38;
          } else {
            opacity = 0.22;
          }
          return (
            <span
              key={i}
              className="inline-block w-[6px] h-[6px] rounded-[1px]"
              style={{ backgroundColor: `color-mix(in srgb, ${accent} ${Math.round(opacity * 100)}%, transparent)` }}
            />
          );
        })}
      </span>
      <span className="text-[10px]" style={{ color: `color-mix(in srgb, ${accent} 70%, transparent)` }}>
        {cl.label}
      </span>
    </span>
  );
};
