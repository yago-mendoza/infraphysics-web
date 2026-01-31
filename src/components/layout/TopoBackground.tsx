// Topographic contour-line background — static canvas generated with Perlin noise

import React, { useRef, useEffect } from 'react';

interface TopoBackgroundProps {
  sidebarWidth: number;
  visible?: boolean;
}

// --- Perlin noise implementation ---

const PERM = (() => {
  const p = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
    140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
    247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
    57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
    74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
    60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
    65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
    200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
    52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
    207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
    119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
    129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
    218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
    81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
    184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
    222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
  ];
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
})();

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v,
  );
}

// Fractal Brownian Motion for richer terrain
function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    value += perlin(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / max;
}

// --- Marching squares contour extraction ---

function drawContours(
  ctx: CanvasRenderingContext2D,
  field: Float64Array,
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  threshold: number,
) {
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const tl = field[j * cols + i] >= threshold ? 1 : 0;
      const tr = field[j * cols + i + 1] >= threshold ? 1 : 0;
      const br = field[(j + 1) * cols + i + 1] >= threshold ? 1 : 0;
      const bl = field[(j + 1) * cols + i] >= threshold ? 1 : 0;
      const code = (tl << 3) | (tr << 2) | (br << 1) | bl;

      if (code === 0 || code === 15) continue;

      const x = i * cellW;
      const y = j * cellH;

      // Interpolation helpers
      const vTL = field[j * cols + i];
      const vTR = field[j * cols + i + 1];
      const vBR = field[(j + 1) * cols + i + 1];
      const vBL = field[(j + 1) * cols + i];

      const interpTop = (threshold - vTL) / (vTR - vTL);
      const interpBottom = (threshold - vBL) / (vBR - vBL);
      const interpLeft = (threshold - vTL) / (vBL - vTL);
      const interpRight = (threshold - vTR) / (vBR - vTR);

      const top = { x: x + interpTop * cellW, y };
      const bottom = { x: x + interpBottom * cellW, y: y + cellH };
      const left = { x, y: y + interpLeft * cellH };
      const right = { x: x + cellW, y: y + interpRight * cellH };

      const segments: [{ x: number; y: number }, { x: number; y: number }][] = [];

      switch (code) {
        case 1: case 14: segments.push([left, bottom]); break;
        case 2: case 13: segments.push([bottom, right]); break;
        case 3: case 12: segments.push([left, right]); break;
        case 4: case 11: segments.push([top, right]); break;
        case 5: segments.push([top, left], [bottom, right]); break;
        case 6: case 9: segments.push([top, bottom]); break;
        case 7: case 8: segments.push([top, left]); break;
        case 10: segments.push([top, right], [left, bottom]); break;
      }

      for (const [a, b] of segments) {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
    }
  }
}

// --- Component ---

export const TopoBackground: React.FC<TopoBackgroundProps> = ({ sidebarWidth, visible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.width = window.innerWidth - sidebarWidth;
    const H = canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Random offset so the pattern is unique on every reload
    const offsetX = Math.random() * 1000;
    const offsetY = Math.random() * 1000;

    // Noise field sampling
    const cellSize = 6;
    const cols = Math.ceil(W / cellSize) + 1;
    const rows = Math.ceil(H / cellSize) + 1;
    const scale = 0.004;
    const octaves = 4;

    const field = new Float64Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        field[j * cols + i] = fbm(offsetX + i * cellSize * scale, offsetY + j * cellSize * scale, octaves);
      }
    }

    // Draw contour lines
    const levels = 80;
    ctx.clearRect(0, 0, W, H);

    for (let l = 1; l < levels; l++) {
      const t = -1 + (2 / levels) * l;
      const opacity = 0.05 + 0.01 * Math.sin((l / levels) * Math.PI);

      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity.toFixed(3)})`;
      ctx.lineWidth = 0.7;
      drawContours(ctx, field, cols, rows, cellSize, cellSize, t);
      ctx.stroke();
    }
  }, [sidebarWidth]);

  return (
    <div
      className="fixed top-0 bottom-0 right-0 pointer-events-none z-0"
      style={{
        left: sidebarWidth,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.95s ease',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};
