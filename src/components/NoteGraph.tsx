// Interactive knowledge graph visualization for Second Brain
// Displays notes as nodes and their connections based on shared concepts

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Post } from '../types';

interface GraphNode {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  keywords: string[];
  isActive: boolean;
  isRelated: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  sharedConcepts: string[];
}

interface NoteGraphProps {
  notes: Post[];
  activeNoteId?: string;
  connections: Map<string, { targetId: string; strength: number; sharedConcepts: string[] }[]>;
  onNodeClick: (noteId: string) => void;
  extractKeywords: (content: string) => string[];
}

export const NoteGraph: React.FC<NoteGraphProps> = ({
  notes,
  activeNoteId,
  connections,
  onNodeClick,
  extractKeywords,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const animationRef = useRef<number>();

  // Initialize nodes and edges from notes and connections
  useEffect(() => {
    if (notes.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create nodes with initial positions in a circle
    const angleStep = (2 * Math.PI) / notes.length;
    const radius = Math.min(width, height) * 0.35;

    const newNodes: GraphNode[] = notes.map((note, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const keywords = extractKeywords(note.content);
      const isActive = note.id === activeNoteId;
      const noteConnections = connections.get(note.id) || [];
      const isRelated = noteConnections.some(c => c.targetId === activeNoteId) ||
        (connections.get(activeNoteId || '') || []).some(c => c.targetId === note.id);

      return {
        id: note.id,
        title: note.displayTitle || note.title,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        keywords,
        isActive,
        isRelated: isRelated && !isActive,
      };
    });

    // Create edges from connections
    const newEdges: GraphEdge[] = [];
    const addedPairs = new Set<string>();

    connections.forEach((noteConnections, sourceId) => {
      noteConnections.forEach(conn => {
        const pairKey = [sourceId, conn.targetId].sort().join('-');
        if (!addedPairs.has(pairKey)) {
          addedPairs.add(pairKey);
          newEdges.push({
            source: sourceId,
            target: conn.targetId,
            strength: conn.strength,
            sharedConcepts: conn.sharedConcepts,
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [notes, activeNoteId, connections, dimensions, extractKeywords]);

  // Simple force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    let localNodes = [...nodes];
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const simulate = () => {
      // Apply forces
      localNodes = localNodes.map(node => {
        let fx = 0;
        let fy = 0;

        // Center gravity
        fx += (centerX - node.x) * 0.01;
        fy += (centerY - node.y) * 0.01;

        // Repulsion from other nodes
        localNodes.forEach(other => {
          if (other.id === node.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = 80;
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 2;
            fx += dx * force;
            fy += dy * force;
          }
        });

        // Attraction along edges
        edges.forEach(edge => {
          if (edge.source !== node.id && edge.target !== node.id) return;
          const otherId = edge.source === node.id ? edge.target : edge.source;
          const other = localNodes.find(n => n.id === otherId);
          if (!other) return;

          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 120;
          const force = (dist - idealDist) * 0.02 * edge.strength;
          fx += dx / dist * force;
          fy += dy / dist * force;
        });

        // Update velocity with damping
        const vx = (node.vx + fx) * 0.8;
        const vy = (node.vy + fy) * 0.8;

        // Update position with bounds
        const padding = 40;
        const x = Math.max(padding, Math.min(dimensions.width - padding, node.x + vx));
        const y = Math.max(padding, Math.min(dimensions.height - padding, node.y + vy));

        return { ...node, x, y, vx, vy };
      });

      setNodes(localNodes);

      // Continue animation if there's movement
      const totalVelocity = localNodes.reduce((sum, n) => sum + Math.abs(n.vx) + Math.abs(n.vy), 0);
      if (totalVelocity > 0.5) {
        animationRef.current = requestAnimationFrame(simulate);
      }
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [edges, dimensions.width, dimensions.height]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 500 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeColor = useCallback((node: GraphNode) => {
    if (node.isActive) return '#3b82f6'; // blue-500
    if (node.isRelated) return '#8b5cf6'; // violet-500
    if (hoveredNode === node.id) return '#6b7280'; // gray-500
    return '#d1d5db'; // gray-300
  }, [hoveredNode]);

  const getEdgeOpacity = useCallback((edge: GraphEdge) => {
    if (!activeNoteId) return 0.2;
    if (edge.source === activeNoteId || edge.target === activeNoteId) return 0.8;
    if (hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode)) return 0.6;
    return 0.1;
  }, [activeNoteId, hoveredNode]);

  const getEdgeColor = useCallback((edge: GraphEdge) => {
    if (edge.source === activeNoteId || edge.target === activeNoteId) return '#3b82f6';
    return '#9ca3af';
  }, [activeNoteId]);

  return (
    <div className="w-full h-full relative bg-gray-50 rounded-sm overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      >
        {/* Edges */}
        <g className="edges">
          {edges.map((edge, i) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <line
                key={`edge-${i}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={getEdgeColor(edge)}
                strokeWidth={Math.max(1, edge.strength * 0.5)}
                opacity={getEdgeOpacity(edge)}
                className="transition-opacity duration-200"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {nodes.map(node => {
            const radius = node.isActive ? 12 : node.isRelated ? 9 : 7;
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => onNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={getNodeColor(node)}
                  className="transition-all duration-200"
                  stroke={node.isActive ? '#1d4ed8' : 'transparent'}
                  strokeWidth={2}
                />
                {/* Glow effect for active node */}
                {node.isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 4}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    opacity={0.3}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Labels */}
        <g className="labels pointer-events-none">
          {nodes.map(node => {
            const showLabel = node.isActive || node.isRelated || hoveredNode === node.id;
            if (!showLabel) return null;

            return (
              <g key={`label-${node.id}`}>
                <rect
                  x={node.x - 50}
                  y={node.y + 16}
                  width={100}
                  height={18}
                  fill="white"
                  opacity={0.9}
                  rx={2}
                />
                <text
                  x={node.x}
                  y={node.y + 28}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-gray-700"
                >
                  {node.title.length > 15 ? node.title.slice(0, 15) + '...' : node.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 text-[10px] font-mono text-gray-500 bg-white/80 px-2 py-1 rounded">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
          <span>Related</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span>Other</span>
        </div>
      </div>

      {/* Hover info */}
      {hoveredNode && (
        <div className="absolute top-3 right-3 bg-white border border-gray-200 rounded-sm p-2 text-xs font-mono max-w-[200px]">
          <div className="font-medium text-gray-800 mb-1">
            {nodes.find(n => n.id === hoveredNode)?.title}
          </div>
          <div className="text-gray-500 text-[10px]">
            {nodes.find(n => n.id === hoveredNode)?.keywords.slice(0, 3).map(k => `#${k}`).join(' ')}
          </div>
        </div>
      )}
    </div>
  );
};
