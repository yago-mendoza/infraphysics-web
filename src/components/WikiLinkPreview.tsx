import React from 'react';
import { createPortal } from 'react-dom';

interface WikiLinkPreviewProps {
  visible: boolean;
  title: string;
  address: string;
  description: string;
  x: number;
  y: number;
}

export const WikiLinkPreview: React.FC<WikiLinkPreviewProps> = ({
  visible,
  title,
  address,
  description,
  x,
  y,
}) => {
  if (!visible) return null;

  const cardWidth = 320;
  const cardHeight = 160;
  const margin = 12;

  let left = x + margin;
  if (left + cardWidth > window.innerWidth - margin) left = x - cardWidth - margin;

  let top = y + margin;
  if (top + cardHeight > window.innerHeight - margin) top = y - cardHeight - margin;

  left = Math.max(margin, Math.min(left, window.innerWidth - cardWidth - margin));
  top = Math.max(margin, top);

  return createPortal(
    <div className="wiki-preview-card" style={{ left, top, pointerEvents: 'none' }}>
      <div className="wiki-preview-title">{title}</div>
      {description && <div className="wiki-preview-description">{description}</div>}
      <div className="wiki-preview-address">
        {address.replace(/\/\//g, ' / ')}
      </div>
    </div>,
    document.body,
  );
};
