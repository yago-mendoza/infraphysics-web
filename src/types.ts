export type Category = 'main' | 'projects' | 'threads' | 'bits2bricks' | 'fieldnotes';

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'in-progress';

export interface Post {
  id: string;
  title: string;
  displayTitle?: string; // Human readable title without dashes
  category: Category;
  content: string;
  date: string;
  description: string;
  thumbnail?: string; // Optional image URL for list view
  // Extended metadata for case studies
  status?: ProjectStatus;
  github?: string; // GitHub repository URL
  demo?: string; // Live demo URL
  technologies?: string[]; // Tech stack used
  duration?: string; // Project duration
  featured?: boolean; // Whether to feature this post
  tags?: string[]; // Content tags for filtering
  // Fieldnotes-specific (only present for category === 'fieldnotes')
  address?: string;
  addressParts?: string[];
  references?: string[];      // outgoing [[...]] addresses
  trailingRefs?: string[];    // trailing [[...]] for "Related" section
}

export interface NavigationItem {
  label: string;
  path: string;
  colorClass: string;
}

// Author/Profile information
export interface AuthorProfile {
  name: string;
  role: string;
  bio: string;
  shortBio: string;
  avatar?: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
    website?: string;
  };
  skills: string[];
  location?: string;
}