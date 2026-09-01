import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { noteLabel, type FieldNoteMeta } from '../../types';

type Vec3 = [number, number, number];
type Rgba = [number, number, number, number];
type Point3 = { id: string; componentId: number | null; position: Vec3; size: number };
type Edge3 = { source: string; target: string; type: 'reference' | 'hierarchy' };
type ScreenPoint = { id: string; x: number; y: number; visible: boolean };
type GlScene = {
  gl: WebGLRenderingContext; program: WebGLProgram;
  positionBuffer: WebGLBuffer; colorBuffer: WebGLBuffer; sizeBuffer: WebGLBuffer;
  positionLocation: number; colorLocation: number; sizeLocation: number;
  mvpLocation: WebGLUniformLocation; pointModeLocation: WebGLUniformLocation; pixelRatioLocation: WebGLUniformLocation;
};

const ISLAND_COLORS: Rgba[] = [
  [0.66, 0.55, 0.98, 1], [0.38, 0.65, 0.98, 1], [0.20, 0.83, 0.60, 1],
  [0.96, 0.62, 0.17, 1], [0.96, 0.45, 0.71, 1], [0.13, 0.82, 0.91, 1],
  [0.98, 0.44, 0.52, 1], [0.64, 0.86, 0.22, 1], [0.75, 0.52, 0.96, 1],
];
const SIDE_COLORS: Rgba[] = [
  [0.40, 0.91, 0.97, 1], [0.94, 0.67, 0.98, 1], [0.98, 0.75, 0.14, 1],
  [0.52, 0.93, 0.65, 1], [0.58, 0.77, 0.98, 1],
];
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const hash01 = (value: string, salt: number) => {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
};
const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (v: Vec3): Vec3 => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mixColor = (a: Rgba, b: Rgba, t: number): Rgba => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];

const multiply4 = (a: number[], b: number[]) => {
  const out = new Array<number>(16).fill(0);
  for (let c = 0; c < 4; c += 1) for (let r = 0; r < 4; r += 1) for (let i = 0; i < 4; i += 1) out[c * 4 + r] += a[i * 4 + r] * b[c * 4 + i];
  return out;
};
const perspective = (fov: number, aspect: number, near: number, far: number) => {
  const f = 1 / Math.tan(fov / 2);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
};
const lookAt = (eye: Vec3, target: Vec3) => {
  const z = normalize(subtract(eye, target)), x = normalize(cross([0, 1, 0], z)), y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]), -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]), -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]), 1];
};
const project = (position: Vec3, mvp: number[], width: number, height: number): Omit<ScreenPoint, 'id'> => {
  const [x, y, z] = position;
  const cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12], cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
  const cz = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14], cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
  const nx = cx / cw, ny = cy / cw, nz = cz / cw;
  return { x: (nx * 0.5 + 0.5) * width, y: (1 - (ny * 0.5 + 0.5)) * height, visible: cw > 0 && nz > -1 && nz < 1 };
};

