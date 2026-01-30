// Starfield background component — CSS box-shadow technique

import React, { useMemo } from 'react';

interface StarfieldProps {
  sidebarWidth: number;
}

function generateStars(count: number, maxW: number, maxH: number, opacityMin: number, opacityMax: number): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * maxW);
    const y = Math.floor(Math.random() * maxH);
    const opacity = opacityMin + Math.random() * (opacityMax - opacityMin);
    shadows.push(`${x}px ${y}px rgba(255,255,255,${opacity.toFixed(2)})`);
  }
  return shadows.join(', ');
}

export const Starfield: React.FC<StarfieldProps> = ({ sidebarWidth }) => {
  // Generate stars once — spread across a large canvas so they work with scrolling
  const W = 2560;
  const H = 5000;

  const layer1 = useMemo(() => generateStars(200, W, H, 0.55, 1.0), []);
  const layer2 = useMemo(() => generateStars(250, W, H, 0.35, 0.7), []);
  const layer3 = useMemo(() => generateStars(200, W, H, 0.15, 0.5), []);

  return (
    <div
      className="fixed top-0 bottom-0 right-0 pointer-events-none z-0"
      style={{ left: sidebarWidth, backgroundColor: '#000' }}
    >
      {/* Layer 1: bright stars — 1px */}
      <div
        style={{
          width: 1,
          height: 1,
          background: 'transparent',
          boxShadow: layer1,
        }}
      />
      {/* Layer 2: medium stars — 1px, dimmer */}
      <div
        style={{
          width: 1,
          height: 1,
          background: 'transparent',
          boxShadow: layer2,
        }}
      />
      {/* Layer 3: faint stars — 1px, faintest */}
      <div
        style={{
          width: 1,
          height: 1,
          background: 'transparent',
          boxShadow: layer3,
        }}
      />
    </div>
  );
};
