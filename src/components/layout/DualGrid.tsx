// Background grid pattern component

import React, { useState, useEffect } from 'react';

interface DualGridProps {
  sidebarWidth: number;
}

export const DualGrid: React.FC<DualGridProps> = ({ sidebarWidth }) => {
  const [gridSize, setGridSize] = useState({ largeCellSize: 80, smallCellSize: 8 });

  useEffect(() => {
    const calculateGrid = () => {
      // Available width = viewport width minus sidebar
      const availableWidth = window.innerWidth - sidebarWidth;
      const availableHeight = window.innerHeight;

      // Calculate cell size to fit perfectly in both dimensions
      // Find a cell size that divides both width and height as evenly as possible
      const targetCellSize = 80; // approximate target

      // Calculate how many cells fit in width and height
      const cellsInWidth = Math.round(availableWidth / targetCellSize);
      const cellsInHeight = Math.round(availableHeight / targetCellSize);

      // Use the size that creates a perfect fit for width (primary constraint)
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
      {/* Small grid (fine rhythm - 10x10 inside each large cell) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e8e8e8 1px, transparent 1px),
            linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
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
            linear-gradient(to right, #dcdcdc 1px, transparent 1px),
            linear-gradient(to bottom, #dcdcdc 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize.largeCellSize}px ${gridSize.largeCellSize}px`,
          backgroundPosition: '0 0',
        }}
      />
    </div>
  );
};
