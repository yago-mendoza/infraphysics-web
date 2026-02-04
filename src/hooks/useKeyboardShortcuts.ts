// Keyboard shortcut hook — registers keydown listener with input/modal guards

import { useEffect } from 'react';

export interface ShortcutDef {
  key: string;        // e.g. 'g', 't', '.'
  shift?: boolean;    // require shift held
  label: string;      // human-readable label for UI
  action: () => void;
  enabled?: boolean;  // default true
}

/**
 * Registers a `keydown` listener that matches against the given shortcut definitions.
 * Suppressed when focus is in an input/textarea/contentEditable, or when Ctrl/Meta/Alt are held.
 * `disabled` flag globally disables all shortcuts (e.g. when SearchPalette is open).
 */
export function useKeyboardShortcuts(shortcuts: ShortcutDef[], disabled?: boolean) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;

      // Don't fire inside inputs, textareas, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      // Don't fire when Ctrl/Meta/Alt are held (those are browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      for (const def of shortcuts) {
        if (def.enabled === false) continue;
        const wantShift = def.shift ?? false;
        if (e.shiftKey !== wantShift) continue;
        if (e.key.toLowerCase() === def.key.toLowerCase()) {
          e.preventDefault();
          def.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts, disabled]);
}
