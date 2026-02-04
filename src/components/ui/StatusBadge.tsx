// Status indicator with icon and label

import React from 'react';
import { CircleIcon, CheckCircleIcon } from '../icons';
import { PostStatus } from '../../types';

interface StatusBadgeProps {
  status: PostStatus;
  label?: string;
}

const statusConfig: Record<PostStatus, { color: string; text: string; icon: React.ReactNode }> = {
  'ongoing':     { color: 'bg-violet-500', text: 'Ongoing', icon: <CircleIcon /> },
  'implemented': { color: 'bg-amber-700', text: 'Implemented', icon: <CheckCircleIcon /> },
  'active':      { color: 'bg-emerald-600', text: 'Active', icon: <CircleIcon /> },
  'in-progress': { color: 'bg-amber-500', text: 'In Progress', icon: <CircleIcon /> },
  'completed':   { color: 'bg-blue-600', text: 'Completed', icon: <CheckCircleIcon /> },
  'archived':    { color: 'bg-gray-500', text: 'Archived', icon: <CheckCircleIcon /> },
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
