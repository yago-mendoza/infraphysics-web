// Status indicator with icon and label

import React from 'react';
import { CircleIcon, CheckCircleIcon } from '../icons';
import { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  label?: string;
}

const statusConfig: Record<ProjectStatus, { color: string; text: string; icon: React.ReactNode }> = {
  'ongoing': { color: 'bg-violet-500', text: 'Ongoing', icon: <CircleIcon /> },
  'implemented': { color: 'bg-amber-700', text: 'Implemented', icon: <CheckCircleIcon /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = statusConfig[status] || statusConfig['ongoing'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white rounded-sm ${config.color}`}>
      {config.icon}
      {label || config.text}
    </span>
  );
};
