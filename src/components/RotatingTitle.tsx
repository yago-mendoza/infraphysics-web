// Rotating subtitle — official fades in/out, creatives typewrite in/out

import React, { useEffect, useRef } from 'react';

const OFFICIAL = 'Industrial engineer, Systems builder';

const creatives = [
  'Software craftsman',
  'Generalist with leverage',
  'Stack explorer',
];

const OFFICIAL_HOLD = 5700;
const FADE_MS = 400;
const TYPE_IN = { min: 40, jitter: 50 };
const TYPE_OUT = { min: 25, jitter: 30 };
const PAUSE_AFTER_TYPE = 500;
const PAUSE_BETWEEN = 200;

export const RotatingTitle: React.FC = () => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    // Each effect invocation gets its own cancel flag object.
    // Stale loops from StrictMode double-mount see their own flag go true
    // and stop, while the fresh loop keeps its own flag false.
    const cancel = { current: false };

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => {
          if (cancel.current) reject('cancelled');
          else resolve();
        }, ms);
        // If cancelled before timeout fires, we still need cleanup
        // but the reject in the timeout is sufficient
        void id;
      });

    const setFade = (opacity: number, y: number, animate: boolean) => {
      el.style.transition = animate ? `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease` : 'none';
      el.style.opacity = String(opacity);
      el.style.transform = `translateY(${y}px)`;
    };

    const typeIn = async (s: string) => {
      for (let i = 1; i <= s.length; i++) {
        if (cancel.current) return;
        el.textContent = s.slice(0, i);
        await wait(TYPE_IN.min + Math.random() * TYPE_IN.jitter);
      }
    };

    const typeOut = async (s: string) => {
      for (let i = s.length - 1; i >= 0; i--) {
        if (cancel.current) return;
        el.textContent = i === 0 ? '\u200B' : s.slice(0, i);
        await wait(TYPE_OUT.min + Math.random() * TYPE_OUT.jitter);
      }
    };

    const loop = async () => {
      let ci = 0;
      let first = true;
      try {
        while (!cancel.current) {
          // Official: fade in, hold, fade out
          el.textContent = OFFICIAL;
          if (first) {
            // Already visible on mount — skip entrance animation
            setFade(1, 0, false);
            first = false;
          } else {
            setFade(0, 8, false);
            await wait(30);
            setFade(1, 0, true);
            await wait(FADE_MS);
          }
          await wait(OFFICIAL_HOLD);
          setFade(0, -8, true);
          await wait(FADE_MS);
          await wait(PAUSE_BETWEEN);

          // Creative: type in, pause, type out
          setFade(1, 0, false);
          el.textContent = '\u200B';
          await typeIn(creatives[ci % creatives.length]);
          await wait(PAUSE_AFTER_TYPE);
          await typeOut(creatives[ci % creatives.length]);
          await wait(PAUSE_BETWEEN);

          ci++;
        }
      } catch {
        // Cancelled — loop exits silently
      }
    };

    loop();

    return () => {
      cancel.current = true;
    };
  }, []);

  return <span ref={spanRef} className="inline-block">{OFFICIAL}</span>;
};
