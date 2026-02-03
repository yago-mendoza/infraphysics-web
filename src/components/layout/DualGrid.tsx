// Background grid pattern component — theme-aware via CSS custom properties

import React, { useState, useEffect } from 'react';

interface DualGridProps {
  sidebarWidth: number;
}

export const DualGrid: React.FC<DualGridProps> = ({ sidebarWidth }) => {
  const [gridSize, setGridSize] = useState({ largeCellW: 80, smallCellW: 8, largeCellH: 80, smallCellH: 8 });

  useEffect(() => {
    const calculateGrid = () => {
      const targetCellSize = 80;

      const availableWidth = window.innerWidth - sidebarWidth;
      const cellsInWidth = Math.round(availableWidth / targetCellSize);
      const largeCellW = availableWidth / cellsInWidth;
      const smallCellW = largeCellW / 10;

      const availableHeight = window.innerHeight;
      const cellsInHeight = Math.round(availableHeight / targetCellSize);
      const largeCellH = availableHeight / cellsInHeight;
      const smallCellH = largeCellH / 10;

      setGridSize({ largeCellW, smallCellW, largeCellH, smallCellH });
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, [sidebarWidth]);

  return (
    <div
      className="fixed top-0 bottom-0 right-0 pointer-events-none z-0"
      style={{ left: sidebarWidth }}
    >
      {/* Small grid (fine rhythm) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-small) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-small) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.smallCellW}px ${gridSize.smallCellH}px`,
          backgroundPosition: '0 0',
        }}
      />
      {/* Large grid (main rhythm) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-large) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-large) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.largeCellW}px ${gridSize.largeCellH}px`,
          backgroundPosition: '0 0',
        }}
      />
    </div>
  );
};
