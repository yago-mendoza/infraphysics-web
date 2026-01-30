// Rotating subtitle component — cycles through titles with fade transitions

import React, { useState, useEffect, useRef } from 'react';

const titles = [
  'Systems architect',
  'Industrial engineer',
  'Infra tinkerer',
  'Complexity wrangler',
  'Generalist with leverage',
  'ATOMS Engineer',
  'Head of AI',
];

type Phase = 'show' | 'fadeOut' | 'fadeIn';

export const RotatingTitle: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('show');
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      // 1. Fade out (move up + disappear)
      setPhase('fadeOut');

      setTimeout(() => {
        // 2. Swap text, snap to below position (no transition)
        setIndex(prev => (prev + 1) % titles.length);
        setPhase('fadeIn');

        // 3. After browser paints the snapped position, transition in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhase('show');
          });
        });
      }, 400);
    }, 2900);

    return () => clearInterval(timerRef.current);
  }, []);

  const style: React.CSSProperties =
    phase === 'show'
      ? { opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.4s ease, transform 0.4s ease' }
      : phase === 'fadeOut'
        ? { opacity: 0, transform: 'translateY(-8px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }
        : // fadeIn — snap to below, no transition
          { opacity: 0, transform: 'translateY(8px)', transition: 'none' };

  return (
    <span className="inline-block" style={style}>
      {titles[index]}
    </span>
  );
};
