// Content processing utilities

/**
 * Strip HTML tags from a string, returning plain text
 */
export const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Calculate reading time in minutes based on word count
 */
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Extract keywords/tags from content for interconnections
 */
export const extractKeywords = (content: string): string[] => {
  const commonWords = [
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'in',
    'for', 'on', 'with', 'as', 'by', 'at', 'from', 'or', 'be', 'this', 'that',
    'it', 'not', 'but', 'what', 'all', 'when', 'we', 'can', 'there', 'use',
    'each', 'which', 'do', 'how', 'if', 'will', 'way', 'about', 'many', 'then',
    'them', 'would', 'like', 'so', 'these', 'her', 'him', 'has', 'more', 'could',
    'up', 'out', 'go', 'see', 'no', 'its', 'i'
  ];

  const words = content.toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !commonWords.includes(w));

  // Count occurrences and return top keywords
  const counts: Record<string, number> = {};
  words.forEach(w => { counts[w] = (counts[w] || 0) + 1; });

  return Object.entries(counts)
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};
