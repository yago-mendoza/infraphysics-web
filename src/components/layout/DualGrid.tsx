// Background grid pattern component (dark variant)

import React, { useState, useEffect } from 'react';

interface DualGridProps {
  sidebarWidth: number;
}

export const DualGrid: React.FC<DualGridProps> = ({ sidebarWidth }) => {
  const [gridSize, setGridSize] = useState({ largeCellSize: 80, smallCellSize: 8 });

  useEffect(() => {
    const calculateGrid = () => {
      const availableWidth = window.innerWidth - sidebarWidth;
      const targetCellSize = 80;
      const cellsInWidth = Math.round(availableWidth / targetCellSize);
      const largeCellSize = availableWidth / cellsInWidth;
      const smallCellSize = largeCellSize / 10;
      setGridSize({ largeCellSize, smallCellSize });
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
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.smallCellSize}px ${gridSize.smallCellSize}px`,
          backgroundPosition: '0 0',
        }}
      />
      {/* Large grid (main rhythm) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.largeCellSize}px ${gridSize.largeCellSize}px`,
          backgroundPosition: '0 0',
        }}
      />
    </div>
  );
};
