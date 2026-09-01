import React, { useCallback, useEffect, useRef } from 'react';
import { Logo } from './icons';

const VIEWBOX_WIDTH = 992;
const VIEWBOX_HEIGHT = 1072;
const DEPTH = 10;

/** Rasterized once, then animated as one compositor layer. */
export const ContactLogoSculpture: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const pathData = sourceRef.current?.querySelector('path')?.getAttribute('d');
    if (!canvas || !pathData) return;

    const bounds = canvas.getBoundingClientRect();
    // Deliberately soft: the 108rem watermark does not need screen resolution.
    const dpr = Math.min(window.devicePixelRatio || 1, 0.42);
    canvas.width = Math.round(bounds.width * dpr);
    canvas.height = Math.round(bounds.height * dpr);
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue('--text-heading').trim() || '#20231f';
    const ground = css.getPropertyValue('--bg-base').trim() || '#f4f2ec';
    const logo = new Path2D(pathData);
    const scale = Math.min((bounds.width - 108) / VIEWBOX_WIDTH, (bounds.height - 90) / VIEWBOX_HEIGHT);
    const originX = (bounds.width - VIEWBOX_WIDTH * scale) / 2 - 10;
    const originY = (bounds.height - VIEWBOX_HEIGHT * scale) / 2 - 14;

    // One restrained astronomical source, baked into the bitmap.
    const starX = originX + VIEWBOX_WIDTH * scale * 0.82;
    const starY = originY + VIEWBOX_HEIGHT * scale * 0.16;
    const star = context.createRadialGradient(starX, starY, 0, starX, starY, 170 * scale);
    star.addColorStop(0, 'rgba(255,246,218,.48)');
    star.addColorStop(0.025, 'rgba(255,238,190,.24)');
    star.addColorStop(0.18, 'rgba(255,232,184,.055)');
    star.addColorStop(1, 'rgba(255,232,184,0)');
    context.fillStyle = star;
    context.fillRect(starX - 180 * scale, starY - 180 * scale, 360 * scale, 360 * scale);

    for (let layer = DEPTH; layer >= 1; layer -= 1) {
      context.save();
      context.translate(originX - layer * 1.25, originY + layer * 1.65);
      context.scale(scale, scale);
      context.globalAlpha = 0.09 + (layer / DEPTH) * 0.12;
      context.fillStyle = ink;
      context.fill(logo, 'evenodd');
      context.restore();
    }

    context.save();
    context.translate(originX, originY);
    context.scale(scale, scale);
    context.globalAlpha = 0.96;
    const face = context.createLinearGradient(90, 980, 900, 80);
    face.addColorStop(0, ground);
    face.addColorStop(0.52, ground);
    face.addColorStop(0.77, ink);
    face.addColorStop(0.82, ground);
    face.addColorStop(1, ground);
    context.fillStyle = face;
    context.fill(logo, 'evenodd');

    // Broad machined facets, visible only where the grazing light catches them.
    context.clip(logo, 'evenodd');
    const glint = context.createLinearGradient(390, 900, 800, 120);
    glint.addColorStop(0, 'rgba(255,255,255,0)');
    glint.addColorStop(0.46, 'rgba(255,255,255,.035)');
    glint.addColorStop(0.5, 'rgba(255,255,255,.22)');
    glint.addColorStop(0.54, 'rgba(255,255,255,.025)');
    glint.addColorStop(1, 'rgba(255,255,255,0)');
    context.globalAlpha = 0.7;
    context.fillStyle = glint;
    context.fillRect(80, 40, 850, 930);

    context.globalAlpha = 0.055;
    context.fillStyle = ink;
    context.beginPath();
    context.moveTo(470, 90);
    context.lineTo(887, 360);
    context.lineTo(686, 766);
    context.lineTo(541, 690);
    context.closePath();
    context.fill();
    context.restore();

    context.save();
    context.translate(originX, originY);
    context.scale(scale, scale);
    context.globalAlpha = 0.34;
    context.strokeStyle = ink;
    context.lineWidth = 3.5 / scale;
    context.lineJoin = 'miter';
    context.stroke(logo);
    context.restore();
  }, []);

  useEffect(() => {
    let timer = window.setTimeout(render, 80);
    const scheduleRender = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(render, 120);
    };
    window.addEventListener('resize', scheduleRender, { passive: true });
    const themeObserver = new MutationObserver(scheduleRender);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', scheduleRender);
      themeObserver.disconnect();
    };
  }, [render]);

  return (
    <div className="contact-logo-stage" aria-hidden="true">
      <canvas ref={canvasRef} className="contact-logo-monolith" />
      <div ref={sourceRef} className="contact-logo-source"><Logo /></div>
    </div>
  );
};
