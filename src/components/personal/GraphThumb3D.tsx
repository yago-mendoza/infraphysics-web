// Frozen 3D view of the wiki graph for the Home page: the build-time layout
// (x, y, z) rendered once with three.js as lit spheres and thin edges, from a
// fixed viewpoint, with fog for depth. No animation loop: one frame at mount,
// one on resize, one on theme change. three.js loads on demand so the Home
// bundle stays small. Painted like the wiki's own 3D view: root-family
// colours on the spheres, edges coloured by type, fog in the page background.

import React, { useEffect, useRef } from 'react';
import thumb from '../../data/graph-thumb.generated.json';

interface ThumbNode { id: string; x: number; y: number; z: number; r: number; c: string; p: number }
interface ThumbData { total: number; nodes: ThumbNode[]; links: [number, number, number][] }

const data = thumb as ThumbData;
const YAW = -0.55, PITCH = 0.28, DISTANCE = 108;
// Edge colours match EDGE_COLORS in components/graph/useGraphData.ts (body, interaction, hierarchy).
const EDGE_STROKES = ['#60a5fa', '#f59e0b', '#4ade80'];

const cssColor = (element: Element, name: string, fallback: string) => {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return value || fallback;
};

export const GraphThumb3D: React.FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 1, 1000);
      camera.position.set(DISTANCE * Math.sin(YAW) * Math.cos(PITCH), DISTANCE * Math.sin(PITCH), DISTANCE * Math.cos(YAW) * Math.cos(PITCH));
      camera.lookAt(0, 0, 0);

      // Nodes: one instanced sphere mesh, scaled by centrality.
      const nodes = data.nodes;
      const geometry = new THREE.SphereGeometry(1, 12, 10);
      const material = new THREE.MeshStandardMaterial({ roughness: .55, metalness: .08 });
      const spheres = new THREE.InstancedMesh(geometry, material, nodes.length);
      const dummy = new THREE.Object3D();
      nodes.forEach((node, i) => {
        dummy.position.set(node.x - 50, 50 - node.y, node.z);
        const scale = .5 + Math.pow(node.p, .8) * 1.7;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        spheres.setMatrixAt(i, dummy.matrix);
      });
      scene.add(spheres);

      // Edges: one line-segments geometry.
      const positions = new Float32Array(data.links.length * 6);
      data.links.forEach(([a, b], i) => {
        const from = nodes[a], to = nodes[b], o = i * 6;
        positions[o] = from.x - 50; positions[o + 1] = 50 - from.y; positions[o + 2] = from.z;
        positions[o + 3] = to.x - 50; positions[o + 4] = 50 - to.y; positions[o + 5] = to.z;
      });
      const edgeColors = new Float32Array(data.links.length * 6);
      const edgeTint = new THREE.Color();
      data.links.forEach(([, , type], i) => {
        edgeTint.set(EDGE_STROKES[type] ?? EDGE_STROKES[0]);
        const o = i * 6;
        edgeColors[o] = edgeColors[o + 3] = edgeTint.r; edgeColors[o + 1] = edgeColors[o + 4] = edgeTint.g; edgeColors[o + 2] = edgeColors[o + 5] = edgeTint.b;
      });
      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      edgeGeometry.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3));
      const edgeMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .3, depthWrite: false });
      scene.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

      // Light: soft hemisphere plus one key light from the upper left.
      scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3230, .85));
      const key = new THREE.DirectionalLight(0xffffff, 1.15);
      key.position.set(-70, 110, 90);
      scene.add(key);

      const render = () => {
        const width = canvas.clientWidth || 1, height = canvas.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      // Root-family colours on the spheres, as in the wiki; fog fades into the page background.
      const applyTheme = () => {
        const light = document.documentElement.dataset.theme === 'light';
        const color = new THREE.Color();
        nodes.forEach((node, i) => { color.set(node.c); if (light) color.lerp(new THREE.Color(0x000000), .12); spheres.setColorAt(i, color); });
        if (spheres.instanceColor) spheres.instanceColor.needsUpdate = true;
        edgeMaterial.opacity = light ? .4 : .3;
        const background = new THREE.Color(cssColor(canvas, '--bg-base', light ? '#f4f2ec' : '#0b0b0f'));
        scene.fog = new THREE.Fog(background, DISTANCE * .9, DISTANCE * 2.1);
        render();
      };
      applyTheme();

      const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => render()) : null;
      resize?.observe(canvas);
      const themeWatch = new MutationObserver(applyTheme);
      themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      cleanup = () => {
        resize?.disconnect();
        themeWatch.disconnect();
        geometry.dispose(); material.dispose(); edgeGeometry.dispose(); edgeMaterial.dispose();
        renderer.dispose();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, []);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
};
