import React from 'react';
import { createPortal } from 'react-dom';

interface WikiLinkPreviewProps {
  visible: boolean;
  title: string;
  address: string;
  description: string;
  x: number;
  y: number;
  variant?: 'default' | 'blue';
}

export const WikiLinkPreview: React.FC<WikiLinkPreviewProps> = ({
  visible,
  title,
  address,
  description,
  x,
  y,
  variant = 'default',
}) => {
  if (!visible) return null;

  const cardWidth = 320;
  const cardHeight = 160;
  const margin = 12;

  // Flip horizontally if too close to right edge
  let left = x + margin;
  if (left + cardWidth > window.innerWidth - margin) {
    left = x - cardWidth - margin;
  }

  // Flip vertically if too close to bottom edge
  let top = y + margin;
  if (top + cardHeight > window.innerHeight - margin) {
    top = y - cardHeight - margin;
  }

  // Clamp to viewport
  left = Math.max(margin, Math.min(left, window.innerWidth - cardWidth - margin));
  top = Math.max(margin, top);

  const cls = variant === 'blue' ? 'wiki-preview-card wiki-preview-blue' : 'wiki-preview-card';

  return createPortal(
    <div className={cls} style={{ left, top, pointerEvents: 'none' }}>
      <div className="wiki-preview-title">{title}</div>
      <div className="wiki-preview-address">{address.replace(/\/\//g, ' / ')}</div>
      {description && (
        <div className="wiki-preview-description">{description}</div>
      )}
      <div className="wiki-preview-hint">click to open in second brain</div>
    </div>,
    document.body
  );
};
