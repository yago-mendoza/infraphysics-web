import React from 'react';
import { Link } from 'react-router-dom';

interface ArticleBreadcrumbsProps {
  sectionPath: string;
  breadcrumbLabel: string;
  title: string;
}

export const ArticleBreadcrumbs: React.FC<ArticleBreadcrumbsProps> = ({ sectionPath, breadcrumbLabel, title }) => (
  <nav className="article-breadcrumbs">
    <Link to="/home" className="article-breadcrumb-link">home</Link>
    <span className="article-breadcrumb-sep">/</span>
    <span className="article-breadcrumb-static">blog</span>
    <span className="article-breadcrumb-sep">/</span>
    <Link to={sectionPath} className="article-breadcrumb-link">
      {breadcrumbLabel}
    </Link>
    <span className="article-breadcrumb-sep">/</span>
    <span className="article-breadcrumb-current">
      {title.toLowerCase()}
    </span>
  </nav>
);
