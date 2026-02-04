// Status indicator with icon and label

import React from 'react';
import { CircleIcon, CheckCircleIcon } from '../icons';
import { PostStatus } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface StatusBadgeProps {
  status: PostStatus;
  label?: string;
}

const statusConfig: Record<PostStatus, {
  dark: string;
  light: string;
  text: string;
  icon: React.ReactNode;
}> = {
  'ongoing':     { dark: 'bg-amber-700 text-white', light: 'border border-amber-600/40 text-amber-700 bg-amber-50', text: 'Ongoing', icon: <CircleIcon /> },
  'completed':   { dark: 'bg-blue-600 text-white', light: 'border border-blue-500/40 text-blue-700 bg-blue-50', text: 'Completed', icon: <CheckCircleIcon /> },
  'implemented': { dark: 'bg-violet-500 text-white', light: 'border border-violet-500/40 text-violet-700 bg-violet-50', text: 'Implemented', icon: <CheckCircleIcon /> },
  'active':      { dark: 'bg-emerald-600 text-white', light: 'border border-emerald-500/40 text-emerald-700 bg-emerald-50', text: 'Active', icon: <CircleIcon /> },
  'in-progress': { dark: 'bg-amber-500 text-white', light: 'border border-amber-500/40 text-amber-700 bg-amber-50', text: 'In Progress', icon: <CircleIcon /> },
  'archived':    { dark: 'bg-gray-500 text-white', light: 'border border-gray-400/40 text-gray-600 bg-gray-50', text: 'Archived', icon: <CheckCircleIcon /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = statusConfig[status] || statusConfig['ongoing'];
  const { theme } = useTheme();
  const colorClass = theme === 'light' ? config.light : config.dark;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${colorClass}`}>
      {config.icon}
      {label || config.text}
    </span>
  );
};
