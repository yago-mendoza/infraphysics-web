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
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    const el = spanRef.current;
    if (!el) return;

    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    const setFade = (opacity: number, y: number, animate: boolean) => {
      el.style.transition = animate ? `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease` : 'none';
      el.style.opacity = String(opacity);
      el.style.transform = `translateY(${y}px)`;
    };

    const typeIn = async (s: string) => {
      for (let i = 1; i <= s.length; i++) {
        if (cancelRef.current) return;
        el.textContent = s.slice(0, i);
        await wait(TYPE_IN.min + Math.random() * TYPE_IN.jitter);
      }
    };

    const typeOut = async (s: string) => {
      for (let i = s.length - 1; i >= 0; i--) {
        if (cancelRef.current) return;
        el.textContent = i === 0 ? '\u200B' : s.slice(0, i);
        await wait(TYPE_OUT.min + Math.random() * TYPE_OUT.jitter);
      }
    };

    const loop = async () => {
      let ci = 0;
      while (!cancelRef.current) {
        // Official: fade in, hold, fade out
        el.textContent = OFFICIAL;
        setFade(0, 8, false);
        await wait(30);
        setFade(1, 0, true);
        await wait(FADE_MS);
        if (cancelRef.current) return;
        await wait(OFFICIAL_HOLD);
        if (cancelRef.current) return;
        setFade(0, -8, true);
        await wait(FADE_MS);
        if (cancelRef.current) return;
        await wait(PAUSE_BETWEEN);

        // Creative: type in, pause, type out
        setFade(1, 0, false);
        el.textContent = '\u200B';
        await typeIn(creatives[ci % creatives.length]);
        if (cancelRef.current) return;
        await wait(PAUSE_AFTER_TYPE);
        if (cancelRef.current) return;
        await typeOut(creatives[ci % creatives.length]);
        if (cancelRef.current) return;
        await wait(PAUSE_BETWEEN);

        ci++;
      }
    };

    loop();
    return () => { cancelRef.current = true; };
  }, []);

  return <span ref={spanRef} className="inline-block">{OFFICIAL}</span>;
};
