import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, HeartIcon } from '../icons';

interface BlogMetabarProps {
  date: string;
  authorName: string;
  authorPath: string;
  readingTime: number;
  views: number | null | undefined;
  hearts: number | null | undefined;
  hearted: boolean;
  toggleHeart: () => void;
  shareDropdown: React.ReactNode;
  formatDate: (date: string) => string;
}

export const BlogMetabar: React.FC<BlogMetabarProps> = ({
  date, authorName, authorPath, readingTime,
  views, hearts, hearted, toggleHeart,
  shareDropdown, formatDate,
}) => (
  <div className="article-blog-metabar">
    <div className="article-blog-metabar-left">
      <span>{formatDate(date)}</span>
      <span className="article-blog-metabar-sep">&middot;</span>
      <span className="article-blog-metabar-author">Written by <Link to={authorPath} className="article-blog-metabar-link">{authorName}</Link></span>
      <span className="article-blog-metabar-sep">&middot;</span>
      <span>{readingTime} min read</span>
      {views != null && (
        <>
          <span className="article-blog-metabar-sep">&middot;</span>
          <span className="article-meta-views"><EyeIcon size={15} /> {views}</span>
        </>
      )}
      {hearts != null && (
        <>
          <span className="article-blog-metabar-sep">&middot;</span>
          <button onClick={toggleHeart} className="article-heart-btn" title={hearted ? 'Unlike' : 'Like'}>
            <HeartIcon size={15} filled={hearted} /> {hearts}
          </button>
        </>
      )}
    </div>
    {shareDropdown}
  </div>
);
