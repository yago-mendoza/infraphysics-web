export type Category = 'projects' | 'threads' | 'bits2bricks' | 'fieldnotes';

export type PostStatus = 'ongoing' | 'implemented' | 'active' | 'in-progress' | 'completed' | 'archived';

/* ── Base fields shared by every content type ── */

interface BasePost {
  id: string;
  title: string;
  displayTitle?: string;
  content: string;
  date: string;
  description: string;
  tags?: string[] | null;
  author?: string | null;
  thumbnail?: string;
  thumbnailAspect?: string | null;
  thumbnailShading?: string | null;
  subtitle?: string | null;
  notes?: string[] | string | null;
  related?: string[] | null;
  featured?: boolean;
}

/* ── Category-specific extensions ── */

export interface ProjectPost extends BasePost {
  category: 'projects';
  status?: PostStatus;
  github?: string;
  demo?: string;
  caseStudy?: string;
  technologies?: string[];
  duration?: string;
}

export interface ArticlePost extends BasePost {
  category: 'threads' | 'bits2bricks';
}

export interface FieldNote extends BasePost {
  category: 'fieldnotes';
  address: string;
  addressParts?: string[];
  references?: string[];
  trailingRefs?: string[];
}

/* ── Discriminated union ── */

export type Post = ProjectPost | ArticlePost | FieldNote;
