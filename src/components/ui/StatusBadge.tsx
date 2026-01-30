// Status indicator with icon and label

import React from 'react';
import { CircleIcon, CheckCircleIcon } from '../icons';
import { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig: Record<ProjectStatus, { color: string; text: string; icon: React.ReactNode }> = {
  'active': { color: 'bg-emerald-500', text: 'Active', icon: <CircleIcon /> },
  'completed': { color: 'bg-blue-500', text: 'Completed', icon: <CheckCircleIcon /> },
  'archived': { color: 'bg-gray-400', text: 'Archived', icon: <CircleIcon /> },
  'in-progress': { color: 'bg-amber-500', text: 'In Progress', icon: <CircleIcon /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig['active'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white rounded-sm ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
};
