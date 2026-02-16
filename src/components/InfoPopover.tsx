// Contextual help popover — renders a small "?" icon that opens an inline tooltip/panel.
// Supports single-panel or tabbed content. Singleton: only one popover open at a time.

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { InfoIcon } from './icons';

// --- Exported helper classes for consistent tip formatting ---
export const tipStrong = 'text-th-primary';
export const tipAccent = 'text-violet-400';
export const tipCode = 'text-violet-400/80';

export interface InfoPopoverTab {
  label: string;
  content: React.ReactNode;
}

interface InfoPopoverProps {
  content?: React.ReactNode;       // single panel (no tabs)
  tabs?: InfoPopoverTab[];          // tabbed panels (mutually exclusive with content)
  size?: number;                    // icon size, default 11
  className?: string;               // extra class on the trigger <button>
  title?: string;                   // tooltip on hover
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({
  content,
  tabs,
  size = 13,
  className = '',
  title,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  // Compute position relative to trigger
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const hasTabs = tabs && tabs.length > 0;
    const panelW = hasTabs ? 340 : 280;
    const panelMaxH = window.innerHeight * 0.6;

    let top = rect.bottom + 6;
    let left = rect.left;

    // Flip up if would overflow bottom
    if (top + panelMaxH > window.innerHeight - 8) {
      top = rect.top - 6; // will be adjusted by transform below
    }

    // Flip left if would overflow right
    if (left + panelW > window.innerWidth - 8) {
      left = rect.right - panelW;
    }

    // Clamp
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    setPos({ top, left });
  }, [tabs]);

  // Open handler
  const handleOpen = useCallback(() => {
    // Dispatch singleton event — closes all other popovers
    window.dispatchEvent(new CustomEvent('info-popover-open', { detail: { id: instanceId } }));
    setActiveTab(0);
    updatePosition();
    setOpen(true);
  }, [instanceId, updatePosition]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (open) handleClose();
    else handleOpen();
  }, [open, handleOpen, handleClose]);

  // Close when another popover opens
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id !== instanceId) setOpen(false);
    };
    window.addEventListener('info-popover-open', handler);
    return () => window.removeEventListener('info-popover-open', handler);
  }, [instanceId]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handler, true); // capture phase to beat other handlers
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, handleClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      handleClose();
    };
    // Use timeout so the opening click doesn't immediately close
    const id = setTimeout(() => {
      window.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener('mousedown', handler);
    };
  }, [open, handleClose]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const reposition = () => updatePosition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, updatePosition]);

  const hasTabs = tabs && tabs.length > 0;
  const body = hasTabs ? tabs[activeTab]?.content : content;

  // Determine if popover should open upward (bottom of popover at trigger top)
  const opensUp = pos && triggerRef.current
    ? pos.top <= triggerRef.current.getBoundingClientRect().top
    : false;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={`text-th-muted hover:text-violet-400 transition-colors flex-shrink-0 ${className}`}
        title={title}
        type="button"
      >
        <InfoIcon size={size} />
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          className={`fixed z-[55] border border-th-hub-border rounded-sm shadow-lg ${hasTabs ? 'max-w-sm' : 'max-w-xs'}`}
          style={{
            backgroundColor: 'var(--hub-sidebar-bg)',
            top: opensUp ? undefined : pos.top,
            bottom: opensUp ? `${window.innerHeight - (triggerRef.current?.getBoundingClientRect().top ?? pos.top) + 6}px` : undefined,
            left: pos.left,
          }}
        >
          {/* Tabs */}
          {hasTabs && (
            <div className="flex gap-1 px-3 pt-2.5 pb-1 flex-wrap">
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={`px-2 py-0.5 text-[9px] font-medium border rounded-sm transition-colors ${
                    activeTab === i
                      ? 'bg-violet-400/20 text-violet-400 border-violet-400/30'
                      : 'text-th-muted border-th-hub-border hover:text-th-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="px-3 py-2.5 max-h-[60vh] overflow-y-auto hub-scrollbar text-[11px] text-th-secondary leading-relaxed">
            {body}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
