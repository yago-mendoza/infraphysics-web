import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type HomeVisualVariant = 1 | 2;

const RED = '155,63,36';
const COLORS = [RED, '29,101,152', '55,118,87'];

/** Every adjustable of the clock field (variant 1). The defaults are the /home look; the home lab (/home1 … /home10) overrides them. */
export type ClockParams = {
  cols: number; rows: number; gridWidth: number; gridHeight: number; gridTop: number; jitter: number;
  islands: number; linkDensity: number; reach: number; seed: number;
  faceRadius: number; handLength: number; strokeWidth: number; tint: number; edgeAlpha: number; faceAlpha: number;
  foci: number; fociSpeed: number; fociRadius: number; baseRed: number; lumpiness: number;
  rippleSpeed: number; rippleGain: number; rippleWidth: number; handKick: number;
};
export const CLOCK_DEFAULTS: ClockParams = {
  cols: 75, rows: 20, gridWidth: 1.1, gridHeight: .53, gridTop: .012, jitter: 0,
  islands: 8, linkDensity: .308, reach: .035, seed: 0,
  faceRadius: 2.8, handLength: 1, strokeWidth: 1.25, tint: 0, edgeAlpha: .8, faceAlpha: .85,
  foci: 7, fociSpeed: 1, fociRadius: 1.4, baseRed: .4, lumpiness: .6,
  rippleSpeed: .24, rippleGain: .6, rippleWidth: 90, handKick: 2.15,
};
/** Moving fields: up to ten; the five original shapes and headings repeat for the extra ones. */
export const MAX_FOCI = 10;
const FOCUS_SHAPES = [[.13, .14, 62, 48], [.105, .11, 54, 42], [.09, .095, 48, 38], [.085, .09, 46, 36], [.095, .1, 50, 39]];
const FOCUS_ANGLES = [-.61, 2.18, .83, -2.42, 2.72];
const STRUCTURAL: (keyof ClockParams)[] = ['cols', 'rows', 'gridWidth', 'gridHeight', 'gridTop', 'jitter', 'islands', 'linkDensity', 'reach', 'seed'];
const hash01 = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const mixInk = (tint: number) => {
  const a = RED.split(',').map(Number), b = COLORS[1].split(',').map(Number);
  return a.map((v, i) => Math.round(v + (b[i] - v) * tint)).join(',');
};

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
  clockParams?: Partial<ClockParams>;
  /** Selector of the element that measures the scroll: the field is fully dissolved once its top reaches the viewport top (see `dissolve` in drawClocks). */
  dissolveWith?: string;
}> = ({ variant, showTachograph = true, compactClockField = false, interactivePointer = false, staticMicroField = false, clockParams, dissolveWith }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  // Per-frame values read the ref; a change in a structural value rebuilds the lattice and its topology.
  const params: ClockParams = { ...CLOCK_DEFAULTS, ...clockParams };
  const paramsRef = useRef(params); paramsRef.current = params;
  const rebuildRef = useRef<(() => void) | null>(null);
  const structuralKey = STRUCTURAL.map(key => params[key]).join('|');
  useEffect(() => { rebuildRef.current?.(); }, [structuralKey]);
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
    // Dissolve: the scroll sets a target (the carousel crossing the clock band), the field follows it with a time constant,
    // and each face goes at its own deterministic threshold (lower rows first, noise on top), its hands turning as it fades.
    // Time-bound, not scroll-bound: the field seeks the equilibrium the scroll position asks for at one constant rate
    // (DISSOLVE_RATE per second, so a full disintegration or recomposition always takes the same few seconds), however
    // hard the scrollbar was yanked.
    const VIS_LEVELS = 6, DISSOLVE_RATE = .38;
    let dissolve = 0, dissolveTarget = 0, dissolveSpan = 0, dissolveDrawn = -1, dissolveEl: Element | null = null;
    let dissolveAt = new Float32Array(0), visLevel = new Uint8Array(0);
    let hourX = new Float32Array(0), hourY = new Float32Array(0), minuteX = new Float32Array(0), minuteY = new Float32Array(0);
    let edgeA = new Int32Array(0), edgeB = new Int32Array(0);
    const RIPPLE_NUMERIC_LIFE = 8000;
    const MAX_RIPPLES = 20;
    const waves: Array<Ripple | null> = Array(MAX_RIPPLES).fill(null);
    const waveX = new Float32Array(MAX_RIPPLES), waveY = new Float32Array(MAX_RIPPLES), waveFront = new Float32Array(MAX_RIPPLES), waveAmplitude = new Float32Array(MAX_RIPPLES);
    const focusX = new Float32Array(MAX_FOCI), focusY = new Float32Array(MAX_FOCI);
    const focusVX = new Float32Array(MAX_FOCI), focusVY = new Float32Array(MAX_FOCI);
    const focusRX = new Float32Array(MAX_FOCI), focusRY = new Float32Array(MAX_FOCI);
    // Reciprocal radii, and the lobes that make each field an irregular blob instead of an ellipse:
    // its outline is r(θ) = 1 + lump · (.3 sin(k1 θ + φ1) + .15 sin(k2 θ + φ2)), with the phases drifting in time.
    const irx = new Float32Array(MAX_FOCI), iry = new Float32Array(MAX_FOCI);
    const lobeK1 = new Float32Array(MAX_FOCI), lobeK2 = new Float32Array(MAX_FOCI), lobePhi1 = new Float32Array(MAX_FOCI), lobePhi2 = new Float32Array(MAX_FOCI);
    let fociCount = 0;
    let focusReady = false, lastFocusTime = 0;
    let pointerX = 0, pointerY = 0, pointerTargetX = 0, pointerTargetY = 0, pointerAt = -Infinity;

    // Recreates the old deterministic, interlocking eight-island topology. This
    // runs only when the canvas changes size; none of it belongs to the frame loop.
    const buildTopology = (nextCols: number, nextRows: number) => {
      const P = paramsRef.current, islands = Math.max(1, Math.min(16, Math.round(P.islands)));
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
        const fixed = [0, nextCols - 1, (nextRows - 1) * nextCols, count - 1,
          Math.floor(nextCols * .28) + nextCols * Math.floor(nextRows * .42),
          Math.floor(nextCols * .72) + nextCols * Math.floor(nextRows * .42),
          Math.floor(nextCols * .4) + nextCols * (nextRows - 2), Math.floor(nextCols * .61) + nextCols];
        // Eight fixed seeds reproduce the /home topology exactly; fewer take the first ones, more add hashed positions.
        const seeds = fixed.slice(0, islands);
        for (let i = 8; seeds.length < islands && i < 200; i++) { const id = Math.floor(hash01(i * 7 + P.seed * 13) * count); if (!seeds.includes(id)) seeds.push(id); }
        seeds.forEach((id, island) => { owner[id] = island; });
        const findNeighbours = (id: number) => {
          let n = 0, x = id % nextCols, y = Math.floor(id / nextCols);
          if (x) neighbours[n++] = id - 1; if (x < nextCols - 1) neighbours[n++] = id + 1;
          if (y) neighbours[n++] = id - nextCols; if (y < nextRows - 1) neighbours[n++] = id + nextCols;
          return n;
        };
        let remaining = count - seeds.length, turn = 0;
        while (remaining > 0 && turn < count * 12) {
          const island = turn % islands; let bestScore = -Infinity, best = -1, from = -1;
          for (let id = 0; id < count; id++) if (owner[id] === island) {
            const n = findNeighbours(id);
            for (let j = 0; j < n; j++) {
              const next = neighbours[j]; if (owner[next] !== -1) continue;
              const noise = ((next * 73 + id * 37 + island * 53 + P.seed * 131) % 997) / 997;
              const reach = Math.abs(next % nextCols - nextCols / 2) + Math.abs(Math.floor(next / nextCols) - nextRows / 2);
              const score = noise * 3 + reach * P.reach;
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
          // (h % 13) > 8 on /home; expressed as a density so the lab can open or close the mesh.
          const linked = (other: number) => owner[other] === owner[id] && ((id * 29 + other * 17) % 13 + .5) / 13 > 1 - P.linkDensity;
          if (x < nextCols - 1 && linked(id + 1)) add(id, id + 1);
          if (y < nextRows - 1 && linked(id + nextCols)) add(id, id + nextCols);
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
      const P = paramsRef.current;
      const denseClocks = variant === 1 && !compactClockField;
      cols = denseClocks ? Math.max(2, Math.round(w < 680 ? P.cols * 28 / 41 : P.cols)) : (w < 680 ? 20 : 29);
      rows = compactClockField ? 2 : denseClocks ? Math.max(2, Math.round(P.rows)) : 11;
      const gridW = w * P.gridWidth, left = (w - gridW) / 2;
      // Twice the clocks in the same footprint, keeping face size and stroke weight.
      dx = gridW / (cols - 1); dy = compactClockField ? 48 : Math.min(340 * (P.gridHeight / .53), h * P.gridHeight) / (rows - 1);
      const top = compactClockField ? h - (w < 768 ? 12 : 20) - (rows - 1) * dy : h * P.gridTop;
      const count = cols * rows;
      xs = new Float32Array(count); ys = new Float32Array(count); buckets = new Uint8Array(count); handShift = new Float32Array(count);
      dissolveAt = new Float32Array(count); visLevel = new Uint8Array(count).fill(VIS_LEVELS - 1);
      dissolveEl = dissolveWith ? document.querySelector(dissolveWith) : null;
      // The scroll distance that means "fully dissolved": the element's document top, measured here (on size changes), never per frame:
      // the carousel rotates and re-lays out, and a target that jitters makes the front flicker.
      dissolveSpan = dissolveEl ? dissolveEl.getBoundingClientRect().top + window.scrollY : 0;
      dissolveDrawn = -1;
      for (let id = 0; id < count; id++) dissolveAt[id] = .5 * hash01(id * 5 + 7) + .5 * (1 - Math.floor(id / cols) / Math.max(1, rows - 1));
      hourX = new Float32Array(count); hourY = new Float32Array(count); minuteX = new Float32Array(count); minuteY = new Float32Array(count);
      for (let id = 0; id < count; id++) {
        xs[id] = left + (id % cols) * dx + (hash01(id * 3 + 1 + P.seed) - .5) * dx * P.jitter;
        ys[id] = top + Math.floor(id / cols) * dy + (hash01(id * 3 + 2 + P.seed) - .5) * dy * P.jitter;
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
      for (let i = 0; i < fociCount; i++) remainder *= 1 - contribution(focusX[i], focusY[i], focusRX[i], focusRY[i]);
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
        x, y, started: now, gain: paramsRef.current.rippleGain, speed: paramsRef.current.rippleSpeed,
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
      const P = paramsRef.current, ink = P.tint ? mixInk(P.tint) : RED, fr = P.fociRadius;
      fociCount = Math.max(0, Math.min(MAX_FOCI, Math.round(P.foci)));
      for (let i = 0; i < MAX_FOCI; i++) {
        const [kx, ky, minX, minY] = FOCUS_SHAPES[i % FOCUS_SHAPES.length];
        focusRX[i] = Math.max(minX, w * kx) * fr; focusRY[i] = Math.max(minY, h * ky) * fr;
        irx[i] = 1 / focusRX[i]; iry[i] = 1 / focusRY[i];
        lobeK1[i] = 3 + i % 3; lobeK2[i] = 5 + (i % 2) * 2;
        lobePhi1[i] = time * .00025 * (1 + (i % 4) * .15) + i * 1.7; lobePhi2[i] = -time * .0004 + i * 2.3;
      }
      const lump = P.lumpiness, outer2 = (1 + lump * .45) ** 2;
      const fieldBottom = Math.min(interactionBottom, h * .62);
      if (!focusReady) {
        for (let i = 0; i < MAX_FOCI; i++) {
          focusX[i] = w * ((.12 + i * .19) % 1);
          focusY[i] = fieldBottom * (.22 + (i * 37 % 61) / 100);
          const speed = (48 + (i % 5) * 5) * P.fociSpeed, angle = FOCUS_ANGLES[i % 5] + (i >= 5 ? 1.3 : 0);
          focusVX[i] = Math.cos(angle) * speed; focusVY[i] = Math.sin(angle) * speed;
        }
        focusReady = true; lastFocusTime = time;
      }
      const dt = Math.min(.1, Math.max(0, (time - lastFocusTime) / 1000));
      lastFocusTime = time;
      // A pure function of the scroll, from the first pixel: the fraction of the way to the element's top reaching the viewport top.
      if (dissolveSpan > 0) dissolveTarget = Math.max(0, Math.min(1, window.scrollY / dissolveSpan));
      if (dissolveTarget !== dissolve) {
        const cap = DISSOLVE_RATE * dt;
        dissolve += Math.max(-cap, Math.min(cap, dissolveTarget - dissolve));
      }
      // Levels are recomputed only when the dissolve value moved: a settled field is drawn identically frame after frame.
      if (dissolve !== dissolveDrawn) {
        // The front is .3 wide around each threshold (thresholds span 0..1), so the value is stretched by 1.3: at dissolve 1 the
        // last face is past its own front and nothing at all remains, whatever the row.
        const front = dissolve * 1.3;
        if (dissolve > 0) for (let id = 0; id < xs.length; id++) {
          const at = dissolveAt[id];
          visLevel[id] = Math.round((1 - smoothstep(at - .3, at + .3, front)) * (VIS_LEVELS - 1));
        } else visLevel.fill(VIS_LEVELS - 1);
        dissolveDrawn = dissolve;
      }
      const levelsInUse = dissolve > 0 ? VIS_LEVELS - 1 : 1;
      if (dt) {
        // Pair checks between the active particles: a small short-range repulsion is
        // enough to break repeated paths while preserving their inertia.
        for (let i = 0; i < fociCount - 1; i++) for (let j = i + 1; j < fociCount; j++) {
          const sx = focusX[i] - focusX[j], sy = focusY[i] - focusY[j];
          const distance = Math.hypot(sx, sy) || 1;
          const range = (focusRX[i] + focusRX[j]) * .72;
          if (distance >= range) continue;
          const acceleration = 86 * (1 - distance / range) ** 2 * dt;
          const ax = sx / distance * acceleration, ay = sy / distance * acceleration;
          focusVX[i] += ax; focusVY[i] += ay; focusVX[j] -= ax; focusVY[j] -= ay;
        }
        for (let i = 0; i < fociCount; i++) {
          const targetSpeed = (48 + (i % 5) * 5) * Math.max(.02, P.fociSpeed);
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
      const rippleWidth = Math.max(1, P.rippleWidth), handKick = P.handKick, baseRed = P.baseRed;
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
        let remainder = 1;
        for (let i = 0; i < fociCount; i++) {
          const ex = (x - focusX[i]) * irx[i], ey = (y - focusY[i]) * iry[i], d2 = ex * ex + ey * ey;
          if (d2 >= outer2) continue;
          const theta = Math.atan2(ey, ex);
          const shape = 1 + lump * (.3 * Math.sin(lobeK1[i] * theta + lobePhi1[i]) + .15 * Math.sin(lobeK2[i] * theta + lobePhi2[i]));
          const proximity = Math.max(0, 1 - d2 / (shape * shape));
          remainder *= 1 - smoothstep(.08, .82, proximity);
        }
        let red = baseRed + (1 - remainder) * (.98 - baseRed);
        // Linear superposition first, one smooth bounded colour response second:
        // order-independent reinforcement and cancellation, like a wave field.
        let waveField = 0;
        for (let wave = 0; wave < activeWaves; wave++) {
          const distance = Math.hypot(x - waveX[wave], y - waveY[wave]);
          waveField += (1 - smoothstep(0, rippleWidth, Math.abs(distance - waveFront[wave]))) * waveAmplitude[wave];
        }
        const response = Math.tanh(waveField * 1.15);
        // The dark side of a wave is shallow on purpose: on a fine lattice a full trough read as a black ring.
        red += response >= 0 ? (.98 - red) * response : (red - .14) * response * .55;
        buckets[id] = Math.min(COLOR_BUCKETS - 1, Math.floor(Math.min(1, red) * COLOR_BUCKETS));
        handShift[id] = response * handKick;
      }

      for (let level = VIS_LEVELS - 1; level > VIS_LEVELS - 1 - levelsInUse; level--) for (let bucket = 0; bucket < COLOR_BUCKETS; bucket++) {
        const red = (bucket + .5) / COLOR_BUCKETS, fade = level / (VIS_LEVELS - 1);
        ctx.beginPath();
        for (let edge = 0; edge < edgeA.length; edge++) {
          const a = edgeA[edge], b = edgeB[edge];
          if (Math.max(buckets[a], buckets[b]) !== bucket || Math.min(visLevel[a], visLevel[b]) !== level) continue;
          const ux = Math.sign(xs[b] - xs[a]), uy = Math.sign(ys[b] - ys[a]);
          const ar = P.faceRadius + .4 + (buckets[a] + .5) / COLOR_BUCKETS * .68;
          const br = P.faceRadius + .4 + (buckets[b] + .5) / COLOR_BUCKETS * .68;
          ctx.moveTo(xs[a] + ux * ar, ys[a] + uy * ar);
          ctx.lineTo(xs[b] - ux * br, ys[b] - uy * br);
        }
        ctx.strokeStyle = `rgba(${ink},${(.08 + red * .52) * P.edgeAlpha * fade})`; ctx.lineWidth = (.48 + red * .42) * P.strokeWidth; ctx.stroke();
      }

      // Punch the clock faces out of the edge layer. The holes reveal the real
      // page background, so canvas and CSS can never drift during theme changes.
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      for (let id = 0; id < xs.length; id++) {
        if (!visLevel[id]) continue;
        const red = (buckets[id] + .5) / COLOR_BUCKETS;
        const r = P.faceRadius + red * .68;
        ctx.moveTo(xs[id] + r + .7, ys[id]);
        ctx.arc(xs[id], ys[id], r + .7, 0, Math.PI * 2);
      }
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      // Draw the clock outlines and fixed hands over those transparent faces.
      for (let level = VIS_LEVELS - 1; level > VIS_LEVELS - 1 - levelsInUse; level--) for (let bucket = 0; bucket < COLOR_BUCKETS; bucket++) {
        const red = (bucket + .5) / COLOR_BUCKETS, fade = level / (VIS_LEVELS - 1);
        ctx.beginPath();
        for (let id = 0; id < xs.length; id++) {
          if (buckets[id] !== bucket || visLevel[id] !== level) continue;
          const x = xs[id], y = ys[id], r = P.faceRadius + red * .68, minute = r * .72 * P.handLength, hour = r * .48 * P.handLength;
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
          const shift = handShift[id] + (1 - fade) * 2.6;
          if (Math.abs(shift) > .002) {
            const mc = Math.cos(shift), ms = Math.sin(shift), hc = Math.cos(shift * .42), hs = Math.sin(shift * .42);
            ctx.moveTo(x, y); ctx.lineTo(x + (minuteX[id] * mc - minuteY[id] * ms) * minute, y + (minuteX[id] * ms + minuteY[id] * mc) * minute);
            ctx.moveTo(x, y); ctx.lineTo(x + (hourX[id] * hc - hourY[id] * hs) * hour, y + (hourX[id] * hs + hourY[id] * hc) * hour);
          } else {
            ctx.moveTo(x, y); ctx.lineTo(x + minuteX[id] * minute, y + minuteY[id] * minute);
            ctx.moveTo(x, y); ctx.lineTo(x + hourX[id] * hour, y + hourY[id] * hour);
          }
        }
        ctx.strokeStyle = `rgba(${ink},${(.16 + red * .7) * P.faceAlpha * fade})`; ctx.lineWidth = .52 * P.strokeWidth; ctx.stroke();
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
      // The static plate (about, projects, home, wiki) draws at 3x alpha so it can read on white in
      // light mode; .about-system-visual lowers its opacity in dark to keep the old weight there.
      const alpha = staticMicroField ? .3 : .1;
      ctx.lineWidth = staticMicroField ? .8 : .65;
      for (let channel = 0; channel < paths.length; channel++) {
        ctx.strokeStyle = `rgba(${COLORS[channel]},${alpha})`;
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
    rebuildRef.current = () => { resize(); if (!raf) raf = requestAnimationFrame(frame); };
    resize(); raf = requestAnimationFrame(frame);
    return () => {
      rebuildRef.current = null;
      resizeObserver.disconnect(); visibilityObserver.disconnect(); if (raf) cancelAnimationFrame(raf);
      if (interactivePointer) {
        window.removeEventListener('pointerdown', press, { capture: true });
        window.removeEventListener('pointermove', point, { capture: true });
      }
    };
  }, [variant, compactClockField, interactivePointer, staticMicroField, dissolveWith]);

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
