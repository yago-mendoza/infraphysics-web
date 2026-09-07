// Reveal-on-scroll-up: true while the user is scrolling towards the top of
// the page or has reached its end, false once they scroll down again. Used by
// the navigation bars on article pages, where the nav should stay out of the
// way while reading but be one upward flick away, and waiting at the bottom.

import { useEffect, useState } from 'react';

const THRESHOLD = 6;      // px of movement before the direction is trusted
const END_MARGIN = 160;   // px from the document end that count as "arrived"

export function useRevealOnScrollUp(enabled: boolean): boolean {
  const [revealed, setRevealed] = useState(!enabled);
  useEffect(() => {
    if (!enabled) { setRevealed(true); return; }
    setRevealed(false);
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - last;
        const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - END_MARGIN;
        if (atEnd || delta < -THRESHOLD) setRevealed(true);
        else if (delta > THRESHOLD) setRevealed(false);
        last = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [enabled]);
  return revealed;
}