const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader');
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'WebGL shader failed');
  return shader;
};
const createScene = (canvas: HTMLCanvasElement): GlScene | null => {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });
  if (!gl) return null;
  const vertex = compileShader(gl, gl.VERTEX_SHADER, `
    attribute vec3 a_position; attribute vec4 a_color; attribute float a_size;
    uniform mat4 u_mvp; uniform float u_pixel_ratio; varying vec4 v_color;
    void main(){ gl_Position=u_mvp*vec4(a_position,1.0); gl_PointSize=clamp(a_size*u_pixel_ratio*5.6/max(gl_Position.w,0.3),1.0,34.0*u_pixel_ratio); v_color=a_color; }
  `);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float; uniform float u_point_mode; varying vec4 v_color;
    void main(){ if(u_point_mode>.5){ float d=length(gl_PointCoord-vec2(.5)); if(d>.5) discard; float edge=1.0-smoothstep(.40,.5,d); gl_FragColor=vec4(v_color.rgb,v_color.a*edge); } else gl_FragColor=v_color; }
  `);
  const program = gl.createProgram(); if (!program) return null;
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'WebGL link failed');
  const positionBuffer = gl.createBuffer(), colorBuffer = gl.createBuffer(), sizeBuffer = gl.createBuffer();
  const mvpLocation = gl.getUniformLocation(program, 'u_mvp'), pointModeLocation = gl.getUniformLocation(program, 'u_point_mode'), pixelRatioLocation = gl.getUniformLocation(program, 'u_pixel_ratio');
  if (!positionBuffer || !colorBuffer || !sizeBuffer || !mvpLocation || !pointModeLocation || !pixelRatioLocation) return null;
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  return { gl, program, positionBuffer, colorBuffer, sizeBuffer, positionLocation: gl.getAttribLocation(program, 'a_position'), colorLocation: gl.getAttribLocation(program, 'a_color'), sizeLocation: gl.getAttribLocation(program, 'a_size'), mvpLocation, pointModeLocation, pixelRatioLocation };
};

export const TopologyOrbit: React.FC<{
  notes: FieldNoteMeta[]; highlightIds?: Set<string> | null; visibleIds?: Set<string> | null;
  activeNodeId?: string | null; expanded?: boolean; onOpenNode?: (id: string) => void;
}> = ({ notes, highlightIds = null, visibleIds, activeNodeId, expanded = false, onOpenNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null), sceneRef = useRef<GlScene | null>(null), frameRef = useRef(0);
  const renderVisibleRef = useRef(true), drawRef = useRef<(time: number) => void>(() => {});
  const screenPointsRef = useRef<ScreenPoint[]>([]), highlightMixRef = useRef(new Map<string, number>());
  const cameraRef = useRef({ yaw: -0.55, pitch: 0.32, distance: 7.2, target: [0, 0, 0] as Vec3 });
  const cameraFlightRef = useRef<{ started: number; fromTarget: Vec3; toTarget: Vec3; fromDistance: number; toDistance: number } | null>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0, distance: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(activeNodeId ?? null);
  const [navigationTool, setNavigationTool] = useState<'orbit' | 'pan'>('orbit');
  const [canvasSize, setCanvasSize] = useState({ width: 240, height: expanded ? 560 : 250 });
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const { getCentrality, getIslands, loaded } = useGraphRelevance();
  useEffect(() => { if (activeNodeId) setSelectedId(activeNodeId); }, [activeNodeId]);
  const islands = loaded ? getIslands() : null;
  const noteMap = useMemo(() => new Map(notes.map(note => [note.id, note])), [notes]);

  const points = useMemo<Point3[]>(() => {
    if (!islands) return [];
    const result: Point3[] = [], components = islands.components.filter(c => c.size > 1).sort((a, b) => b.size - a.size);
    components.forEach((component, componentIndex) => {
      const isMain = componentIndex === 0, theta = componentIndex * GOLDEN_ANGLE, ring = isMain ? 0 : 2.5 + Math.sqrt(componentIndex) * 0.52;
      const center: Vec3 = isMain ? [0, 0, 0] : [Math.cos(theta) * ring, Math.sin(theta) * ring * 0.7, (hash01(String(component.id), 83) - 0.5) * 0.7];
      const spread = isMain ? 1.65 : Math.min(0.48 + Math.sqrt(component.size) * 0.075, 1.15);
      component.members.forEach((id, memberIndex) => {
        if (visibleIds && !visibleIds.has(id)) return;
        const angle = memberIndex * GOLDEN_ANGLE + hash01(id, 29) * 0.12;
        const radius = spread * Math.sqrt((memberIndex + 0.5) / component.size);
        result.push({ id, componentId: component.id, position: [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius * 0.72, center[2] + (hash01(id, 61) - 0.5) * spread * 0.22], size: 12 + Math.sqrt(Math.max(0, getCentrality(id))) * 19 });
      });
    });
    islands.isolatedUids.forEach((id, index) => {
      if (visibleIds && !visibleIds.has(id)) return;
      const angle = index * GOLDEN_ANGLE, radius = 4.1 + (index % 3) * 0.18;
      result.push({ id, componentId: null, position: [Math.cos(angle) * radius, ((index % 11) / 10 - 0.5) * 3.2, Math.sin(angle) * radius], size: 7 });
    });
    return result;
  }, [getCentrality, islands, noteMap, visibleIds]);

  const pointMap = useMemo(() => new Map(points.map(point => [point.id, point])), [points]);
  const edges = useMemo<Edge3[]>(() => {
    const result: Edge3[] = [], seen = new Set<string>(), addressToId = new Map(notes.map(note => [note.address || note.title, note.id]));
    const add = (source: string, target: string, type: Edge3['type']) => { if (!pointMap.has(source) || !pointMap.has(target) || source === target) return; const key = `${type}:${[source, target].sort().join(':')}`; if (!seen.has(key)) { seen.add(key); result.push({ source, target, type }); } };
    notes.forEach(note => { (note.references || []).forEach(target => add(note.id, target, 'reference')); const parts = note.addressParts || (note.address || note.title).split('//'); if (parts.length > 1) { const parent = addressToId.get(parts.slice(0, -1).join('//')); if (parent) add(parent, note.id, 'hierarchy'); } });
    return result;
  }, [notes, pointMap]);
  const selectedPoint = selectedId ? pointMap.get(selectedId) ?? null : null;
  const selectedNeighborIds = useMemo(() => {
    const result = new Set<string>();
    if (!selectedId) return result;
    edges.forEach(edge => { if (edge.source === selectedId) result.add(edge.target); else if (edge.target === selectedId) result.add(edge.source); });
    return result;
  }, [edges, selectedId]);
  const selectedNeighbors = useMemo(() => [...selectedNeighborIds].map(id => noteMap.get(id)).filter((note): note is FieldNoteMeta => !!note), [noteMap, selectedNeighborIds]);
  const selectedCut = selectedId && islands ? islands.cuts.find(cut => cut.uid === selectedId) ?? null : null;
  const sideByNode = useMemo(() => { const map = new Map<string, number>(); selectedCut?.sides.forEach((side, i) => side.members.forEach(id => map.set(id, i))); return map; }, [selectedCut]);
  const selectedNote = selectedId ? noteMap.get(selectedId) : null;
  const selectedComponent = selectedPoint?.componentId == null || !islands ? null : islands.components.find(c => c.id === selectedPoint.componentId) ?? null;

  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; try { sceneRef.current = createScene(canvas); setWebglUnavailable(!sceneRef.current); } catch { setWebglUnavailable(true); } return () => { sceneRef.current = null; }; }, [loaded]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const observer = new ResizeObserver(entries => { const width = entries[0].contentRect.width; if (width > 0) setCanvasSize({ width, height: expanded ? Math.max(460, window.innerHeight - 96) : 250 }); }); observer.observe(canvas); return () => observer.disconnect(); }, [expanded, loaded]);

  const focusNode = useCallback((id: string) => { const point = pointMap.get(id); if (!point) return; setSelectedId(id); const camera = cameraRef.current; cameraFlightRef.current = { started: performance.now(), fromTarget: [...camera.target] as Vec3, toTarget: [...point.position] as Vec3, fromDistance: camera.distance, toDistance: expanded ? 0.72 : 1.05 }; }, [expanded, pointMap]);
  const resetView = useCallback(() => { cameraRef.current = { yaw: -0.55, pitch: 0.32, distance: 7.2, target: [0, 0, 0] }; cameraFlightRef.current = null; }, []);
  const changeZoom = useCallback((factor: number) => { cameraFlightRef.current = null; cameraRef.current.distance = Math.max(0.34, Math.min(15, cameraRef.current.distance * factor)); }, []);
  const nearestAt = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return null;
    const x = clientX - rect.left, y = clientY - rect.top; let nearest: ScreenPoint | null = null, distance = expanded ? 18 : 13;
    screenPointsRef.current.forEach(point => { if (!point.visible) return; const next = Math.hypot(point.x - x, point.y - y); if (next < distance) { nearest = point; distance = next; } }); return nearest;
  };

  const draw = useCallback((time: number) => {
    const scene = sceneRef.current, canvas = canvasRef.current; if (!scene || !canvas || !points.length) return;
    const { gl } = scene, dpr = Math.min(window.devicePixelRatio || 1, expanded ? 1.8 : 2), width = Math.max(1, Math.round(canvasSize.width * dpr)), height = Math.max(1, Math.round(canvasSize.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const flight = cameraFlightRef.current;
    if (flight) { const raw = Math.min(1, (time - flight.started) / 720), eased = raw < .5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2; cameraRef.current.target = mixVec(flight.fromTarget, flight.toTarget, eased); cameraRef.current.distance = flight.fromDistance + (flight.toDistance - flight.fromDistance) * eased; if (raw >= 1) cameraFlightRef.current = null; }
    const camera = cameraRef.current, cosPitch = Math.cos(camera.pitch);
    const eye: Vec3 = [camera.target[0] + Math.sin(camera.yaw) * cosPitch * camera.distance, camera.target[1] + Math.sin(camera.pitch) * camera.distance, camera.target[2] + Math.cos(camera.yaw) * cosPitch * camera.distance];
    const mvp = multiply4(perspective(Math.PI / 3.1, width / height, .025, 80), lookAt(eye, camera.target));
    screenPointsRef.current = points.map(point => ({ ...project(point.position, mvp, canvasSize.width, canvasSize.height), id: point.id }));
    const pointPositions: number[] = [], pointColors: number[] = [], pointSizes: number[] = [], isHighlighting = highlightIds !== null;
    points.forEach(point => {
      const targetMatch = isHighlighting && (highlightIds?.has(point.id) ?? false) ? 1 : 0, currentMatch = highlightMixRef.current.get(point.id) ?? 0, match = currentMatch + (targetMatch - currentMatch) * .14;
      highlightMixRef.current.set(point.id, match);
      const selected = point.id === selectedId, direct = selectedNeighborIds.has(point.id), sameIsland = selectedPoint && point.componentId === selectedPoint.componentId, side = sideByNode.get(point.id);
      const island = point.componentId == null ? [0.39, 0.45, 0.55, 1] as Rgba : ISLAND_COLORS[Math.abs(point.componentId) % ISLAND_COLORS.length];
      let color = selected ? [1, 1, 1, 1] as Rgba : selectedCut && sameIsland && side != null ? SIDE_COLORS[side % SIDE_COLORS.length] : mixColor(island, [0.77, 0.71, 0.99, 1], match);
      const selectionAlpha = selected ? 1 : selectedPoint ? (direct ? .98 : sameIsland ? .16 : .035) : 1, searchAlpha = isHighlighting ? .045 + match * .955 : 1;
      if (direct) color = mixColor(color, [.77, .71, .99, 1], .55);
      color = [color[0], color[1], color[2], color[3] * selectionAlpha * searchAlpha]; pointPositions.push(...point.position); pointColors.push(...color); pointSizes.push(point.size * (selected ? 1.65 : direct ? 1.28 : 1));
    });
    const linePositions: number[] = [], lineColors: number[] = [];
    edges.forEach(edge => { const source = pointMap.get(edge.source), target = pointMap.get(edge.target); if (!source || !target) return; const match = Math.min(highlightMixRef.current.get(edge.source) ?? 0, highlightMixRef.current.get(edge.target) ?? 0), direct = !!selectedId && (edge.source === selectedId || edge.target === selectedId), sameSelectedIsland = selectedPoint && source.componentId === selectedPoint.componentId && target.componentId === selectedPoint.componentId; const alpha = selectedPoint ? (direct ? .9 : sameSelectedIsland ? .025 : .003) : isHighlighting ? .008 + match * .38 : edge.type === 'hierarchy' ? .13 : .06; const color: Rgba = direct ? [.77, .71, .99, alpha] : match > .2 ? [.67, .56, .98, alpha] : edge.type === 'hierarchy' ? [.29, .87, .50, alpha] : [.58, .65, .78, alpha]; linePositions.push(...source.position, ...target.position); lineColors.push(...color, ...color); });
    gl.useProgram(scene.program); gl.uniformMatrix4fv(scene.mvpLocation, false, new Float32Array(mvp)); gl.uniform1f(scene.pixelRatioLocation, dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(scene.positionLocation); gl.vertexAttribPointer(scene.positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.colorBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColors), gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(scene.colorLocation); gl.vertexAttribPointer(scene.colorLocation, 4, gl.FLOAT, false, 0, 0); gl.disableVertexAttribArray(scene.sizeLocation); gl.vertexAttrib1f(scene.sizeLocation, 1); gl.uniform1f(scene.pointModeLocation, 0); gl.drawArrays(gl.LINES, 0, linePositions.length / 3);
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPositions), gl.DYNAMIC_DRAW); gl.vertexAttribPointer(scene.positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.colorBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointColors), gl.DYNAMIC_DRAW); gl.vertexAttribPointer(scene.colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.sizeBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointSizes), gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(scene.sizeLocation); gl.vertexAttribPointer(scene.sizeLocation, 1, gl.FLOAT, false, 0, 0); gl.uniform1f(scene.pointModeLocation, 1); gl.drawArrays(gl.POINTS, 0, points.length);
    if (renderVisibleRef.current) frameRef.current = requestAnimationFrame(draw);
  }, [canvasSize, edges, expanded, highlightIds, pointMap, points, selectedCut, selectedId, selectedNeighborIds, selectedPoint, sideByNode]);
  drawRef.current = draw;
  useEffect(() => { frameRef.current = requestAnimationFrame(draw); return () => cancelAnimationFrame(frameRef.current); }, [draw]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0]?.isIntersecting ?? true;
      renderVisibleRef.current = visible;
      if (visible) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(time => drawRef.current(time));
      } else cancelAnimationFrame(frameRef.current);
    }, { threshold: 0.01 });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [loaded]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const containWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      changeZoom(event.deltaY > 0 ? 1.1 : .9);
    };
    canvas.addEventListener('wheel', containWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', containWheel);
  }, [changeZoom, loaded]);

  if (!loaded || !islands) return <div className="grid h-[250px] place-items-center text-[10px] text-th-muted animate-pulse">Mapping topology…</div>;
  return (
    <div className="relative overflow-hidden border border-th-hub-border bg-th-surface">
      <canvas ref={canvasRef} className={`block w-full touch-none ${navigationTool === 'orbit' ? 'cursor-grab active:cursor-grabbing' : 'cursor-move'}`} style={{ height: expanded ? 'calc(100vh - 6rem)' : 250 }} role="img" aria-label="Interactive WebGL map of Wiki topology"
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { active: true, x: event.clientX, y: event.clientY, distance: 0 }; }}
        onPointerMove={event => { const drag = dragRef.current; if (!drag.active) return; const dx = event.clientX - drag.x, dy = event.clientY - drag.y; drag.distance += Math.hypot(dx, dy); drag.x = event.clientX; drag.y = event.clientY; cameraFlightRef.current = null; const camera = cameraRef.current; if (navigationTool === 'pan') { const eye: Vec3 = [camera.target[0] + Math.sin(camera.yaw) * Math.cos(camera.pitch) * camera.distance, camera.target[1] + Math.sin(camera.pitch) * camera.distance, camera.target[2] + Math.cos(camera.yaw) * Math.cos(camera.pitch) * camera.distance], forward = normalize(subtract(camera.target, eye)), right = normalize(cross(forward, [0, 1, 0])), up = normalize(cross(right, forward)), scale = camera.distance * .0018; camera.target = [camera.target[0] - right[0] * dx * scale + up[0] * dy * scale, camera.target[1] - right[1] * dx * scale + up[1] * dy * scale, camera.target[2] - right[2] * dx * scale + up[2] * dy * scale]; } else { camera.yaw -= dx * .0065; camera.pitch = Math.max(-1.42, Math.min(1.42, camera.pitch + dy * .005)); } }}
        onPointerUp={event => { const wasClick = dragRef.current.distance < 5; dragRef.current.active = false; event.currentTarget.releasePointerCapture(event.pointerId); if (wasClick) setSelectedId(nearestAt(event.clientX, event.clientY)?.id ?? null); }}
        onDoubleClick={event => { const nearest = nearestAt(event.clientX, event.clientY); if (nearest) focusNode(nearest.id); else resetView(); }} />
      {webglUnavailable && <div className="absolute inset-0 grid place-items-center bg-th-base/90 p-6 text-center text-[10px] text-th-muted">WebGL is unavailable in this browser.</div>}
      <div className="pointer-events-none absolute left-2 top-2 text-[8px] uppercase tracking-[.12em] text-th-muted"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />Topology map · click a node</div>
      <div className="absolute right-1.5 top-1.5 flex items-center border border-th-hub-border bg-th-base/90 text-[8px] font-mono backdrop-blur-sm">
        <button type="button" onClick={() => setNavigationTool('orbit')} className={`h-6 px-1.5 border-r border-th-hub-border ${navigationTool === 'orbit' ? 'text-violet-300 bg-violet-400/10' : 'text-th-muted hover:text-th-primary'}`}>3D</button>
        <button type="button" onClick={() => setNavigationTool('pan')} className={`h-6 px-1.5 border-r border-th-hub-border ${navigationTool === 'pan' ? 'text-violet-300 bg-violet-400/10' : 'text-th-muted hover:text-th-primary'}`}>PAN</button>
        <button type="button" onClick={() => changeZoom(.78)} className="grid h-6 w-6 place-items-center border-r border-th-hub-border text-th-muted hover:text-th-primary" aria-label="Zoom in">+</button>
        <button type="button" onClick={() => changeZoom(1.28)} className="grid h-6 w-6 place-items-center border-r border-th-hub-border text-th-muted hover:text-th-primary" aria-label="Zoom out">−</button>
        <button type="button" onClick={resetView} className="grid h-6 px-1.5 place-items-center text-th-muted hover:text-th-primary">FIT</button>
      </div>
      {selectedNote && <div className="absolute inset-x-2 bottom-2 border border-violet-400/25 bg-th-base/94 p-2 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-medium text-th-primary">{noteLabel(selectedNote)}</div><div className="mt-0.5 text-[8px] uppercase tracking-[.1em] text-th-muted">{selectedComponent ? `island #${selectedComponent.id} · ${selectedComponent.size} nodes` : 'isolated node'}{selectedCut ? ` · cut ${selectedCut.sides.map(side => side.size).join(' / ')}` : ''}</div></div>
          <button type="button" onClick={() => focusNode(selectedNote.id)} className="text-[8px] uppercase tracking-[.08em] text-violet-400 hover:text-violet-300">focus</button>{onOpenNode && <button type="button" onClick={() => onOpenNode(selectedNote.id)} className="text-[8px] uppercase tracking-[.08em] text-violet-400 hover:text-violet-300">open ↗</button>}<button type="button" onClick={() => setSelectedId(null)} className="text-[12px] leading-none text-th-muted hover:text-th-primary" aria-label="Clear selection">×</button></div>
        {selectedNeighbors.length > 0 && <div className="mt-2 border-t border-th-hub-border pt-1.5"><div className="mb-1 text-[7px] uppercase tracking-[.12em] text-th-muted">directly connected · {selectedNeighbors.length}</div><div className="flex flex-wrap gap-1">{selectedNeighbors.slice(0, 6).map(note => <button key={note.id} type="button" onClick={() => focusNode(note.id)} className="max-w-[9rem] truncate border border-violet-400/20 px-1.5 py-0.5 text-[8px] text-violet-300 hover:bg-violet-400/10">{noteLabel(note)}</button>)}{selectedNeighbors.length > 6 && <span className="px-1 py-0.5 text-[8px] text-th-muted">+{selectedNeighbors.length - 6}</span>}</div></div>}
        {selectedCut && <div className="mt-1.5 flex flex-wrap gap-2">{selectedCut.sides.map((side, index) => <span key={index} className="flex items-center gap-1 text-[8px] text-th-secondary"><i className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `rgb(${SIDE_COLORS[index % SIDE_COLORS.length].slice(0, 3).map(v => Math.round(v * 255)).join(',')})` }} />side {String.fromCharCode(65 + index)} · {side.size}</span>)}</div>}
      </div>}
    </div>
  );
};
