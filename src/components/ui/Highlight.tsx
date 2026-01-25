// Text highlighting for search results

import React from 'react';

interface HighlightProps {
  text: string;
  query: string;
  className?: string;
}

export const Highlight: React.FC<HighlightProps> = ({ text, query, className }) => {
  if (!query) return <span className={className}>{text}</span>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ?
          <span key={i} className="bg-yellow-200 text-black px-0.5 rounded-sm">{part}</span> :
          part
      )}
    </span>
  );
};
