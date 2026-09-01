import React, { useId, useRef } from 'react';

const gearOutline = (teeth = 12, cx = 32, cy = 32) => {
  const points: Array<{ x: number; y: number }> = [];
  // Broad chord at the tip and straight radial flanks: a deliberately chunky,
  // trapezoidal tooth rather than a pointed decorative star profile.
  const profile = [
    { phase: 0, radius: 21 }, { phase: .18, radius: 21 },
    { phase: .36, radius: 29 }, { phase: .64, radius: 29 },
    { phase: .82, radius: 21 }, { phase: 1, radius: 21 },
  ];
  for (let tooth = 0; tooth < teeth; tooth += 1) {
    for (const step of profile) {
      const angle = ((tooth + step.phase) / teeth) * Math.PI * 2 - Math.PI / 2;
      points.push({ x: cx + Math.cos(angle) * step.radius, y: cy + Math.sin(angle) * step.radius });
    }
  }
  const rounded: string[] = [];
  const corner = .16;
  for (let index = 0; index < points.length; index++) {
    const previous = points[(index - 1 + points.length) % points.length];
    const point = points[index];
    const next = points[(index + 1) % points.length];
    const entryX = point.x + (previous.x - point.x) * corner;
    const entryY = point.y + (previous.y - point.y) * corner;
    const exitX = point.x + (next.x - point.x) * corner;
    const exitY = point.y + (next.y - point.y) * corner;
    rounded.push(`${index ? 'L' : 'M'} ${entryX},${entryY} Q ${point.x},${point.y} ${exitX},${exitY}`);
  }
  return `${rounded.join(' ')} Z`;
};

export const SketchGear: React.FC<{ className?: string }> = ({ className = '' }) => {
  const wheelRef = useRef<SVGGElement>(null);
  const cutoutId = `gear-cutouts-${useId().replace(/:/g, '')}`;
  const setRate = (rate: number) => wheelRef.current?.getAnimations()[0]?.updatePlaybackRate(rate);
  const holes = Array.from({ length: 6 }, (_, index) => {
    const angle = index * Math.PI / 3 - Math.PI / 2;
    return { x: 32 + Math.cos(angle) * 13, y: 32 + Math.sin(angle) * 13 };
  });

  return (
    <svg
      className={`sketch-gear ${className}`}
      viewBox="0 0 64 64"
      aria-hidden="true"
      onPointerEnter={() => setRate(1.75)}
      onPointerLeave={() => setRate(1)}
    >
      <defs>
        <mask id={cutoutId} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <path d={gearOutline()} fill="white" />
          {holes.map((hole, index) => <circle key={index} cx={hole.x} cy={hole.y} r="2.8" fill="black" />)}
          <circle cx="32" cy="32" r="3.7" fill="black" />
        </mask>
      </defs>
      <g className="home-gear-construction">
        <line x1="2" y1="32" x2="62" y2="32" />
        <line x1="32" y1="2" x2="32" y2="62" />
        <line className="home-gear-secant" x1="8" y1="53" x2="57" y2="12" />
        <circle className="home-gear-construction-point" cx="13" cy="49" r="1.35" />
        <circle className="home-gear-construction-point" cx="52" cy="16" r="1.35" />
      </g>
      <g ref={wheelRef} className="home-portrait-gear-wheel">
        <path className="home-gear-profile" d={gearOutline()} mask={`url(#${cutoutId})`} />
        <circle className="home-gear-pitch" cx="32" cy="32" r="25" />
        <circle className="home-gear-root" cx="32" cy="32" r="21" />
        {holes.map(({ x, y }, index) => {
          return <g key={index}>
            <line className="home-gear-spoke" x1="32" y1="32" x2={x} y2={y} />
            <circle className="home-gear-hole" cx={x} cy={y} r="2.8" />
          </g>;
        })}
        <circle className="home-gear-hub" cx="32" cy="32" r="7" />
        <circle className="home-gear-bore" cx="32" cy="32" r="3.7" />
        <path className="home-gear-keyway" d="M30.7 28.4 V24.8 H33.3 V28.4" />
      </g>
    </svg>
  );
};
