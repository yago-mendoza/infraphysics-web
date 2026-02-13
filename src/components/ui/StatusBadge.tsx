// Status indicator with icon and label

import React from 'react';
import { CircleIcon, CheckCircleIcon } from '../icons';
import { PostStatus } from '../../types';
import { STATUS_CONFIG } from '../../config/categories';

interface StatusBadgeProps {
  status: PostStatus;
  label?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'ongoing':   <CircleIcon />,
  'deployed':  <CheckCircleIcon />,
  'completed': <CheckCircleIcon />,
  'arrested':  <CircleIcon />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  const icon = iconMap[status] || <CircleIcon />;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm border"
      style={{
        color: cfg.accent,
        borderColor: `color-mix(in srgb, ${cfg.accent} 40%, transparent)`,
        background: `color-mix(in srgb, ${cfg.accent} 8%, transparent)`,
      }}
    >
      {icon}
      {label || cfg.label}
    </span>
  );
};
