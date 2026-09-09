// Proximity reveal: true while the pointer is within `edge` px of the bottom
// of the window, false once it moves away or leaves the window. Used by the
// navigation bar in the wiki, where it stays out of sight until the reader
// reaches for it. Pointer-only: callers fall back to the scroll reveal on
// devices without hover.

import { useEffect, useState } from 'react';

export function useProximityReveal(enabled: boolean, edge = 120): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!enabled) { setNear(false); return; }
    let frame = 0;
    let lastY = -1;
    const onMove = (event: PointerEvent) => {
      lastY = event.clientY;
      // A control that lives near the bottom edge (the graph's timeline bar) marks itself
      // data-nav-quiet: the bar must not slide in over it while the pointer is on it.
      const quiet = !!(event.target as Element | null)?.closest?.('[data-nav-quiet]');
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; setNear(!quiet && lastY >= window.innerHeight - edge); });
    };
    const onLeave = () => setNear(false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, edge]);
  return near;
}
