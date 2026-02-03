// Post view router — delegates to ProjectPostView or DefaultPostView based on category

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts } from '../data/data';
import { ProjectPostView } from './ProjectPostView';
import { DefaultPostView } from './DefaultPostView';

export const PostView: React.FC = () => {
  const { category, id } = useParams();
  const post = posts.find(p => p.id === id && p.category === category);

  if (!post) return (
    <div className="py-20 text-center">
      <div className="text-6xl mb-4 text-th-muted">404</div>
      <p className="text-th-tertiary">Entry not found in the archive</p>
      <Link to="/home" className="inline-block mt-6 px-4 py-2 bg-th-active text-th-heading text-sm hover:bg-th-active-hover transition-colors border border-th-border">
        Return Home
      </Link>
    </div>
  );

  if (post.category === 'projects') {
    return <ProjectPostView post={post} />;
  }

  return <DefaultPostView post={post} />;
};
