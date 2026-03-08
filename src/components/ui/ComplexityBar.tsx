// Complexity bar — 5 squares representing 10 levels (2 per square)
// The last filled square is lighter (odd) or full (even) to express half-steps.

import React from 'react';
import { getComplexityLevel } from '../../config/categories';

const TOTAL = 5;

export const ComplexityBar: React.FC<{ value: number | null | undefined }> = ({ value }) => {
  if (value == null) return null;
  const cl = getComplexityLevel(value);
  if (!cl) return null;

  const level = Math.ceil(value / 2);     // 1–5
  const isUpper = value % 2 === 0;        // even = upper end of range

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex gap-[3px]">
        {Array.from({ length: TOTAL }, (_, i) => {
          const seg = i + 1;
          let opacity: number;
          if (seg < level) {
            opacity = 0.75;             // fully filled
          } else if (seg === level) {
            opacity = isUpper ? 0.75 : 0.38; // cap: strong or light
          } else {
            opacity = 0.1;              // empty
          }
          return (
            <span
              key={i}
              className="inline-block w-[6px] h-[6px] rounded-[1px]"
              style={{ backgroundColor: `rgba(248, 113, 113, ${opacity})` }}
            />
          );
        })}
      </span>
      <span className="text-[10px]" style={{ color: 'rgba(248, 113, 113, 0.7)' }}>
        {cl.label}
      </span>
    </span>
  );
};
