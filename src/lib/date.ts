// Date formatting utilities

/**
 * Format date to readable format (Jan 15, 2024)
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format date for terminal display (YYYY/MM/DD)
 */
export const formatDateTerminal = (dateStr: string): string => {
  if (!dateStr) return '';
  const cleaned = String(dateStr).split('T')[0];
  return cleaned.replace(/-/g, '/');
};

/**
 * Format date for timeline display (// DATE 2025.05.22)
 */
export const formatDateTimeline = (dateStr: string): string => {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `// DATE ${y}.${m}.${d}`;
};
