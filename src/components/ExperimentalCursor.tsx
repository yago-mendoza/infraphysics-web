import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const CLICKABLE_SELECTOR = 'a, button, summary, [role="button"], [role="link"], label, [data-clickable]';

export const ExperimentalCursor: React.FC = () => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return;
    const element = ref.current;
    if (!element) return;

    let cursorVisible = false;
    let lockedMode = '';
    let lastTarget: Element | null = null;
    let lastBoundedClickable: Element | null = null;
    let clickableBoundaryTop = -Infinity;
    let lastInsideClickableBound = false;
    let positionFrame = 0;
    let boundaryFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const cursorFlags = new Map<string, boolean>();

    const setCursorFlag = (name: string, enabled: boolean) => {
      if (cursorFlags.get(name) === enabled) return;
      cursorFlags.set(name, enabled);
      element.classList.toggle(name, enabled);
    };

    const paintPosition = () => {
      positionFrame = 0;
      element.style.transform = `translate3d(${pointerX}px,${pointerY}px,0)`;
      if (!cursorVisible) {
        element.classList.add('is-visible');
        cursorVisible = true;
      }
    };

    const measureClickableBoundary = () => {
      const selector = lastBoundedClickable?.getAttribute('data-clickable-above');
      const offset = Number(lastBoundedClickable?.getAttribute('data-clickable-offset') || 0);
      clickableBoundaryTop = selector
        ? (document.querySelector(selector)?.getBoundingClientRect().top ?? -Infinity) + offset
        : -Infinity;
    };

    const updateBoundedState = (clientY: number) => {
      const inside = !!lastBoundedClickable && clientY < clickableBoundaryTop;
      if (inside === lastInsideClickableBound) return;
      lastInsideClickableBound = inside;
      setCursorFlag('is-clock-field', inside);
      setCursorFlag('is-clickable', inside || !!lastTarget?.closest(CLICKABLE_SELECTOR));
    };

    const detectMode = (event: PointerEvent, target: Element | null) => {
      const editable = target?.closest('input, textarea, [contenteditable="true"], .cm-content') as HTMLElement | null;
      const input = editable instanceof HTMLInputElement ? editable : null;
      const textInput = !!editable && (!input || !['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit'].includes(input.type));

      if (editable instanceof HTMLTextAreaElement && getComputedStyle(editable).resize !== 'none') {
        const box = editable.getBoundingClientRect();
        if (box.right - event.clientX >= 0 && box.right - event.clientX <= 11
          && box.bottom - event.clientY >= 0 && box.bottom - event.clientY <= 11) {
          const nativeCursor = getComputedStyle(editable).resize === 'vertical' ? 'ns-resize' : 'nwse-resize';
          document.documentElement.style.setProperty('--cad-native-resize-cursor', nativeCursor);
          return 'native-resize';
        }
      }

      const cursor = target ? getComputedStyle(target).cursor : '';
      if (['col-resize', 'ew-resize', 'row-resize', 'ns-resize', 'nwse-resize', 'nesw-resize'].includes(cursor)) {
        document.documentElement.style.setProperty('--cad-native-resize-cursor', cursor);
        return 'native-resize';
      }
      return textInput ? 'text' : '';
    };

    const setMode = (mode: string, usesNative = mode === 'native-resize') => {
      document.documentElement.classList.toggle('native-resize-active', mode === 'native-resize');
      setCursorFlag('is-native', usesNative);
      setCursorFlag('is-text', mode === 'text');
    };

    const detectDarkSurface = (target: Element | null, inStack: boolean) => {
      let dark = document.documentElement.getAttribute('data-theme') !== 'light';
      if (inStack) return dark;
      let surface = target;
      while (surface) {
        const background = getComputedStyle(surface).backgroundColor;
        const match = background.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?/);
        if (match && Number(match[4] ?? 1) > .22) {
          const luminance = .2126 * Number(match[1]) + .7152 * Number(match[2]) + .0722 * Number(match[3]);
          dark = luminance < 105;
          break;
        }
        surface = surface.parentElement;
      }
      return dark;
    };

    // Semantic work happens only when the pointed DOM element changes. It is
    // deliberately absent from the high-frequency cursor movement path.
    const enterTarget = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target === lastTarget) return;
      lastTarget = target;

      const inStack = !!target?.closest('.stack-page');
      const mode = lockedMode || (inStack ? '' : detectMode(event, target));
      const usesNative = mode === 'native-resize' || !!target?.closest('[data-native-cursor]');
      setMode(mode, usesNative);

      lastBoundedClickable = target?.closest('[data-clickable-above]') ?? null;
      measureClickableBoundary();
      lastInsideClickableBound = !!lastBoundedClickable && event.clientY < clickableBoundaryTop;
      setCursorFlag('is-clickable', lastInsideClickableBound || !!target?.closest(CLICKABLE_SELECTOR));
      setCursorFlag('is-clock-field', lastInsideClickableBound);
      setCursorFlag('is-stack', inStack);
      setCursorFlag('is-dark-surface', detectDarkSurface(target, inStack));
    };

    const move = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!positionFrame) positionFrame = requestAnimationFrame(paintPosition);

      if (lockedMode && event.buttons === 0) {
        lockedMode = '';
        setMode('');
      }
      if (lastBoundedClickable) updateBoundedState(event.clientY);

      // A textarea resize grip is the sole state whose hit area changes while
      // the pointer remains over the same DOM element.
      if (!lockedMode && lastTarget instanceof HTMLTextAreaElement) {
        setMode(detectMode(event, lastTarget));
      }
    };

    const down = (event: PointerEvent) => {
      const mode = detectMode(event, event.target as Element | null);
      if (mode !== 'native-resize') return;
      lockedMode = mode;
      setMode(mode);
    };

    const up = () => {
      lockedMode = '';
      document.documentElement.classList.remove('native-resize-active');
      document.documentElement.style.removeProperty('--cad-native-resize-cursor');
    };
    const hide = () => {
      if (!cursorVisible) return;
      element.classList.remove('is-visible');
      cursorVisible = false;
    };
    const leaveViewport = (event: PointerEvent | MouseEvent) => { if (!event.relatedTarget) hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    const remeasureBoundary = () => {
      if (!lastBoundedClickable || boundaryFrame) return;
      boundaryFrame = requestAnimationFrame(() => {
        boundaryFrame = 0;
        measureClickableBoundary();
      });
    };

    document.documentElement.classList.add('cad-cursor-active');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', enterTarget, { passive: true });
    document.addEventListener('pointerdown', down, { capture: true });
    window.addEventListener('pointerup', up, { capture: true });
    window.addEventListener('pointercancel', up, { capture: true });
    window.addEventListener('pointerleave', hide);
    window.addEventListener('pointerout', leaveViewport, { passive: true });
    document.addEventListener('mouseout', leaveViewport, { passive: true });
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', remeasureBoundary, { passive: true });
    window.addEventListener('resize', remeasureBoundary, { passive: true });
    document.addEventListener('visibilitychange', visibility);

    return () => {
      document.documentElement.classList.remove('cad-cursor-active', 'native-resize-active');
      document.documentElement.style.removeProperty('--cad-native-resize-cursor');
      if (positionFrame) cancelAnimationFrame(positionFrame);
      if (boundaryFrame) cancelAnimationFrame(boundaryFrame);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', enterTarget);
      document.removeEventListener('pointerdown', down, { capture: true });
      window.removeEventListener('pointerup', up, { capture: true });
      window.removeEventListener('pointercancel', up, { capture: true });
      window.removeEventListener('pointerleave', hide);
      window.removeEventListener('pointerout', leaveViewport);
      document.removeEventListener('mouseout', leaveViewport);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', remeasureBoundary);
      window.removeEventListener('resize', remeasureBoundary);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  return createPortal(
    <span ref={ref} className="experimental-cursor cad-cursor" aria-hidden="true"><i /><b /></span>,
    document.body,
  );
};
