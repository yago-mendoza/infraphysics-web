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

/* ── Fieldnote: lightweight metadata (no content) + full type ── */

export interface ConnectionRef {
  address: string;
  annotation: string | null;
}

export interface FieldNoteMeta {
  id: string;
  title: string;
  displayTitle?: string;
  category: 'fieldnotes';
  date: string;
  description: string;
  address: string;
  addressParts?: string[];
  references?: string[];
  trailingRefs?: ConnectionRef[];
  searchText?: string;
  aliases?: string[];
  status?: 'stub' | 'draft' | 'stable';
  tags?: string[];
  supersedes?: string;
}

export interface FieldNote extends FieldNoteMeta {
  content: string;
}

/** Display label: prefers displayTitle over title */
export const noteLabel = (note: { title: string; displayTitle?: string }) =>
  note.displayTitle || note.title;

/* ── Discriminated union (fieldnotes excluded — loaded via brainIndex) ── */

export type Post = ProjectPost | ArticlePost;
