import React from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { ArticlePostView } from './ArticlePostView';
import '../styles/context-preview.css';

const variants = ['Margen editorial', 'Ficha de autor', 'Nota desplegable', 'Carta personal'];

/** Visual copies of the real article: no duplicate entries in the content index. */
export const ContextPreviewView: React.FC<{ variant: number }> = ({ variant }) => {
  const post = posts.find(p => p.id === '2718281');

  return <div>
    <nav className="ctx-preview-nav" aria-label="Context note designs">
      <span>CTX / {variants[variant - 1]}</span>
      <div>{variants.map((name, index) => <Link key={name} to={`/ctx${index + 1}`} title={name}
        aria-current={variant === index + 1 ? 'page' : undefined}>{index + 1}</Link>)}
        <Link to="/lab/projects/trialgpt-clinical-trial-matching">Original</Link></div>
    </nav>
    {post && <ArticlePostView post={post} />}
  </div>;
};
