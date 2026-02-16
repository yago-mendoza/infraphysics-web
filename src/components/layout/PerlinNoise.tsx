// Perlin noise background — organic blue/purple blobs behind hero, fading to black

import React, { useRef, useEffect } from 'react';

interface PerlinNoiseProps {
  sidebarWidth: number;
  visible?: boolean;
}

// 2D simplex noise (compact implementation)
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const grad3 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

function buildPerm(): number[] {
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p];
}

const perm = buildPerm();

function simplex2(x: number, y: number): number {
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  const ii = i & 255;
  const jj = j & 255;

  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) {
    t0 *= t0;
    const gi = perm[ii + perm[jj]] % 8;
    n0 = t0 * t0 * (grad3[gi][0] * x0 + grad3[gi][1] * y0);
  }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) {
    t1 *= t1;
    const gi = perm[ii + i1 + perm[jj + j1]] % 8;
    n1 = t1 * t1 * (grad3[gi][0] * x1 + grad3[gi][1] * y1);
  }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) {
    t2 *= t2;
    const gi = perm[ii + 1 + perm[jj + 1]] % 8;
    n2 = t2 * t2 * (grad3[gi][0] * x2 + grad3[gi][1] * y2);
  }
  return 70 * (n0 + n1 + n2); // range ~ [-1, 1]
}

function fbm(x: number, y: number, octaves: number): number {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += amp * simplex2(x * freq, y * freq);
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

const RES = 256; // render at low res, CSS scales up for blur

export const PerlinNoise: React.FC<PerlinNoiseProps> = ({ sidebarWidth, visible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = RES;
    canvas.height = RES;

    const imageData = ctx.createImageData(RES, RES);
    const data = imageData.data;
    const scale = 3; // noise zoom

    let time = 0;

    function render() {
      time += 0.002;
      for (let y = 0; y < RES; y++) {
        for (let x = 0; x < RES; x++) {
          const nx = x / RES * scale;
          const ny = y / RES * scale;
          const v = fbm(nx + time * 0.3, ny + time * 0.2, 4);
          // Map noise to 0-1
          const n = (v + 1) * 0.5;
          // Two-tone blend: deep blue (#2244aa) → purple (#7744cc)
          const t = n;
          const r = Math.floor(0x22 + t * (0x77 - 0x22));
          const g = Math.floor(0x44 + t * (0x44 - 0x44));
          const b = Math.floor(0xaa + t * (0xcc - 0xaa));
          // Intensity — darken edges, brighten center blobs
          const intensity = Math.pow(n, 1.2) * 0.7;
          const idx = (y * RES + x) * 4;
          data[idx] = r * intensity;
          data[idx + 1] = g * intensity;
          data[idx + 2] = b * intensity;
          data[idx + 3] = 255;
        }
      }
      ctx!.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 bottom-0 right-0 pointer-events-none z-0"
      style={{
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        height: '100vh',
        imageRendering: 'auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.95s ease',
        maskImage: 'linear-gradient(to bottom, white 30%, transparent 80%)',
        WebkitMaskImage: 'linear-gradient(to bottom, white 30%, transparent 80%)',
      }}
    />
  );
};
