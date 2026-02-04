export type Category = 'projects' | 'threads' | 'bits2bricks' | 'fieldnotes';

export type PostStatus = 'ongoing' | 'implemented' | 'active' | 'in-progress' | 'completed' | 'archived';

export interface Post {
  id: string;
  title: string;
  displayTitle?: string; // Human readable title without dashes
  category: Category;
  content: string;
  date: string;
  description: string;
  thumbnail?: string; // Optional image URL for list view
  thumbnailAspect?: string | null; // How much of the image to show: 'full' | 'wide' | 'banner' | 'strip'
  thumbnailShading?: string | null; // Image shading level: 'none' | 'light' | 'heavy' (default: heavy)
  // Extended metadata for case studies
  status?: PostStatus;
  github?: string; // GitHub repository URL
  demo?: string; // Live demo URL
  caseStudy?: string; // External case study URL
  technologies?: string[]; // Tech stack used
  duration?: string; // Project duration
  featured?: boolean; // Whether to feature this post
  tags?: string[] | null; // Concept/topic tags (rendered as pills)
  author?: string | null; // Post author name
  subtitle?: string | null; // Subtitle shown below displayTitle
  notes?: string[] | string | null; // Author notes / commentary (array of lines or single string)
  context?: string | null; // Short context blurb for blog posts (threads, bits2bricks)
  related?: string[] | null; // Explicit related post IDs (from target category)
  // Fieldnotes-specific (only present for category === 'fieldnotes')
  address?: string;
  addressParts?: string[];
  references?: string[];      // outgoing [[...]] addresses
  trailingRefs?: string[];    // trailing [[...]] for "Related" section
}