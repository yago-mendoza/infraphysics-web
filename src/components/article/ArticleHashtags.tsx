import React from 'react';

interface ArticleHashtagsProps {
  tags?: string[] | null;
  technologies?: string[];
}

export const ArticleHashtags: React.FC<ArticleHashtagsProps> = ({ tags, technologies }) => {
  if (!tags?.length && !technologies?.length) return null;
  return (
    <div className="article-hashtags">
      {[
        ...(tags || []).map(t => ({ label: t, tech: false })),
        ...(technologies || []).map(t => ({ label: t, tech: true })),
      ]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(({ label, tech }) => (
          <span key={label} className={`article-hashtag${tech ? ' article-hashtag-tech' : ''}`}>#{label}</span>
        ))}
    </div>
  );
};
