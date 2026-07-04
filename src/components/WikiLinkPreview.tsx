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
  accent?: string;
}

export const WikiLinkPreview: React.FC<WikiLinkPreviewProps> = ({
  visible,
  title,
  address,
  description,
  x,
  y,
  variant = 'default',
  accent,
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

  // Portaled to <body>, so it can't inherit --wiki-link from the article wrapper.
  // Pass the article's accent through explicitly so the card matches the category.
  const cardStyle: React.CSSProperties = { left, top, pointerEvents: 'none' };
  if (accent) (cardStyle as Record<string, string | number>)['--wiki-link'] = accent;

  return createPortal(
    <div className={cls} style={cardStyle}>
      <div className="wiki-preview-title">{title}</div>
      <div className="wiki-preview-address">
        {!address.includes('//') && <span className="opacity-50">root · </span>}
        {address.replace(/\/\//g, ' / ')}
      </div>
      {description && (
        <div className="wiki-preview-description">{description}</div>
      )}
      <div className="wiki-preview-hint">open in second brain</div>
    </div>,
    document.body
  );
};
