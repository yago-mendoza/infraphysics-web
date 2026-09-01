import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type HomeVisualVariant = 1 | 2;

const RED = '155,63,36';
const COLORS = [RED, '29,101,152', '55,118,87'];

const field = (x: number, y: number, t = 0) => {
  const well = -1.7 * Math.exp(-(.72 * x * x + 1.05 * y * y));
  const saddle = .58 * Math.exp(-((x + 1.25) ** 2 * 1.1 + (y - .42) ** 2 * .42));
  const basin = -.42 * Math.exp(-((x - 1.55) ** 2 * 1.8 + (y + 1.05) ** 2 * 1.25));
  return well + saddle + basin + .055 * (x * x + y * y) + .045 * Math.sin(x * 2.1 + t) * Math.cos(y * 1.7 - t * .4);
};

const gradient = (x: number, y: number, t: number) => {
  const h = .018;
  return { x: (field(x + h, y, t) - field(x - h, y, t)) / (2 * h), y: (field(x, y + h, t) - field(x, y - h, t)) / (2 * h) };
};

type Ripple = {
  x: number; y: number; started: number; gain: number; speed: number; polarity: 1 | -1;
};

export const HomeVisualLab: React.FC<{
  variant: HomeVisualVariant;
  showTachograph?: boolean;
  compactClockField?: boolean;
  interactivePointer?: boolean;
  staticMicroField?: boolean;
}> = ({ variant, showTachograph = true, compactClockField = false, interactivePointer = false, staticMicroField = false }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const traceRef = useRef<HTMLCanvasElement>(null);
  const [traceHost, setTraceHost] = useState<HTMLElement | null>(null);

  useEffect(() => setTraceHost(document.querySelector<HTMLElement>('[data-home-tachograph-anchor]')), []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 1, h = 1, dpr = 1, raf = 0, lastFrame = -Infinity, visible = true;
    let interactionBottom = Infinity;
    let cols = 0, rows = 0, dx = 0, dy = 0;
    const COLOR_BUCKETS = 12;
    let xs = new Float32Array(0), ys = new Float32Array(0), buckets = new Uint8Array(0), handShift = new Float32Array(0);
    let hourX = new Float32Array(0), hourY = new Float32Array(0), minuteX = new Float32Array(0), minuteY = new Float32Array(0);
    let edgeA = new Int32Array(0), edgeB = new Int32Array(0);
    const RIPPLE_NUMERIC_LIFE = 8000;
    const MAX_RIPPLES = 20;
    const waves: Array<Ripple | null> = Array(MAX_RIPPLES).fill(null);
    const waveX = new Float32Array(MAX_RIPPLES), waveY = new Float32Array(MAX_RIPPLES), waveFront = new Float32Array(MAX_RIPPLES), waveAmplitude = new Float32Array(MAX_RIPPLES);
    const focusX = new Float32Array(5), focusY = new Float32Array(5);
    const focusVX = new Float32Array(5), focusVY = new Float32Array(5);
    const focusRX = new Float32Array(5), focusRY = new Float32Array(5);
    let focusReady = false, lastFocusTime = 0;
    let pointerX = 0, pointerY = 0, pointerTargetX = 0, pointerTargetY = 0, pointerAt = -Infinity;

    // Recreates the old deterministic, interlocking eight-island topology. This
    // runs only when the canvas changes size; none of it belongs to the frame loop.
    const buildTopology = (nextCols: number, nextRows: number) => {
      const count = nextCols * nextRows, owner = new Int16Array(count).fill(-1);
      const parent = new Int32Array(count).fill(-1), neighbours = new Int32Array(4);
      const a: number[] = [], b: number[] = [], keys = new Set<number>();
      const add = (from: number, to: number) => {
        const key = Math.min(from, to) * count + Math.max(from, to);
        if (!keys.has(key)) { keys.add(key); a.push(from); b.push(to); }
      };
      if (nextRows === 2) {
        for (let x = 0; x < nextCols - 1; x++) { add(x, x + 1); add(nextCols + x, nextCols + x + 1); }
        for (let x = 0; x < nextCols; x += 2) add(x, nextCols + x);
      } else {
        const seeds = [0, nextCols - 1, (nextRows - 1) * nextCols, count - 1,
          Math.floor(nextCols * .28) + nextCols * Math.floor(nextRows * .42),
          Math.floor(nextCols * .72) + nextCols * Math.floor(nextRows * .42),
          Math.floor(nextCols * .4) + nextCols * (nextRows - 2), Math.floor(nextCols * .61) + nextCols];
        seeds.forEach((id, island) => { owner[id] = island; });
        const findNeighbours = (id: number) => {
          let n = 0, x = id % nextCols, y = Math.floor(id / nextCols);
          if (x) neighbours[n++] = id - 1; if (x < nextCols - 1) neighbours[n++] = id + 1;
          if (y) neighbours[n++] = id - nextCols; if (y < nextRows - 1) neighbours[n++] = id + nextCols;
          return n;
        };
        let remaining = count - seeds.length, turn = 0;
        while (remaining > 0 && turn < count * 12) {
          const island = turn % 8; let bestScore = -Infinity, best = -1, from = -1;
          for (let id = 0; id < count; id++) if (owner[id] === island) {
            const n = findNeighbours(id);
            for (let j = 0; j < n; j++) {
              const next = neighbours[j]; if (owner[next] !== -1) continue;
              const noise = ((next * 73 + id * 37 + island * 53) % 997) / 997;
              const reach = Math.abs(next % nextCols - nextCols / 2) + Math.abs(Math.floor(next / nextCols) - nextRows / 2);
              const score = noise * 3 + reach * .035;
              if (score > bestScore) { bestScore = score; best = next; from = id; }
            }
          }
          if (best >= 0) { owner[best] = island; parent[best] = from; remaining--; }
          turn++;
        }
        while (remaining > 0) {
          let progressed = false;
          for (let id = 0; id < count; id++) if (owner[id] === -1) {
            const n = findNeighbours(id);
            for (let j = 0; j < n; j++) if (owner[neighbours[j]] !== -1) {
              owner[id] = owner[neighbours[j]]; parent[id] = neighbours[j]; remaining--; progressed = true; break;
            }
          }
          if (!progressed) break;
        }
        for (let id = 0; id < count; id++) {
          if (parent[id] >= 0) add(id, parent[id]);
          const x = id % nextCols, y = Math.floor(id / nextCols);
          if (x < nextCols - 1) { const other = id + 1; if (owner[other] === owner[id] && (id * 29 + other * 17) % 13 > 8) add(id, other); }
          if (y < nextRows - 1) { const other = id + nextCols; if (owner[other] === owner[id] && (id * 29 + other * 17) % 13 > 8) add(id, other); }
        }
      }
      edgeA = Int32Array.from(a); edgeB = Int32Array.from(b);
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      w = Math.max(1, box.width); h = Math.max(1, box.height);
      const boundary = document.querySelector<HTMLElement>('[data-home-pattern-boundary]');
      const boundaryOffset = Number(canvas.dataset.clickableOffset || 0);
      interactionBottom = boundary ? boundary.getBoundingClientRect().top - box.top + boundaryOffset : h;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      cols = w < 680 ? 20 : 29; rows = compactClockField ? 2 : 11;
      const gridW = w * 1.1, left = (w - gridW) / 2;
      dx = gridW / (cols - 1); dy = compactClockField ? 48 : Math.min(34, h * .53 / (rows - 1));
      const top = compactClockField ? h - (w < 768 ? 12 : 20) - (rows - 1) * dy : h * .012;
      const count = cols * rows;
      xs = new Float32Array(count); ys = new Float32Array(count); buckets = new Uint8Array(count); handShift = new Float32Array(count);
      hourX = new Float32Array(count); hourY = new Float32Array(count); minuteX = new Float32Array(count); minuteY = new Float32Array(count);
      for (let id = 0; id < count; id++) {
        xs[id] = left + (id % cols) * dx; ys[id] = top + Math.floor(id / cols) * dy;
        const minute = (id * 37 + 11) % 60, hour = (id * 7 + 3) % 12;
        const minuteAngle = minute / 60 * Math.PI * 2 - Math.PI / 2;
        const hourAngle = (hour + minute / 60) / 12 * Math.PI * 2 - Math.PI / 2;
        minuteX[id] = Math.cos(minuteAngle); minuteY[id] = Math.sin(minuteAngle);
        hourX[id] = Math.cos(hourAngle); hourY[id] = Math.sin(hourAngle);
      }
      buildTopology(cols, rows);
    };

    const smoothstep = (edge0: number, edge1: number, value: number) => {
      const q = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
      return q * q * (3 - 2 * q);
    };
    const baseRedAt = (x: number, y: number, time: number) => {
      const contribution = (fx: number, fy: number, rx: number, ry: number) => {
        const proximity = Math.max(0, 1 - (x - fx) ** 2 / (rx * rx) - (y - fy) ** 2 / (ry * ry));
        return smoothstep(.08, .82, proximity);
      };
      let remainder = 1;
      for (let i = 0; i < 5; i++) remainder *= 1 - contribution(focusX[i], focusY[i], focusRX[i], focusRY[i]);
      return .07 + (1 - remainder) * .91;
    };
    const emit = (wave: Ripple) => {
      let oldestIndex = 0;
      let oldestStarted = Infinity;
      for (let i = 0; i < waves.length; i++) {
        const existing = waves[i];
        if (!existing || wave.started - existing.started >= RIPPLE_NUMERIC_LIFE) { waves[i] = wave; return; }
        if (existing.started < oldestStarted) { oldestStarted = existing.started; oldestIndex = i; }
      }
      // Keep interaction responsive under extreme clicking while retaining a
      // strict allocation-free cap: only the oldest residual wave is recycled.
      waves[oldestIndex] = wave;
    };

    const press = (event: PointerEvent) => {
      if (variant !== 1) return;
      const box = canvas.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) return;
      if (event.clientY - box.top >= interactionBottom) return;
      const now = performance.now(), x = event.clientX - box.left, y = event.clientY - box.top;
      emit({
        x, y, started: now, gain: .96, speed: .24,
        polarity: baseRedAt(x, y, now) < .48 ? 1 : -1,
      });
    };

    const point = (event: PointerEvent) => {
      if (variant !== 2 || !interactivePointer || reduced || !matchMedia('(pointer:fine)').matches) return;
      const box = canvas.getBoundingClientRect();
      pointerTargetX = event.clientX - box.left; pointerTargetY = event.clientY - box.top;
      if (!Number.isFinite(pointerAt)) { pointerX = pointerTargetX; pointerY = pointerTargetY; }
      pointerAt = performance.now();
    };

    const drawClocks = (time: number) => {
      const rx1 = Math.max(62, w * .13), ry1 = Math.max(48, h * .14);
      const rx2 = Math.max(54, w * .105), ry2 = Math.max(42, h * .11);
      const rx3 = Math.max(48, w * .09), ry3 = Math.max(38, h * .095);
      const rx4 = Math.max(46, w * .085), ry4 = Math.max(36, h * .09);
      const rx5 = Math.max(50, w * .095), ry5 = Math.max(39, h * .1);
      focusRX[0] = rx1; focusRY[0] = ry1; focusRX[1] = rx2; focusRY[1] = ry2;
      focusRX[2] = rx3; focusRY[2] = ry3; focusRX[3] = rx4; focusRY[3] = ry4;
      focusRX[4] = rx5; focusRY[4] = ry5;
      const fieldBottom = Math.min(interactionBottom, h * .62);
      if (!focusReady) {
        const angles = [-.61, 2.18, .83, -2.42, 2.72];
        for (let i = 0; i < 5; i++) {
          focusX[i] = w * (.12 + i * .19);
          focusY[i] = fieldBottom * (.22 + (i * 37 % 61) / 100);
          const speed = 48 + i * 5;
          focusVX[i] = Math.cos(angles[i]) * speed; focusVY[i] = Math.sin(angles[i]) * speed;
        }
        focusReady = true; lastFocusTime = time;
      }
      const dt = Math.min(.1, Math.max(0, (time - lastFocusTime) / 1000));
      lastFocusTime = time;
      if (dt) {
        // Ten pair checks for five particles: a small short-range repulsion is
        // enough to break repeated paths while preserving their inertia.
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 5; j++) {
          const sx = focusX[i] - focusX[j], sy = focusY[i] - focusY[j];
          const distance = Math.hypot(sx, sy) || 1;
          const range = (focusRX[i] + focusRX[j]) * .72;
          if (distance >= range) continue;
          const acceleration = 86 * (1 - distance / range) ** 2 * dt;
          const ax = sx / distance * acceleration, ay = sy / distance * acceleration;
          focusVX[i] += ax; focusVY[i] += ay; focusVX[j] -= ax; focusVY[j] -= ay;
        }
        for (let i = 0; i < 5; i++) {
          const targetSpeed = 48 + i * 5;
          const speed = Math.hypot(focusVX[i], focusVY[i]) || targetSpeed;
          const correction = 1 + (targetSpeed / speed - 1) * .035;
          focusVX[i] *= correction; focusVY[i] *= correction;
          focusX[i] += focusVX[i] * dt; focusY[i] += focusVY[i] * dt;
          // Let centres travel slightly beyond the visible topology so fields
          // enter and leave through its edges instead of revealing a hard box.
          const minX = -w * .05 - focusRX[i] * .12;
          const maxX = w * 1.05 + focusRX[i] * .12;
          const minY = -focusRY[i] * .12;
          const maxY = fieldBottom + focusRY[i] * .12;
          if (focusX[i] < minX) { focusX[i] = minX; focusVX[i] = Math.abs(focusVX[i]); }
          else if (focusX[i] > maxX) { focusX[i] = maxX; focusVX[i] = -Math.abs(focusVX[i]); }
          if (focusY[i] < minY) { focusY[i] = minY; focusVY[i] = Math.abs(focusVY[i]); }
          else if (focusY[i] > maxY) { focusY[i] = maxY; focusVY[i] = -Math.abs(focusVY[i]); }
        }
      }
      const x1 = focusX[0], y1 = focusY[0], x2 = focusX[1], y2 = focusY[1];
      const x3 = focusX[2], y3 = focusY[2], x4 = focusX[3], y4 = focusY[3];
      const x5 = focusX[4], y5 = focusY[4];
      const irx1 = 1 / (rx1 * rx1), iry1 = 1 / (ry1 * ry1);
      const irx2 = 1 / (rx2 * rx2), iry2 = 1 / (ry2 * ry2);
      const irx3 = 1 / (rx3 * rx3), iry3 = 1 / (ry3 * ry3);
      const irx4 = 1 / (rx4 * rx4), iry4 = 1 / (ry4 * ry4);
      const irx5 = 1 / (rx5 * rx5), iry5 = 1 / (ry5 * ry5);
      let activeWaves = 0;
      for (let i = 0; i < waves.length; i++) {
        const wave = waves[i]; if (!wave) continue;
        const age = time - wave.started;
        if (age > RIPPLE_NUMERIC_LIFE) { waves[i] = null; continue; }
        const attack = smoothstep(0, 150, age);
        const x = age / 400;
        const release = (1 + Math.exp(-3.575)) / (1 + Math.exp(.65 * (x - 5.5)));
        waveX[activeWaves] = wave.x; waveY[activeWaves] = wave.y;
        waveFront[activeWaves] = age * wave.speed;
        waveAmplitude[activeWaves] = wave.polarity * attack * release * wave.gain;
        activeWaves++;
      }

      for (let id = 0; id < xs.length; id++) {
        const x = xs[id], y = ys[id];
        const p1 = Math.max(0, 1 - (x - x1) ** 2 * irx1 - (y - y1) ** 2 * iry1);
        const p2 = Math.max(0, 1 - (x - x2) ** 2 * irx2 - (y - y2) ** 2 * iry2);
        const p3 = Math.max(0, 1 - (x - x3) ** 2 * irx3 - (y - y3) ** 2 * iry3);
        const p4 = Math.max(0, 1 - (x - x4) ** 2 * irx4 - (y - y4) ** 2 * iry4);
        const p5 = Math.max(0, 1 - (x - x5) ** 2 * irx5 - (y - y5) ** 2 * iry5);
        const a = smoothstep(.08, .82, p1), b = smoothstep(.08, .82, p2), c = smoothstep(.08, .82, p3);
        const d = smoothstep(.08, .82, p4), e = smoothstep(.08, .82, p5);
        let red = .18 + (1 - (1 - a) * (1 - b) * (1 - c) * (1 - d) * (1 - e)) * .8;
        // Linear superposition first, one smooth bounded colour response second:
        // order-independent reinforcement and cancellation, like a wave field.
        let waveField = 0;
        for (let wave = 0; wave < activeWaves; wave++) {
          const distance = Math.hypot(x - waveX[wave], y - waveY[wave]);
          waveField += (1 - smoothstep(0, 54, Math.abs(distance - waveFront[wave]))) * waveAmplitude[wave];
        }
        const response = Math.tanh(waveField * 1.15);
        red += response >= 0 ? (.98 - red) * response : (red - .025) * response;
        buckets[id] = Math.min(COLOR_BUCKETS - 1, Math.floor(Math.min(1, red) * COLOR_BUCKETS));
        handShift[id] = response * 2.15;
      }

      for (let bucket = 0; bucket < COLOR_BUCKETS; bucket++) {
        const red = (bucket + .5) / COLOR_BUCKETS;
        ctx.beginPath();
        for (let edge = 0; edge < edgeA.length; edge++) {
          const a = edgeA[edge], b = edgeB[edge];
          if (Math.max(buckets[a], buckets[b]) !== bucket) continue;
          const ux = Math.sign(xs[b] - xs[a]), uy = Math.sign(ys[b] - ys[a]);
          const ar = 5.1 + (buckets[a] + .5) / COLOR_BUCKETS * .68;
          const br = 5.1 + (buckets[b] + .5) / COLOR_BUCKETS * .68;
          ctx.moveTo(xs[a] + ux * ar, ys[a] + uy * ar);
          ctx.lineTo(xs[b] - ux * br, ys[b] - uy * br);
        }
        ctx.strokeStyle = `rgba(${RED},${.08 + red * .52})`; ctx.lineWidth = .48 + red * .42; ctx.stroke();
      }

      // Punch the clock faces out of the edge layer. The holes reveal the real
      // page background, so canvas and CSS can never drift during theme changes.
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      for (let id = 0; id < xs.length; id++) {
        const red = (buckets[id] + .5) / COLOR_BUCKETS;
        const r = 4.7 + red * .68;
        ctx.moveTo(xs[id] + r + .7, ys[id]);
        ctx.arc(xs[id], ys[id], r + .7, 0, Math.PI * 2);
      }
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      // Draw the clock outlines and fixed hands over those transparent faces.
      for (let bucket = 0; bucket < COLOR_BUCKETS; bucket++) {
        const red = (bucket + .5) / COLOR_BUCKETS;
        ctx.beginPath();
        for (let id = 0; id < xs.length; id++) {
          if (buckets[id] !== bucket) continue;
          const x = xs[id], y = ys[id], r = 4.7 + red * .68;
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
          const shift = handShift[id];
          if (Math.abs(shift) > .002) {
            const mc = Math.cos(shift), ms = Math.sin(shift), hc = Math.cos(shift * .42), hs = Math.sin(shift * .42);
            ctx.moveTo(x, y); ctx.lineTo(x + (minuteX[id] * mc - minuteY[id] * ms) * r * .72, y + (minuteX[id] * ms + minuteY[id] * mc) * r * .72);
            ctx.moveTo(x, y); ctx.lineTo(x + (hourX[id] * hc - hourY[id] * hs) * r * .48, y + (hourX[id] * hs + hourY[id] * hc) * r * .48);
          } else {
            ctx.moveTo(x, y); ctx.lineTo(x + minuteX[id] * r * .72, y + minuteY[id] * r * .72);
            ctx.moveTo(x, y); ctx.lineTo(x + hourX[id] * r * .48, y + hourY[id] * r * .48);
          }
        }
        ctx.strokeStyle = `rgba(${RED},${.16 + red * .7})`; ctx.lineWidth = .52; ctx.stroke();
      }

    };

    const drawVectorField = (time: number) => {
      const microField = interactivePointer || staticMicroField;
      const gap = microField ? (w < 600 ? 13 : 10) : (w < 600 ? 20 : 17);
      const t = Math.sin(time * .00008) * .08;
      const oscillation = interactivePointer ? Math.sin(time * .006) * 1.18 : 0;
      const oscillationCos = Math.cos(oscillation), oscillationSin = Math.sin(oscillation);
      pointerX += (pointerTargetX - pointerX) * .16; pointerY += (pointerTargetY - pointerY) * .16;
      const pointerLife = interactivePointer ? Math.max(0, Math.min(1, 1 - (time - pointerAt - 180) / 900)) : 0;
      const pointerRadius = Math.max(150, Math.min(290, Math.min(w, h) * .34));
      const paths = [new Path2D(), new Path2D(), new Path2D()];
      for (let py = -gap; py < h + gap; py += gap) for (let px = -gap; px < w + gap; px += gap) {
          const g = gradient((px / w - .5) * 6.5, (py / h - .5) * 4.7, t);
          const magnitude = Math.hypot(g.x, g.y) + .0001;
          const channel = magnitude > .45 ? 0 : magnitude > .16 ? 1 : 2;
          const baseLength = 2.5 + Math.min(7, magnitude * 6.5);
          const length = microField ? baseLength * .2 : baseLength;
          let ux = -g.x / magnitude, uy = -g.y / magnitude;
          if (interactivePointer) {
            const rotatedX = ux * oscillationCos - uy * oscillationSin;
            uy = ux * oscillationSin + uy * oscillationCos; ux = rotatedX;
          }
          const toX = pointerX - px, toY = pointerY - py, distance = Math.hypot(toX, toY);
          if (pointerLife && distance < pointerRadius && distance > .001) {
            const radial = 1 - distance / pointerRadius;
            const influence = radial * radial * (3 - 2 * radial) * .92 * pointerLife;
            const tx = toX / distance, ty = toY / distance;
            const mixedX = ux * (1 - influence) + tx * influence, mixedY = uy * (1 - influence) + ty * influence;
            const mixedLength = Math.hypot(mixedX, mixedY) || 1;
            ux = mixedX / mixedLength; uy = mixedY / mixedLength;
          }
          paths[channel].moveTo(px - ux * length, py - uy * length); paths[channel].lineTo(px + ux * length, py + uy * length);
      }
      ctx.lineWidth = .65;
      for (let channel = 0; channel < paths.length; channel++) {
        ctx.strokeStyle = `rgba(${COLORS[channel]},.1)`;
        ctx.stroke(paths[channel]);
      }
    };

    const frame = (timestamp: number) => {
      raf = 0;
      if (!visible) return;
      if (!reduced && timestamp - lastFrame < 50) { raf = requestAnimationFrame(frame); return; }
      lastFrame = timestamp;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      if (variant === 1) drawClocks(reduced ? 0 : timestamp);
      else drawVectorField(reduced ? 0 : timestamp);
      if (!reduced && !(variant === 2 && staticMicroField)) raf = requestAnimationFrame(frame);
    };

    const resizeObserver = new ResizeObserver(() => { resize(); if (!raf) raf = requestAnimationFrame(frame); });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
      else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '64px' });
    resizeObserver.observe(canvas); visibilityObserver.observe(canvas);
    // Listen above the visual stacking context: hero content (portrait, name,
    // links) sits over the canvas but clicks there still belong to the field.
    if (interactivePointer) {
      window.addEventListener('pointerdown', press, { passive: true, capture: true });
      window.addEventListener('pointermove', point, { passive: true, capture: true });
    }
    resize(); raf = requestAnimationFrame(frame);
    return () => {
      resizeObserver.disconnect(); visibilityObserver.disconnect(); if (raf) cancelAnimationFrame(raf);
      if (interactivePointer) {
        window.removeEventListener('pointerdown', press, { capture: true });
        window.removeEventListener('pointermove', point, { capture: true });
      }
    };
  }, [variant, compactClockField, interactivePointer, staticMicroField]);

  // Lightweight control-system trace: a damped oscillator, pointer velocity and
  // slow deterministic forcing. One scalar history, no particles or field solve.
  useEffect(() => {
    const canvas = traceRef.current;
    if (!canvas || !showTachograph) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const memory = new Float32Array(220);
    let width = 1, height = 1, dpr = 1, raf = 0, previous = performance.now(), lastPaint = -Infinity;
    let position = 0, velocity = 0, integral = 0, disturbance = 0, pointerParameter = .5;
    let buzz = 0, buzzVelocity = 0, roughness = 0, previousVX = 0, previousVY = 0;
    let pointerX = 0, pointerY = 0, pointerAt = 0, visible = true;
    let noiseSeed = 0x6d2b79f5, noiseLow = 0, previousWhite = 0;
    const resize = () => {
      const box = canvas.getBoundingClientRect(); width = Math.max(1, box.width); height = Math.max(1, box.height);
      dpr = Math.min(devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    };
    const point = (event: PointerEvent) => {
      const now = event.timeStamp;
      pointerParameter = Math.max(0, Math.min(1, event.clientX / Math.max(1, innerWidth)));
      if (!pointerAt || now - pointerAt > 180) { pointerX = event.clientX; pointerY = event.clientY; pointerAt = now; previousVX = 0; previousVY = 0; return; }
      const dt = Math.max(8, Math.min(80, now - pointerAt));
      const vx = (event.clientX - pointerX) / dt, vy = (event.clientY - pointerY) / dt;
      const speed = Math.hypot(vx, vy);
      const ax = (vx - previousVX) / dt, ay = (vy - previousVY) / dt;
      const acceleration = Math.hypot(ax, ay);
      // Speed feeds the plant; acceleration excites a faster structural mode.
      // Both are direction-independent in energy, while their signed projection
      // decides which way the trace is initially kicked.
      disturbance = Math.max(disturbance, Math.min(1.35, speed * 1.05 + acceleration * 8));
      roughness = Math.max(roughness, Math.min(1.6, speed * 1.05 + acceleration * 20));
      velocity += Math.max(-3, Math.min(3, (vx - vy * .42) * .72));
      buzzVelocity += Math.max(-4, Math.min(4, (ax + ay * .65) * 32));
      previousVX = vx; previousVY = vy;
      pointerX = event.clientX; pointerY = event.clientY; pointerAt = now;
    };
    const draw = (time: number) => {
      const dt = Math.min(.05, Math.max(.001, (time - previous) / 1000)); previous = time;
      // Regulation problem: deterministic wide-band disturbance enters a plant;
      // a compact PI-D controller rejects it, leaving a short underdamped tail.
      noiseSeed = (noiseSeed * 1664525 + 1013904223) >>> 0;
      const white = noiseSeed / 4294967296 * 2 - 1;
      noiseLow += (white - noiseLow) * .34;
      const highPass = white - noiseLow;
      const edgeNoise = white - previousWhite;
      previousWhite = white;
      const noisyLoad = (white * .68 + highPass * 1.35) * disturbance * 43;
      const stiffness = 25 + pointerParameter * 10;
      integral = Math.max(-.35, Math.min(.35, integral - position * dt));
      const control = -position * stiffness - velocity * 5.7 + integral * 1.1;
      velocity += (control + noisyLoad) * dt;
      position = Math.max(-1, Math.min(1, position + velocity * dt));
      // The same broadband impulse excites an underdamped structural mode.
      // Noise dies first; stored resonant energy then rings down on its own.
      buzzVelocity += (-buzz * 115 - buzzVelocity * 5.2 + highPass * roughness * 148) * dt;
      buzz += buzzVelocity * dt;
      disturbance *= Math.exp(-dt * 5.3);
      roughness *= Math.exp(-dt * 11.5);
      // Direct wide-band sensor residue creates narrow audio-like teeth. Its
      // envelope is still controlled entirely by pointer-induced roughness.
      const audioNoise = (highPass * .72 + edgeNoise * .58) * roughness * .5;
      memory.copyWithin(0, 1); memory[memory.length - 1] = Math.max(-1, Math.min(1, position * .34 + buzz * .88 + audioNoise));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      for (let i = 0; i < memory.length; i++) {
        const x = i / (memory.length - 1) * width;
        const y = height * .5 - memory[i] * height * .43;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(${RED},${.25 + Math.min(.18, Math.abs(velocity) * .06)})`;
      ctx.lineWidth = .7; ctx.stroke();
    };
    const frame = (time: number) => {
      raf = 0; if (!visible) return;
      if (!reduced && time - lastPaint < 33) { raf = requestAnimationFrame(frame); return; }
      lastPaint = time; draw(reduced ? 0 : time);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) { previous = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '32px' });
    resizeObserver.observe(canvas); visibilityObserver.observe(canvas);
    window.addEventListener('pointermove', point, { passive: true });
    resize(); raf = requestAnimationFrame(frame);
    return () => {
      resizeObserver.disconnect(); visibilityObserver.disconnect();
      window.removeEventListener('pointermove', point); if (raf) cancelAnimationFrame(raf);
    };
  }, [showTachograph, traceHost]);

  return <>
    <canvas ref={ref} className="absolute inset-0 w-full h-full" data-clickable-above="[data-home-pattern-boundary]" data-clickable-offset="48" aria-hidden="true" />
    {showTachograph && traceHost && createPortal(<canvas ref={traceRef} className="home-tachograph-line" aria-hidden="true" />, traceHost)}
  </>;
};
